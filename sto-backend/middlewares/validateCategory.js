const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
});

const validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

module.exports = { validateCategory };