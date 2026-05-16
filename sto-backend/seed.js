const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log("Починаю повну дезінфекцію бази даних...");

  const tableNames = [
    'servicePart', 'inventoryLog', 'technicalSpec', 'orderItem',
    'purchaseOrder', 'note', 'communicationHistory', 'car',
    'service', 'order', 'priceCategory', 'inventory',
    'category', 'staffLog', 'staff', 'staffCategory',
    'customer', 'user', 'carBrand'
  ];

  for (const table of tableNames) {
    try {
      await prisma[table].deleteMany({});
    } catch (e) {

    }
  }
  console.log("Всі старі дані видалено.");

  console.log("Створюю профіль адміністратора...");
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@sto.com',
      password: hashedPassword,
      name: 'Адміністратор OneWayLogistic',
      role: 'ADMIN'
    }
  });

  console.log("База даних готова до роботи.");
}

main()
  .catch((e) => {
    console.error("Помилка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });