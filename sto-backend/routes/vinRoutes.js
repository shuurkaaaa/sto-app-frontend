const express = require('express');
const router = express.Router();
const vinService = require('../services/vinServiceNew');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/decode', async (req, res) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({
        success: false,
        error: 'VIN-код не вказаний'
      });
    }

    console.log(`[VIN] Розшифровка: ${vin}`);
    const result = await vinService.decodeVIN(vin);
    res.json(result);
  } catch (error) {
    console.error('[VIN] Decode error:', error.message);
    res.status(500).json({
      success: false,
      error: `Помилка при розшифруванні VIN: ${error.message}`
    });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'VIN-код не вказаний'
      });
    }

    const result = vinService.validateVIN(vin);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Помилка при валідації VIN: ${error.message}`
    });
  }
});

router.get('/search/:vin', async (req, res) => {
  try {
    const { vin } = req.params;

    if (!vin) {
      return res.status(400).json({
        success: false,
        error: 'VIN-код не вказаний'
      });
    }

    console.log(`[VIN] Пошук на autoRIA: ${vin}`);
    const result = await vinService.searchAutoRIA(vin);
    res.json(result);
  } catch (error) {
    console.error('[VIN] Search error:', error.message);
    res.status(500).json({
      success: false,
      error: `Помилка при пошуку: ${error.message}`
    });
  }
});

router.post('/check', async (req, res) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({
        success: false,
        error: 'VIN-код не вказаний'
      });
    }

    console.log(`[VIN] Повна перевірка: ${vin}`);
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 17);
    if (!cleanVin || cleanVin.length < 9) {
      return res.json({
        success: false,
        error: 'VIN повинен містити мінімум 9 символів (після очищення).',
        vin: cleanVin || '',
      });
    }

    const [decode, validation, autoRIA] = await Promise.all([
      vinService.decodeVIN(cleanVin),
      vinService.validateVIN(cleanVin),
      vinService.searchAutoRIA(cleanVin)
    ]);

    res.json({
      success: true,
      vin: cleanVin,
      decode,
      validation,
      autoRIA
    });
  } catch (error) {
    console.error('[VIN] Check error:', error.message);
    res.status(500).json({
      success: false,
      error: `Помилка при перевірці VIN: ${error.message}`
    });
  }
});

module.exports = router;
