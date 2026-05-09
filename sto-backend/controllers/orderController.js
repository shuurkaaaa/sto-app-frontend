const prisma = require('../lib/prisma');

const orderController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          customer: true,
          // Додаємо вкладений include для категорії майстра
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
        client, phone, car, plate, services, totalPrice, 
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
            customerId: customer.id
          }
        });
      }

      const newOrder = await prisma.order.create({
        data: {
          customerId: customer.id,
          carDetails: `${car} (${plate.toUpperCase()})`,
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

      res.status(201).json(newOrder);
    } catch (error) {
      res.status(400).json({ error: "Помилка при створенні замовлення", message: error.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { client, phone, car, plate, services, totalPrice, payment, deadline, comment, masterId, isUrgent } = req.body;

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

      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: "Помилка при оновленні замовлення", message: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, masterId } = req.body;

      const currentOrder = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { master: true, services: { include: { serviceParts: true } } }
      });

      if (!currentOrder) return res.status(404).json({ error: "Замовлення не знайдено" });

      const updateData = {};
      if (status) updateData.status = status;
      
      if (masterId !== undefined) {
        const newMasterId = masterId ? parseInt(masterId) : null;
        updateData.masterId = newMasterId;

        if (newMasterId !== currentOrder.masterId) {
          if (currentOrder.masterId) {
            await prisma.staff.update({
              where: { id: currentOrder.masterId },
              data: { status: "Вільний", currentCar: "" }
            });
          }
          if (newMasterId) {
            await prisma.staff.update({
              where: { id: newMasterId },
              data: { 
                status: "Зайнятий", 
                currentCar: currentOrder.carDetails.split('(')[0].trim() 
              }
            });
            if (!status && currentOrder.status === 'PENDING') {
              updateData.status = 'IN_WORK';
            }
          }
        }
      }

      const normStatus = status ? status.toUpperCase() : "";
      const isReadyOrDone = ['READY', 'ГОТОВО', 'COMPLETED', 'ВИКОНАНО'].includes(normStatus);

      if (isReadyOrDone && currentOrder.status !== status) {
        if (['COMPLETED', 'ВИКОНАНО'].includes(normStatus)) {
          for (const service of currentOrder.services) {
            for (const sPart of service.serviceParts) {
              await prisma.inventory.update({
                where: { id: sPart.inventoryId },
                data: { current: { decrement: sPart.quantity } }
              });
            }
          }
        }

        const activeMasterId = masterId !== undefined ? (masterId ? parseInt(masterId) : null) : currentOrder.masterId;
        
        if (activeMasterId) {
          const masterRecord = await prisma.staff.findUnique({ where: { id: activeMasterId } });
          const commissionRate = (masterRecord?.commissionPercent ?? 10) / 100;
          await prisma.staff.update({
            where: { id: activeMasterId },
            data: {
              ...(['COMPLETED', 'ВИКОНАНО'].includes(normStatus) ? { earnings: { increment: currentOrder.totalPrice * commissionRate } } : {}),
              status: "Вільний",
              currentCar: ""
            }
          });
        }
      }

      if (['CANCELLED', 'СКАСОВАНО'].includes(normStatus) && currentOrder.masterId) {
        await prisma.staff.update({
          where: { id: currentOrder.masterId },
          data: { status: "Вільний", currentCar: "" }
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { 
          customer: true, 
          master: { include: { staffCategory: true } }, 
          services: true 
        }
      });

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: "Помилка оновлення статусу", message: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: "Видалено" });
    } catch (error) {
      res.status(400).json({ error: "Помилка видалення" });
    }
  }
};

module.exports = orderController;