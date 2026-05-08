const prisma = require('../lib/prisma');

// Отримати всі товари
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({
      include: { 
        category: true, 
        technicalData: true 
      },
      orderBy: { id: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error('SERVER_GET_ALL_ERROR:', error);
    res.status(500).json({ error: 'Помилка при отриманні товарів' });
  }
};

// Створити новий товар
exports.addItem = async (req, res) => {
  try {
    const { 
      name, stockKeepingUnit, current, minimum, 
      price, categoryId, specifications, compatibility, supplier 
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Назва та категорія є обов’язковими' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    let specsArray = [];
    try {
      specsArray = typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || []);
    } catch (e) { 
      console.error("Помилка парсингу характеристик:", e); 
    }

    const newItem = await prisma.inventory.create({
      data: {
        name: String(name).trim(),
        stockKeepingUnit: String(stockKeepingUnit || "").trim(),
        current: parseInt(current, 10) || 0,
        minimum: parseInt(minimum, 10) || 0,
        price: parseInt(price, 10) || 0,
        imageSource: imagePath,
        compatibility: String(compatibility || ""),
        supplier: String(supplier || ""),
        category: { connect: { id: parseInt(categoryId, 10) } },
        technicalData: {
          create: specsArray.map(spec => ({
            parameter: spec.parameter || spec.key,
            value: spec.value || ""
          }))
        }
      },
      include: { category: true, technicalData: true }
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('SERVER_ADD_ITEM_ERROR:', error);
    res.status(500).json({ error: 'Помилка при створенні', details: error.message });
  }
};

// Редагувати товар
exports.updateItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const body = req.body || {};

    const { 
      name, stockKeepingUnit, current, minimum, 
      price, categoryId, technicalData, compatibility, supplier 
    } = body;

    if (isNaN(itemId)) return res.status(400).json({ error: 'Некоректний ID' });

    const result = await prisma.$transaction(async (tx) => {
      const updateData = {};
      
      if (name !== undefined) updateData.name = name.trim();
      if (stockKeepingUnit !== undefined) updateData.stockKeepingUnit = stockKeepingUnit.trim();
      if (current !== undefined) updateData.current = parseInt(current, 10);
      if (minimum !== undefined) updateData.minimum = parseInt(minimum, 10);
      if (price !== undefined) updateData.price = parseInt(price, 10);
      if (supplier !== undefined) updateData.supplier = supplier;
      if (compatibility !== undefined) updateData.compatibility = String(compatibility);

      if (req.file) {
        updateData.imageSource = `/uploads/${req.file.filename}`;
      }
      
      if (categoryId) {
        updateData.categoryId = parseInt(categoryId, 10);
      }

      // Оновлюємо та включаємо всі дані, щоб фронтенд миттєво оновив статус дефіциту
      const updated = await tx.inventory.update({
        where: { id: itemId },
        data: updateData,
        include: { category: true, technicalData: true }
      });

      if (technicalData) {
        let specsArray = [];
        try {
          specsArray = typeof technicalData === 'string' ? JSON.parse(technicalData) : technicalData;
        } catch (e) {
          specsArray = [];
        }

        await tx.technicalSpec.deleteMany({ where: { inventoryId: itemId } });
        
        if (specsArray.length > 0) {
          await tx.technicalSpec.createMany({
            data: specsArray.map(spec => ({
              parameter: spec.parameter || spec.key || "",
              value: spec.value || "",
              inventoryId: itemId
            }))
          });
        }
      }
      return updated;
    });

    res.json(result);
  } catch (error) {
    console.error('SERVER_UPDATE_ITEM_ERROR:', error);
    res.status(500).json({ error: 'Помилка при оновленні на сервері' });
  }
};

// Видалити товар
exports.deleteItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) return res.status(400).json({ error: 'Некоректний ID' });

    // Видаляємо зв'язані логи та характеристики перед видаленням товару (якщо немає CASCADE)
    await prisma.$transaction([
      prisma.technicalSpec.deleteMany({ where: { inventoryId: itemId } }),
      prisma.inventoryLog.deleteMany({ where: { itemId: itemId } }),
      prisma.inventory.delete({ where: { id: itemId } })
    ]);

    res.json({ message: 'Видалено успішно' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(200).json({ message: 'Товар вже видалено' });
    }
    res.status(500).json({ error: 'Помилка видалення' });
  }
};

// Склад: Прихід/Списання з записом в InventoryLog
exports.handleStockChange = async (req, res) => {
  const { id, quantity, note } = req.body;
  const itemId = parseInt(id, 10);
  const change = parseInt(quantity, 10);

  if (!itemId || isNaN(change)) return res.status(400).json({ error: "Дані некоректні" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventory.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Товар не знайдено");

      // Повертаємо об'єкт із категорією, щоб фронтенд міг ідентифікувати товар у сповіщеннях
      const updatedItem = await tx.inventory.update({
        where: { id: itemId },
        data: { current: { increment: change } },
        include: { category: true, technicalData: true } 
      });

      await tx.inventoryLog.create({
        data: {
          itemId: itemId, 
          amount: change,
          note: note || (change > 0 ? "Прихід" : "Списання"),
          date: new Date() 
        }
      });
      return updatedItem;
    });
    res.json(result);
  } catch (error) {
    console.error('STOCK_CHANGE_ERROR:', error);
    res.status(400).json({ error: error.message });
  }
};

// Дані авто
exports.getCarData = async (req, res) => {
  try {
    const brands = await prisma.carBrand.findMany({
      include: { models: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error) {
    console.error('GET_CAR_DATA_ERROR:', error);
    res.status(500).json({ error: "Помилка авто-даних" });
  }
};

// Перевірка SKU
exports.checkSKU = async (req, res) => {
  const { sku } = req.query;
  try {
    const exists = await prisma.inventory.findFirst({ where: { stockKeepingUnit: sku } });
    res.json({ exists: !!exists });
  } catch (error) {
    res.status(500).json({ error: "Помилка перевірки SKU" });
  }
};