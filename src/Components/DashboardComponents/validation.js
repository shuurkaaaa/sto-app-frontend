export const VALIDATION_RULES = {
  NAME: /^[A-ZА-ЯІЇЄҐ][a-zа-яіїєґ']+\s+[A-ZА-ЯІЇЄҐ][a-zа-яіїєґ']+.*$/,
  UA_PLATE: /^[A-ZА-Я]{2}\s?\d{4}\s?[A-ZА-Я]{2}$/i,
  PHONE: /^\+?3?8?(0\d{9})$/,
  CAR_MIN_LENGTH: 3
};

export const validateOrderForm = (data) => {
  const errors = {};

  if (!data.client || !VALIDATION_RULES.NAME.test(data.client.trim())) {
    errors.client = "Вкажіть Прізвище та Ім'я (н-р: Олександр Іванов)";
  }

  if (!data.phone || !VALIDATION_RULES.PHONE.test(data.phone.replace(/\s+/g, ''))) {
    errors.phone = "Невірний формат (напр: 0671234567)";
  }

  if (!data.car || data.car.trim().length < VALIDATION_RULES.CAR_MIN_LENGTH) {
    errors.car = "Марка/Модель занадто коротка";
  }

  if (!data.plate || !VALIDATION_RULES.UA_PLATE.test(data.plate.trim())) {
    errors.plate = "Невірний формат (має бути AA 1122 BB)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatPlate = (value) => value.toUpperCase().replace(/\s+/g, ' ').trim();