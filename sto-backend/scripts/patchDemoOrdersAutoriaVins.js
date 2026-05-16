/**
 * Оновлює демо-замовлення за телефонами з demoOrderRowsData:
 * vinCode, carDetails, екстрений, оплата; авто марка/модель/номер/VIN; ПІБ клієнта.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const prisma = require('../lib/prisma');
const { invalidateAnalyticsCache } = require('../controllers/analyticsController');
const { DEMO_ORDER_ROWS } = require('./demoOrderRowsData');

function brandModelFromCarLabel(carLabel) {
  const parts = String(carLabel || '').trim().split(/\s+/);
  return { brand: parts[0] || 'Unknown', model: parts.slice(1).join(' ') || 'Unknown' };
}

async function main() {
  let n = 0;
  for (const row of DEMO_ORDER_ROWS) {
    const cust = await prisma.customer.findUnique({ where: { phone: row.phone } });
    if (!cust) {
      console.warn(`SKIP: клієнт ${row.phone} — немає (запустіть npm run seed-demo-orders).`);
      continue;
    }

    if (cust.name !== row.client) {
      await prisma.customer.update({
        where: { id: cust.id },
        data: { name: row.client },
      });
    }

    const upperPlate = row.plate.toUpperCase();
    const { brand, model } = brandModelFromCarLabel(row.car);

    const r = await prisma.order.updateMany({
      where: { customerId: cust.id },
      data: {
        vinCode: row.vin,
        carDetails: `${row.car} (${upperPlate})`,
        isUrgent: Boolean(row.urgent),
        paymentMethod: row.payment || 'Готівка',
        notes: row.urgent ? 'Екстрений заїзд (пріоритет).' : '',
      },
    });
    n += r.count;

    const cars = await prisma.car.findMany({ where: { customerId: cust.id } });
    if (!cars.length) {
      await prisma.car.create({
        data: {
          brand,
          model,
          plate: upperPlate,
          vin: row.vin,
          customerId: cust.id,
        },
      });
    } else {
      for (const car of cars) {
        await prisma.car.update({
          where: { id: car.id },
          data: { brand, model, plate: upperPlate, vin: row.vin },
        });
      }
    }

    console.log(`OK ${row.phone} → ${row.vin}`);
  }

  invalidateAnalyticsCache();
  console.log(`\nОновлено Order: ${n}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
