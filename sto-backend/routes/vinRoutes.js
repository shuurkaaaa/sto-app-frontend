const express = require('express');
const router = express.Router();
const vinService = require('../services/vinServiceNew');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

/**
 * POST /api/vin/decode
 * Розшифрувати VIN код
 */
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

/**
 * POST /api/vin/validate
 * Перевірити валідність VIN
 */
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

/**
 * GET /api/vin/search/:vin
 * Пошук на autoRIA
 */
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

/**
 * POST /api/vin/check
 * Повна перевірка: валідація + розшифровка + пошук на autoRIA
 */
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
    // ✅ НЕ перевіряємо валідацію на check - просто розшифровуємо
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 17);
    const [decode, autoRIA] = await Promise.all([
      vinService.decodeVIN(cleanVin),
      vinService.searchAutoRIA(cleanVin)
    ]);

    res.json({
      success: true,
      vin: cleanVin,
      decode,
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
