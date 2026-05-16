/**
 * 11 замовлень для журналу (як через «Новий заїзд»): VIN з AUTO.RIA — див. demoOrderRowsData.js.
 *
 * Якщо для телефону вже є замовлення — рядок пропускається (не дублює).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const prisma = require('../lib/prisma');
const { invalidateAnalyticsCache } = require('../controllers/analyticsController');
const { DEMO_ORDER_ROWS } = require('./demoOrderRowsData');

async function fetchMasters() {
  return prisma.staff.findMany({
    where: { isDeleted: false },
    orderBy: { id: 'asc' },
    select: { id: true, name: true },
  });
}

async function fetchServicesMap() {
  const list = await prisma.service.findMany({
    select: { id: true, name: true, price: true },
  });
  return new Map(list.map((s) => [s.name.trim(), s]));
}

function brandModelFromCarLabel(carLabel) {
  const parts = String(carLabel || '').trim().split(/\s+/);
  return { brand: parts[0] || 'Unknown', model: parts.slice(1).join(' ') || 'Unknown' };
}

async function createOne(row, serviceMap, masters, masterIdx) {
  const { client, phone, car, plate, vin, urgent, payment, picks } = row;
  const upperPlate = plate.toUpperCase();

  let customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: client, phone, source: 'Демо-запис журналу' },
    });
  } else if (customer.name !== client) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name: client },
    });
  }

  const { brand, model } = brandModelFromCarLabel(car);
  let carRecord = await prisma.car.findUnique({ where: { plate: upperPlate } });
  if (!carRecord) {
    carRecord = await prisma.car.create({
      data: { brand, model, plate: upperPlate, vin: vin || null, customerId: customer.id },
    });
  } else if (vin && !carRecord.vin) {
    await prisma.car.update({ where: { id: carRecord.id }, data: { vin } });
  }

  const resolve = picks.map((pname) => {
    const svc = serviceMap.get(pname.trim());
    if (!svc) throw new Error(`Немає послуги в прайсі: «${pname}»`);
    return svc;
  });

  const totalPrice = resolve.reduce((s, x) => s + Number(x.price || 0), 0);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3 + masterIdx);

  const masterId = masters.length ? masters[masterIdx % masters.length].id : null;

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      carDetails: `${car} (${upperPlate})`,
      vinCode: vin || null,
      totalPrice,
      paymentMethod: payment || 'Готівка',
      isUrgent: Boolean(urgent),
      deadline,
      notes: urgent ? 'Екстрений заїзд (пріоритет).' : '',
      masterId,
      status: masterId ? 'IN_WORK' : 'PENDING',
      services: { connect: resolve.map((s) => ({ id: s.id })) },
    },
    include: { customer: true, services: true, master: true },
  });

  if (masterId) {
    await prisma.staff.update({
      where: { id: masterId },
      data: { status: 'Зайнятий', currentCar: upperPlate },
    });
  }

  return order;
}

async function main() {
  const masters = await fetchMasters();
  if (!masters.length) {
    console.error('У базі немає майстрів (Staff).');
    process.exitCode = 1;
    return;
  }

  const serviceMap = await fetchServicesMap();
  if (!serviceMap.size) {
    console.error('У базі немає послуг. Запустіть seed-services-warehouse або додайте прайс.');
    process.exitCode = 1;
    return;
  }

  let ok = 0;
  let skip = 0;
  let masterIdx = 0;

  for (const row of DEMO_ORDER_ROWS) {
    try {
      const dup = await prisma.order.findFirst({ where: { customer: { phone: row.phone } } });
      if (dup) {
        console.warn(`SKIP ${row.phone}: замовлення для цього телефону вже є.`);
        skip += 1;
        masterIdx += 1;
        continue;
      }
      await createOne(row, serviceMap, masters, masterIdx);
      console.log(`OK «${row.client}», ${row.plate}, VIN ${row.vin}, urgent=${row.urgent}`);
      ok += 1;
    } catch (e) {
      console.error(`FAIL «${row.client}»:`, e.message);
      skip += 1;
    }
    masterIdx += 1;
  }

  invalidateAnalyticsCache();
  console.log(`\nГотово: створено ${ok}, пропущено/помилок ${skip}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
