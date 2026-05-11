const Joi = require('joi');

const workerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  role: Joi.string().required(),
  exp: Joi.number().integer().min(0).default(0),
  staffCategoryId: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null).optional()
}).unknown(true);

const validateStaff = (req, res, next) => {
  const { error } = workerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

module.exports = { validateStaff };