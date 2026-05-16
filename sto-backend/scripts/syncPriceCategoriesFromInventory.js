/**
 * Створює відсутні записи PriceCategory для кожної унікальної назви з Category (склад).
 * Ідempotent: уже наявні співпадіння за name не змінює.
 */
const prisma = require('../lib/prisma');

async function main() {
  const rows = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  });
  const names = [...new Map(rows.map((r) => [String(r.name || '').trim(), true]).filter(([n]) => n)).keys()];

  if (!names.length) {
    console.log('У базі немає категорій складу (Category). Спочатку додайте категорії в CRM.');
    return;
  }

  for (const name of names) {
    await prisma.priceCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Категорії прайсу синхронізовано зі складом: ${names.length} унікальних назв.`);
  console.log(names.map((n) => `  · ${n}`).join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
