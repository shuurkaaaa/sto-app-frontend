const prisma = require('../lib/prisma');


exports.createItem = async (req, res) => {
  try {
    const {
      name, stockKeepingUnit, categoryId, price,
      current, minimum, compatibility, specifications
    } = req.body;


    const safePrice = parseInt(price, 10) || 0;
    const safeCurrent = parseInt(current, 10) || 0;
    const safeMin = parseInt(minimum, 10) || 0;


    let safeCategoryId = null;
    if (categoryId && categoryId !== "" && categoryId !== "null") {
      safeCategoryId = parseInt(categoryId, 10);
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    let parsedSpecs = [];
    try {
      parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || []);
    } catch (e) {
      parsedSpecs = [];
    }

    const newItem = await prisma.inventory.create({
      data: {
        name: String(name || "Новий товар"),
        stockKeepingUnit: String(stockKeepingUnit || ""),
        price: safePrice,
        current: safeCurrent,
        minimum: safeMin,
        compatibility: String(compatibility || ""),
        imageSource: imagePath,
        categoryId: safeCategoryId,
        technicalData: {
          create: (Array.isArray(parsedSpecs) ? parsedSpecs : []).map(spec => ({
            parameter: String(spec.parameter || spec.key || "Параметр"),
            value: String(spec.value || "")
          }))
        }
      },
      include: {
        technicalData: true,
        category: true
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("КРИТИЧНА ПОМИЛКА ПРИ СТВОРЕННІ:", error);
    res.status(500).json({ error: "Помилка сервера", message: error.message });
  }
};


exports.updateItem = async (req, res) => {
  const { id } = req.params;
  try {
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) return res.status(400).json({ error: "Некоректний ID" });

    const {
      name, stockKeepingUnit, price, categoryId,
      technicalData, compatibility, current, minimum
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const updateData = {};

      if (name !== undefined) updateData.name = String(name);
      if (stockKeepingUnit !== undefined) updateData.stockKeepingUnit = String(stockKeepingUnit);
      if (price !== undefined) updateData.price = parseInt(price, 10) || 0;
      if (current !== undefined) updateData.current = parseInt(current, 10) || 0;
      if (minimum !== undefined) updateData.minimum = parseInt(minimum, 10) || 0;
      if (compatibility !== undefined) updateData.compatibility = String(compatibility);

      if (categoryId !== undefined) {
        updateData.categoryId = (categoryId === "" || categoryId === "null" || categoryId === null)
          ? null
          : parseInt(categoryId, 10);
      }

      if (req.file) updateData.imageSource = `/uploads/${req.file.filename}`;

      const updated = await tx.inventory.update({
        where: { id: itemId },
        data: updateData,
        include: { technicalData: true, category: true }
      });

      if (technicalData) {
        let specs = [];
        try {
          specs = typeof technicalData === 'string' ? JSON.parse(technicalData) : technicalData;
        } catch (e) {
          console.warn("Не вдалося розпарсити характеристики:", e);
        }

        if (Array.isArray(specs)) {
          await tx.technicalSpec.deleteMany({ where: { inventoryId: itemId } });
          if (specs.length > 0) {
            await tx.technicalSpec.createMany({
              data: specs.map(s => ({
                parameter: String(s.parameter || s.key || ""),
                value: String(s.value || ""),
                inventoryId: itemId
              }))
            });
          }
        }
      }
      return updated;
    });

    res.json(result);
  } catch (error) {
    console.error("КРИТИЧНА ПОМИЛКА ПРИ ОНОВЛЕННІ:", error);
    res.status(500).json({ error: "Помилка сервера при оновленні", message: error.message });
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    await prisma.$transaction([
      prisma.technicalSpec.deleteMany({ where: { inventoryId: itemId } }),
      prisma.inventoryLog.deleteMany({ where: { itemId: itemId } }),
      prisma.inventory.delete({ where: { id: itemId } })
    ]);
    res.status(204).send();
  } catch (error) {
    console.error("ПОМИЛКА ВИДАЛЕННЯ:", error);
    res.status(500).json({ error: "Не вдалося видалити" });
  }
};