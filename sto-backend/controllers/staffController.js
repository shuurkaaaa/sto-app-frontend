const prisma = require('../lib/prisma');

const safeParseInt = (val) => {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const logAction = async (staffId, action) => {
  try {
    await prisma.staffLog.create({ 
      data: { staffId: Number(staffId), action } 
    });
  } catch (e) {
    console.error("Помилка логування:", e.message);
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { isDeleted: false },
      include: { staffCategory: true },
      orderBy: { id: 'desc' }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Помилка завантаження персоналу", details: error.message });
  }
};

exports.getArchivedStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { isDeleted: true },
      include: { staffCategory: true }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Помилка завантаження архіву", details: error.message });
  }
};

exports.createStaff = async (req, res) => {
  const { name, role, exp, staffCategoryId } = req.body;
  try {
    const newMember = await prisma.staff.create({ 
      data: { 
        name, 
        role, 
        exp: safeParseInt(exp), 
        staffCategoryId: staffCategoryId ? Number(staffCategoryId) : null 
      },
      include: { staffCategory: true }
    });
    await logAction(newMember.id, `Створено майстра: ${name}`);
    res.json(newMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, role, exp, staffCategoryId } = req.body;
  try {
    const updated = await prisma.staff.update({
      where: { id: Number(id) },
      data: { 
        name, 
        role, 
        exp: safeParseInt(exp), 
        staffCategoryId: staffCategoryId ? Number(staffCategoryId) : null 
      },
      include: { staffCategory: true }
    });
    await logAction(id, `Оновлено дані майстра: ${name}`);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStaffStatus = async (req, res) => {
  const { id } = req.params;
  const { status, currentCar } = req.body;
  try {
    const result = await prisma.$transaction([
      prisma.staff.update({ 
        where: { id: Number(id) }, 
        data: { status, currentCar: currentCar || "" }, 
        include: { staffCategory: true } 
      }),
      prisma.staffLog.create({ 
        data: { staffId: Number(id), action: `Змінено статус на: ${status}` } 
      })
    ]);
    res.json(result[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.staff.update({ 
      where: { id }, 
      data: { isDeleted: true } 
    });
    await logAction(id, "Майстра переміщено в архів");
    res.json({ message: "Успішно переміщено в архів" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.restoreStaff = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.staff.update({ 
      where: { id }, 
      data: { isDeleted: false } 
    });
    await logAction(id, "Майстра відновлено з архіву");
    res.json({ message: "Відновлено" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};