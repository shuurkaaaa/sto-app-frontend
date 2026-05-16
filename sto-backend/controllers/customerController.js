const prisma = require('../lib/prisma');


exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        cars: true,
        communicationHistory: { orderBy: { date: 'desc' } },
        Note: { orderBy: { date: 'desc' } },
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            completedAt: true,
            status: true,
            carDetails: true,
            vinCode: true,
            totalPrice: true,
            paymentMethod: true,
            isUrgent: true,
            notes: true,
            masterId: true,
            master: { select: { id: true, name: true } },
            services: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCustomers = customers.map(customer => ({
      ...customer,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.totalPrice, 0)
    }));

    res.json(formattedCustomers);
  } catch (error) {
    console.error('ПОМИЛКА КЛІЄНТІВ:', error);
    res.status(500).json({ error: "Помилка завантаження бази клієнтів" });
  }
};


exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, source, car } = req.body;
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        source: source || "Прямий візит",
        cars: car ? {
          create: {
            brand: car.brand,
            model: car.model,
            plate: car.plate.toUpperCase(),
            vin: car.vin
          }
        } : undefined
      },
      include: { cars: true, communicationHistory: true, Note: true }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: "Не вдалося створити клієнта" });
  }
};


exports.updateCustomerNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const customerId = parseInt(req.params.id);

    const newNote = await prisma.note.create({
      data: { text: notes, customerId }
    });

    res.json(newNote);
  } catch (error) {
    res.status(400).json({ error: "Не вдалося зберегти нотатку" });
  }
};


exports.toggleArchive = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isArchived } = req.body;

    const updated = await prisma.customer.update({
      where: { id },
      data: { isArchived },
      include: { cars: true, communicationHistory: true, Note: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Помилка оновлення статусу" });
  }
};


exports.addCar = async (req, res) => {
  try {
    const { brand, model, plate, vin } = req.body;
    const customerId = parseInt(req.params.id);

    const car = await prisma.car.create({
      data: { brand, model, plate: plate.toUpperCase(), vin, customerId }
    });
    res.status(201).json(car);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: "Цей номер вже є в системі" });
    res.status(400).json({ error: "Помилка додавання автомобіля" });
  }
};


exports.deleteCar = async (req, res) => {
  try {
    await prisma.car.delete({
      where: { id: parseInt(req.params.carId) }
    });
    res.json({ message: "Авто видалено" });
  } catch (error) {
    res.status(400).json({ error: "Не вдалося видалити авто" });
  }
};


exports.addCommunicationNote = async (req, res) => {
  try {
    const { text } = req.body;
    const note = await prisma.communicationHistory.create({
      data: { text, customerId: parseInt(req.params.id) }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: "Помилка запису в історію" });
  }
};


exports.deleteNote = async (req, res) => {
  try {
    await prisma.communicationHistory.delete({
      where: { id: parseInt(req.params.noteId) }
    });
    res.json({ message: "Запис видалено" });
  } catch (error) {
    res.status(400).json({ error: "Не вдалося видалити запис" });
  }
};


exports.deleteCustomer = async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Клієнта повністю видалено" });
  } catch (error) {
    res.status(400).json({ error: "Помилка при видаленні" });
  }
};