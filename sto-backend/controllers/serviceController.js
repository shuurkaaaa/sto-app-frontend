const prisma = require('../lib/prisma');

const getAllServices = async (req, res) => {
  try {
    const servicesList = await prisma.service.findMany({ 
      include: { 
        serviceParts: {
          include: {
            inventory: true 
          }
        },
        priceCategory: true 
      },
      orderBy: { id: 'desc' }
    });
    res.status(200).json(servicesList);
  } catch (error) {
    console.error("Помилка при отриманні списку послуг:", error);
    res.status(500).json({ error: "Помилка сервера при читанні бази даних" });
  }
};

const createService = async (req, res) => {
  try {
    const { name, price, oldPrice, category, categoryId, time, linkedParts, recommendations } = req.body;

    const newCreatedService = await prisma.service.create({
      data: {
        name: String(name),
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        recommendations: recommendations ? String(recommendations) : null, 
        categoryName: String(category || "Загальне"),
        time: parseInt(time) || 0,
        ...(categoryId && {
          priceCategory: {
            connect: { id: parseInt(categoryId) }
          }
        }),
        serviceParts: { 
          create: (linkedParts || []).map(partItem => ({
            quantity: parseInt(partItem.quantity) || 1,
            inventory: {
              connect: { id: parseInt(partItem.inventoryId || partItem.itemId) }
            }
          }))
        }
      },
      include: { 
        serviceParts: true, 
        priceCategory: true
      }
    });
    res.status(201).json(newCreatedService);
  } catch (error) {
    console.error("Помилка при створенні послуги:", error);
    res.status(500).json({ error: error.message || "Помилка створення запису в БД" });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, price, oldPrice, category, categoryId, time, linkedParts, recommendations } = req.body;
    const serviceIdToUpdate = parseInt(id);

    const updatedServiceResult = await prisma.$transaction(async (prismaTx) => {
      // 1. Спочатку видаляємо старі зв'язки із запчастинами
      await prismaTx.servicePart.deleteMany({
        where: { serviceId: serviceIdToUpdate }
      });

      // 2. Оновлюємо основні дані послуги та створюємо нові зв'язки
      return await prismaTx.service.update({
        where: { id: serviceIdToUpdate },
        data: { 
          name: String(name), 
          price: parseFloat(price), 
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          recommendations: recommendations ? String(recommendations) : null,
          categoryName: String(category || "Загальне"), 
          time: parseInt(time) || 0,
          ...(categoryId ? {
            priceCategory: { connect: { id: parseInt(categoryId) } }
          } : {
            priceCategory: { disconnect: true }
          }),
          serviceParts: { 
            create: (linkedParts || []).map(partItem => ({
              quantity: parseInt(partItem.quantity) || 1,
              inventory: {
                connect: { id: parseInt(partItem.inventoryId || partItem.itemId) }
              }
            }))
          }
        },
        include: { serviceParts: true, priceCategory: true }
      });
    });

    res.json(updatedServiceResult);
  } catch (error) {
    console.error("Помилка при оновленні даних послуги:", error);
    res.status(500).json({ error: "Помилка оновлення запису: " + error.message });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ 
      where: { id: parseInt(id) } 
    });
    res.status(204).send();
  } catch (error) {
    console.error("Помилка при видаленні послуги:", error);
    res.status(500).json({ error: "Помилка видалення запису з бази даних" });
  }
};

module.exports = { 
  getServices: getAllServices, 
  createService, 
  updateService, 
  deleteService 
};