/**
 * Послуги з привʼязаними позиціями складу за SKU.
 * Ціна послуги > сума (ціна складу × кількість) + робочий час грн.
 * Для частини записів задається oldPrice для демонстрації знижки.
 *
 * Ідempotent за назвою послуги: якщо послуга з такою назвою вже є — пропуск.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const prisma = require('../lib/prisma');

async function skuRow(sku) {
  return prisma.inventory.findFirst({
    where: { stockKeepingUnit: sku },
    include: { category: true },
  });
}

async function priceCatIdForInventory(inv) {
  const name = inv?.category?.name;
  if (!name) return null;
  const pc = await prisma.priceCategory.findFirst({ where: { name } });
  return pc?.id ?? null;
}

const PLANS = [
  {
    name: 'Заміна комплекту ГРМ з помпою',
    time: 240,
    laborUah: 4500,
    markup: 1.22,
    oldPrice: 18500,
    recommendations:
      'Перевірити натяг ременя після обкатки 500 км. Запропонувати заміну антифризу, якщо рідина мутна.',
    lines: [{ sku: 'TB-TYT-219', qty: 1 }, { sku: 'KP-VW-EA888', qty: 1 }],
  },
  {
    name: 'Заміна осушувача кондиціонера',
    time: 90,
    laborUah: 2200,
    markup: 1.28,
    recommendations: 'Після робіт рекомендована перевірка витоків та заправка фреоном за потреби.',
    lines: [{ sku: 'ACD-MBZ-SPR', qty: 1 }],
  },
  {
    name: 'Заміна радіатора пічки',
    time: 300,
    laborUah: 3800,
    markup: 1.25,
    oldPrice: 9200,
    recommendations: 'За можливості запропонувати заміну ароматизатора садка та продув дренажних каналів.',
    lines: [{ sku: 'RH-VW-PAS', qty: 1 }],
  },
  {
    name: 'Заміна повітряного фільтра двигуна',
    time: 30,
    laborUah: 350,
    markup: 1.35,
    recommendations: 'Нагадати про інтервал заміни за регламентом ТО або за умов експлуатації.',
    lines: [{ sku: 'AF-FRD-FOC', qty: 1 }],
  },
  {
    name: 'Заміна комплекту свічок запалювання',
    time: 60,
    laborUah: 800,
    markup: 1.3,
    recommendations: 'Перевірити стан котушок і висновків. За потреби — діагностика на пропуски.',
    lines: [{ sku: 'SP-TYT-41', qty: 1 }],
  },
  {
    name: 'Прокачування гальмівної системи (рідина DOT4)',
    time: 45,
    laborUah: 900,
    markup: 1.4,
    recommendations: 'Перевірити шланги та колодки. При потребі — повна заміна рідини (2 л).',
    lines: [{ sku: 'BF-DOT4-1L', qty: 2 }],
  },
  {
    name: 'Заміна переднього крила (ліве)',
    time: 120,
    laborUah: 3200,
    markup: 1.2,
    oldPrice: 11200,
    recommendations: 'Фарбування та підгонка зазорів — окремо. Перевірити кріплення бризговиків.',
    lines: [{ sku: 'FNDL-TYT-01', qty: 1 }],
  },
  {
    name: 'Встановлення та регулювання капоту (алюміній)',
    time: 150,
    laborUah: 4200,
    markup: 1.18,
    recommendations: 'Перевірити замки, упори та зазори з крилами. За потреби — регулювання петель.',
    lines: [{ sku: 'HOD-VW-08', qty: 1 }],
  },
  {
    name: 'Заміна переднього амортизатора (газо-масляний)',
    time: 90,
    laborUah: 2800,
    markup: 1.26,
    oldPrice: 9800,
    recommendations: 'Краще міняти парою; при односторонній заміні — попередити про різну віддачу.',
    lines: [{ sku: 'SHK-BMW-F-5520', qty: 1 }],
  },
  {
    name: 'Заміна генератора 180A',
    time: 120,
    laborUah: 3500,
    markup: 1.24,
    recommendations: 'Перевірити натяг приводного ременя та ролики. За потреби — заміна ременя.',
    lines: [{ sku: 'GEN-AUD-180-01', qty: 1 }],
  },
  {
    name: 'Заміна датчика положення дросельної заслінки',
    time: 45,
    laborUah: 1200,
    markup: 1.32,
    recommendations: 'Після заміни — адаптація дроселя у сканері (де застосовно).',
    lines: [{ sku: 'TPS-VAG-0287', qty: 1 }],
  },
  {
    name: 'Набір витратників під кузовні роботи (шліфкруги P80)',
    time: 0,
    laborUah: 150,
    markup: 1.45,
    recommendations: 'Для проміжної підготовки під грунт. Машинка — окремо.',
    lines: [{ sku: 'ABR-P80-125', qty: 4 }],
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const plan of PLANS) {
    const dup = await prisma.service.findFirst({ where: { name: plan.name } });
    if (dup) {
      skipped += 1;
      console.warn(`SKIP (вже є): "${plan.name}"`);
      continue;
    }

    const resolved = [];
    let missing = false;
    for (const line of plan.lines) {
      const inv = await skuRow(line.sku);
      if (!inv) {
        console.warn(`SKIP план "${plan.name}": не знайдено SKU ${line.sku} на складі`);
        missing = true;
        break;
      }
      resolved.push({ inv, qty: line.qty });
    }
    if (missing) {
      skipped += 1;
      continue;
    }

    const partsCost = resolved.reduce((s, r) => s + Number(r.inv.price || 0) * r.qty, 0);
    const withMarkup = Math.round(partsCost * plan.markup + plan.laborUah);
    const price = Math.max(withMarkup, Math.ceil(partsCost) + plan.laborUah + 100);

    let oldPrice = plan.oldPrice != null ? Number(plan.oldPrice) : null;
    if (oldPrice != null && oldPrice <= price) {
      oldPrice = Math.round(price * 1.18);
    }

    const categoryId = await priceCatIdForInventory(resolved[0].inv);
    const categoryName = resolved[0].inv.category?.name || 'Загальне';

    await prisma.service.create({
      data: {
        name: plan.name,
        price,
        oldPrice: oldPrice || null,
        recommendations: plan.recommendations,
        categoryName,
        time: plan.time,
        ...(categoryId ? { priceCategory: { connect: { id: categoryId } } } : {}),
        serviceParts: {
          create: resolved.map((r) => ({
            quantity: r.qty,
            inventory: { connect: { id: r.inv.id } },
          })),
        },
      },
    });

    console.log(
      `OK: "${plan.name}" — склад ${partsCost.toFixed(0)} грн → послуга ${price} грн` +
        (oldPrice ? ` (стара ціна ${oldPrice})` : '')
    );
    created += 1;
  }

  console.log(`\nГотово: створено ${created}, пропущено ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
