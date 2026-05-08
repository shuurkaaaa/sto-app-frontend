exports.validateCustomerData = (req, res, next) => {
  const { name, phone } = req.body;
  if (!name || name.length < 2) return res.status(400).json({ error: "Ім'я занадто коротке" });
  if (!phone) return res.status(400).json({ error: "Вкажіть телефон" });
  next();
};

exports.validateNote = (req, res, next) => {
  if (!req.body.text) return res.status(400).json({ error: "Нотатка порожня" });
  next();
};