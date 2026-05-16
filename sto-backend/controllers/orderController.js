const prisma = require('../lib/prisma');
const { invalidateAnalyticsCache } = require('./analyticsController');

function aggregatePartsByInventoryId(services) {
  const requiredByItem = new Map();
  if (!services) return requiredByItem;
  for (const service of services) {
    for (const sp of service.serviceParts || []) {
      const qty = Number(sp.quantity) || 0;
      if (qty <= 0) continue;
      requiredByItem.set(sp.inventoryId, (requiredByItem.get(sp.inventoryId) || 0) + qty);
    }
  }
  return requiredByItem;
}

function normUpper(s) {
  return String(s || '').toUpperCase();
}

function isCompletedNorm(n) {
  return n === 'COMPLETED' || n === 'ВИКОНАНО';
}

function statusesDiffer(prev, next) {
  return String(prev) !== String(next);
}

const orderController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          customer: true,

          master: {
            include: { staffCategory: true }
          },
          services: {
            include: { serviceParts: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Помилка при отриманні списку замовлень', message: error.message });
    }
  },

  createOrder: async (req, res) => {
    try {
      const {
        client, phone, car, plate, vinCode, services, totalPrice,
        payment, deadline, comment, masterId, isUrgent
      } = req.body;

      let customer = await prisma.customer.findUnique({ where: { phone } });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: client, phone, source: "Прямий візит" }
        });
      }

      let carRecord = await prisma.car.findUnique({ where: { plate: plate.toUpperCase() } });
      if (!carRecord) {
        carRecord = await prisma.car.create({
          data: {
            brand: car.split(' ')[0] || "Unknown",
            model: car.split(' ').slice(1).join(' ') || "Unknown",
            plate: plate.toUpperCase(),
            vin: vinCode || null,
            customerId: customer.id
          }
        });
      } else if (vinCode && !carRecord.vin) {
        await prisma.car.update({
          where: { id: carRecord.id },
          data: { vin: vinCode }
        });
      }

      const newOrder = await prisma.order.create({
        data: {
          customerId: customer.id,
          carDetails: `${car} (${plate.toUpperCase()})`,
          vinCode: vinCode || null,
          totalPrice: parseFloat(totalPrice),
          paymentMethod: payment || "Готівка",
          isUrgent: Boolean(isUrgent),
          deadline: deadline ? new Date(deadline) : null,
          notes: comment || "",
          masterId: masterId ? parseInt(masterId) : null,
          status: masterId ? "IN_WORK" : "PENDING",
          services: {
            connect: services.map((s) => ({ id: s.id })),
          },
        },
        include: {
          customer: true,
          services: true,
          master: { include: { staffCategory: true } }
        },
      });

      if (masterId) {
        await prisma.staff.update({
          where: { id: parseInt(masterId) },
          data: {
            status: "Зайнятий",
            currentCar: plate.toUpperCase()
          }
        });
      }

      invalidateAnalyticsCache();
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(400).json({ error: "Помилка при створенні замовлення", message: error.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { client, phone, car, plate, vinCode, services, totalPrice, payment, deadline, comment, masterId, isUrgent } = req.body;

      const customer = await prisma.customer.upsert({
        where: { phone: phone },
        update: { name: client },
        create: { name: client, phone: phone, source: "Оновлено через замовлення" }
      });

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          customerId: customer.id,
          carDetails: `${car} (${plate.toUpperCase()})`,
          vinCode: vinCode || null,
          totalPrice: parseFloat(totalPrice),
          paymentMethod: payment,
          isUrgent: Boolean(isUrgent),
          deadline: deadline ? new Date(deadline) : null,
          notes: comment,
          masterId: masterId ? parseInt(masterId) : null,
          services: {
            set: services.map((s) => ({ id: s.id })),
          },
        },
        include: {
          customer: true,
          services: true,
          master: { include: { staffCategory: true } }
        }
      });

      invalidateAnalyticsCache();
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: "Помилка при оновленні замовлення", message: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { status, masterId } = req.body;

      const currentOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { master: true, services: { include: { serviceParts: true } } }
      });

      if (!currentOrder) return res.status(404).json({ error: "Замовлення не знайдено" });

      const updateData = {};
      if (status) {
        updateData.status = status;
        const normalized = normUpper(status);
        if (isCompletedNorm(normalized)) {
          updateData.completedAt = new Date();
        } else if (currentOrder.completedAt) {
          updateData.completedAt = null;
        }
      }

      if (masterId !== undefined) {
        const newMasterId = masterId ? parseInt(masterId, 10) : null;
        updateData.masterId = newMasterId;

        if (newMasterId !== currentOrder.masterId && newMasterId && !status && currentOrder.status === 'PENDING') {
          updateData.status = 'IN_WORK';
        }
      }

      const normStatus = status ? normUpper(status) : '';
      const prevNorm = normUpper(currentOrder.status);
      const requiredByItem = aggregatePartsByInventoryId(currentOrder.services);

      const enteringCompleted =
        status &&
        isCompletedNorm(normStatus) &&
        !isCompletedNorm(prevNorm) &&
        statusesDiffer(currentOrder.status, status);

      const leavingCompleted =
        status &&
        isCompletedNorm(prevNorm) &&
        !isCompletedNorm(normStatus);

      if (enteringCompleted && !currentOrder.inventoryConsumedAt && requiredByItem.size > 0) {
        const inventoryRecords = await prisma.inventory.findMany({
          where: { id: { in: [...requiredByItem.keys()] } },
          select: { id: true, name: true, current: true }
        });
        const inventoryMap = new Map(inventoryRecords.map((i) => [i.id, i]));
        const shortages = [];
        for (const [invId, needed] of requiredByItem.entries()) {
          const item = inventoryMap.get(invId);
          const available = item?.current ?? 0;
          if (available < needed) {
            shortages.push({
              id: invId,
              name: item?.name || `#${invId}`,
              available,
              needed
            });
          }
        }

        if (shortages.length > 0) {
          const msg = shortages
            .map((s) => `${s.name}: потрібно ${s.needed}, на складі ${s.available}`)
            .join('; ');
          return res.status(400).json({
            error: "Недостатньо запчастин на складі",
            message: `Не вдалося завершити замовлення. ${msg}`,
            shortages
          });
        }
      }

      const isReadyOrDone = ['READY', 'ГОТОВО', 'COMPLETED', 'ВИКОНАНО'].includes(normStatus);

      const updatedOrder = await prisma.$transaction(async (tx) => {
        if (masterId !== undefined) {
          const newMasterId = masterId ? parseInt(masterId, 10) : null;
          if (newMasterId !== currentOrder.masterId) {
            if (currentOrder.masterId) {
              await tx.staff.update({
                where: { id: currentOrder.masterId },
                data: { status: "Вільний", currentCar: "" }
              });
            }
            if (newMasterId) {
              await tx.staff.update({
                where: { id: newMasterId },
                data: {
                  status: "Зайнятий",
                  currentCar: currentOrder.carDetails.split('(')[0].trim()
                }
              });
            }
          }
        }

        if (leavingCompleted) {
          if (requiredByItem.size > 0 && currentOrder.inventoryConsumedAt) {
            for (const [invId, qty] of requiredByItem.entries()) {
              await tx.inventory.update({
                where: { id: invId },
                data: { current: { increment: qty } }
              });
              await tx.inventoryLog.create({
                data: {
                  itemId: invId,
                  amount: qty,
                  note: `Повернення на склад через зміну статусу замовлення №${orderId}`,
                  orderId,
                  date: new Date()
                }
              });
            }
          }
          if (currentOrder.inventoryConsumedAt) {
            updateData.inventoryConsumedAt = null;
          }
        }

        if (enteringCompleted && !currentOrder.inventoryConsumedAt) {
          const consumedAt = new Date();
          if (requiredByItem.size > 0) {
            for (const [invId, qty] of requiredByItem.entries()) {
              await tx.inventory.update({
                where: { id: invId },
                data: { current: { decrement: qty } }
              });
              await tx.inventoryLog.create({
                data: {
                  itemId: invId,
                  amount: -qty,
                  note: `Списання по замовленню №${orderId}`,
                  orderId,
                  date: consumedAt
                }
              });
            }
            updateData.inventoryConsumedAt = consumedAt;
          }
        }

        const readyOrDoneEdge = Boolean(isReadyOrDone && statusesDiffer(currentOrder.status, status));
        if (readyOrDoneEdge) {
          const activeMasterId = masterId !== undefined ? (masterId ? parseInt(masterId, 10) : null) : currentOrder.masterId;

          if (activeMasterId) {
            const masterRecord = await tx.staff.findUnique({ where: { id: activeMasterId } });
            const commissionRate = (masterRecord?.commissionPercent ?? 10) / 100;
            await tx.staff.update({
              where: { id: activeMasterId },
              data: {
                ...(isCompletedNorm(normStatus) && !isCompletedNorm(prevNorm)
                  ? { earnings: { increment: currentOrder.totalPrice * commissionRate } }
                  : {}),
                status: "Вільний",
                currentCar: ""
              }
            });
          }
        }

        if (['CANCELLED', 'СКАСОВАНО'].includes(normStatus) && currentOrder.masterId) {
          await tx.staff.update({
            where: { id: currentOrder.masterId },
            data: { status: "Вільний", currentCar: "" }
          });
        }

        return tx.order.update({
          where: { id: orderId },
          data: updateData,
          include: {
            customer: true,
            master: { include: { staffCategory: true } },
            services: true
          }
        });
      });

      invalidateAnalyticsCache();
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Помилка оновлення статусу", message: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
      invalidateAnalyticsCache();
      res.json({ message: "Видалено" });
    } catch (error) {
      res.status(400).json({ error: "Помилка видалення" });
    }
  }
};

module.exports = orderController;