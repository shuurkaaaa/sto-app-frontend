const axios = require('axios');
const autoRiaService = require('./autoRiaService');

const vinServiceNew = {
  decodeVIN: async (vin) => {
    try {
      if (!vin || vin.length < 9) {
        return {
          success: false,
          error: 'VIN-код повинен містити мінімум 9 символів'
        };
      }

      const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 17);

      let result = await vinServiceNew.decodeFromCarQuery(cleanVin);
      if (result.success) return result;

      result = await vinServiceNew.decodeFromNHTSA(cleanVin);
      if (result && result.make) {
        const pos = vinServiceNew.decodeFromVINPosition(cleanVin);
        const hasModel = result.model && String(result.model).trim() !== '';
        const hasYear = result.year && String(result.year).trim() !== '' && result.year !== 'Unknown';
        if (hasModel && hasYear) return result;
        return {
          success: true,
          source: hasModel && hasYear ? 'NHTSA' : 'NHTSA+VIN_POSITION',
          vin: cleanVin,
          make: result.make,
          model: hasModel ? result.model : pos.model,
          year: hasYear ? String(result.year) : String(pos.year),
          body: result.body,
          engine: result.engine,
          fuel: result.fuel,
          info: !hasModel || !hasYear ? pos.info : undefined,
        };
      }

      return vinServiceNew.decodeFromVINPosition(cleanVin);
    } catch (error) {
      console.error('VIN decode error:', error.message);
      return {
        success: false,
        error: `Помилка при розшифруванні VIN: ${error.message}`
      };
    }
  },

  decodeFromCarQuery: async (vin) => {
    try {
      const response = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=decodeVin&vin=${vin}`, {
        responseType: 'text',
        timeout: 5000
      });

      let data = response.data;
      if (typeof data === 'string') {
        const parsedText = data.trim();
        try {
          data = JSON.parse(parsedText);
        } catch (jsonError) {
          const jsonMatch = parsedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
          }
        }
      }

      if (data.status === 'ok' && data.model_year) {
        return {
          success: true,
          source: 'CarQueryAPI',
          vin,
          make: data.model_make || 'Unknown',
          model: data.model_name || 'Unknown',
          year: String(data.model_year),
          body: data.model_body || 'Unknown',
          engine: data.model_engine_cc || 'Unknown',
          fuel: data.model_fuel_type || 'Unknown'
        };
      }

      return { success: false, error: 'CarQuery не знайшов дані' };
    } catch (error) {
      console.warn('CarQuery API error:', error.message);
      return { success: false, error: error.message };
    }
  },

  decodeFromNHTSA: async (vin) => {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
        { timeout: 5000 }
      );

      if (!response.data.Results || response.data.Results.length === 0) {
        return { success: false, error: 'NHTSA: немає результатів' };
      }

      const results = response.data.Results;
      const make = results.find(r => r.Variable === 'Make')?.Value;
      const model = results.find(r => r.Variable === 'Model')?.Value;
      const year = results.find(r => r.Variable === 'Model Year')?.Value;
      const series = results.find(r => r.Variable === 'Series')?.Value;
      const series2 = results.find(r => r.Variable === 'Series2')?.Value;

      if (make) {
        return {
          success: true,
          source: 'NHTSA',
          vin,
          make,
          model: model || series || series2 || null,
          year: year || null,
        };
      }

      return { success: false, error: 'NHTSA: немає марки' };
    } catch (error) {
      console.warn('NHTSA API error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /** 10-й символ VIN (індекс 9): рік моделі (30-річний цикл + цифри). */
  decodeModelYearChar: (c, vin) => {
    if (!c) return null;
    const now = new Date().getFullYear();
    const pick = (years) => {
      const arr = years.filter((y) => typeof y === 'number' && y >= 1980 && y <= now + 1);
      return arr.length ? Math.max(...arr) : years[0];
    };

    if (/^[1-9]$/.test(c)) {
      const d = Number(c);
      return pick([2000 + d, 2030 + d]);
    }
    if (c === '0') {
      // «0» у 10-й позиції формально рідко; для євро-BMW інколи сплутують з «O» / зсув колонки
      if (vin && /^WBA/.test(vin) && vin.charAt(10) === 'L') return 2020;
      return pick([2010, 2040]);
    }

    const letterCycle = {
      A: [1980, 2010], B: [1981, 2011], C: [1982, 2012], D: [1983, 2013], E: [1984, 2014],
      F: [1985, 2015], G: [1986, 2016], H: [1987, 2017], J: [1988, 2018], K: [1989, 2019],
      L: [1990, 2020], M: [1991, 2021], N: [1992, 2022], P: [1993, 2023], R: [1994, 2024],
      S: [1995, 2025], T: [1996, 2026], V: [1997, 2027], W: [1998, 2028], X: [1999, 2029], Y: [2000, 2030],
    };
    const pair = letterCycle[c];
    if (pair) return pick(pair);
    return null;
  },

  guessModelFromVinHeuristic: (vin, make) => {
    const v = String(vin || '').toUpperCase();
    if (!v || v.length < 8) return 'За каталогом марки (VIN)';

    if (make === 'BMW' && /^WBA|^WBX|^WBS/.test(v)) {
      const code = v.charAt(4);
      if ('FGH'.includes(code)) return '3 / 4 Series (за VIN-серією, орієнтовно)';
      if ('UV'.includes(code)) return '5 / 6 Series (за VIN-серією, орієнтовно)';
      if ('ST'.includes(code)) return '7 / 8 Series (за VIN-серією, орієнтовно)';
      if ('XY'.includes(code)) return 'X-модель (за VIN-серією, орієнтовно)';
      return 'BMW (Європа, за серією кузова в VIN)';
    }
    if (make === 'Audi' && /^WA/.test(v)) return 'Audi (імпорт, за WMI)';
    if (make === 'Volkswagen' && /^WV|^WVG/.test(v)) return 'Volkswagen (Європа, за WMI)';
    if (make === 'Mercedes-Benz' && /^WDD|^WDB|^WDC/.test(v)) return 'Mercedes-Benz (Європа, за WMI)';
    if (make === 'Tesla' && /^5YJ/.test(v)) return 'Model 3 / Y (за WMI, орієнтовно)';
    if (make === 'Toyota' && /^5T|^JT/.test(v)) return 'Toyota SUV / легковик (за WMI)';
    if (make === 'Škoda' || make === 'Skoda') return 'Škoda (Європа, за WMI)';
    if (make === 'Nissan' && /^JN/.test(v)) return 'Nissan (імпорт, за WMI)';

    return 'Уточніть модель за повним каталогом';
  },

  decodeFromVINPosition: (vin) => {
    const wmi = vin.substring(0, 3);
    const wmiMap = {
      'WAU': 'Audi', 'WA1': 'Audi',
      'BMW': 'BMW', 'WBA': 'BMW', 'WBX': 'BMW', 'WBS': 'BMW',
      'VWV': 'Volkswagen', 'WVW': 'Volkswagen', 'WV1': 'Volkswagen', 'WV2': 'Volkswagen', 'WVG': 'Volkswagen',
      'WDB': 'Mercedes-Benz', 'WDC': 'Mercedes-Benz', 'WDD': 'Mercedes-Benz',
      'WP0': 'Porsche', 'WP1': 'Porsche',
      'ZFF': 'Ferrari', 'ZHW': 'Lamborghini',
      'VSS': 'Volvo', 'YV1': 'Volvo', 'VF1': 'Renault', 'VF3': 'Renault', 'VF7': 'Peugeot',
      'JT2': 'Toyota', 'JT3': 'Toyota', 'JTD': 'Toyota', '4T1': 'Toyota', '4T4': 'Toyota', '5TD': 'Toyota',
      'JH2': 'Honda', 'JH3': 'Honda', '1HG': 'Honda',
      'JN1': 'Nissan',
      'KMH': 'Hyundai', 'KNE': 'Hyundai', 'KNA': 'Kia', 'KNB': 'Kia',
      'JM1': 'Mazda', 'JM2': 'Mazda', 'JF1': 'Subaru', 'JF2': 'Subaru', 'MMC': 'Mitsubishi',
      'WOL': 'Opel', 'TMB': 'Škoda',
      '1FA': 'Ford', '1FM': 'Ford', '1FT': 'Ford', '1FC': 'Ford', 'WF0': 'Ford',
      '1G1': 'Chevrolet', '1G2': 'Chevrolet', '1GC': 'Chevrolet',
      '1GT': 'Chevrolet', '1G6': 'Cadillac',
      '1B3': 'Dodge', '1B7': 'Dodge', '2B3': 'Chrysler', '2C3': 'Chrysler',
      '1J4': 'Jeep', '1J8': 'Jeep',
      'SCA': 'Rolls-Royce', 'SCB': 'Bentley',
      '5YJ': 'Tesla',
    };

    let make = wmiMap[wmi] || 'Unknown';
    if (make === 'Unknown') {
      const wmi4 = vin.substring(0, 4);
      if (wmi4 === 'JN1T' || wmi4 === 'JN1B') make = 'Nissan';
    }

    const y10 = vinServiceNew.decodeModelYearChar(vin.charAt(9), vin);
    const year = y10 != null ? y10 : 'Unknown';

    const model = make === 'Unknown'
      ? 'За каталогом (невідомий WMI)'
      : vinServiceNew.guessModelFromVinHeuristic(vin, make);

    return {
      success: true,
      source: 'VIN_POSITION',
      vin,
      make,
      model,
      year: String(year),
      info: 'Рік і модель — евристика з 10-го символу VIN та WMI (для євро-авто NHTSA часто без моделі).',
    };
  },

  validateVIN: (vin) => {
    if (!vin) return { valid: false, message: 'VIN-код не вказаний' };

    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleanVin.length !== 17) {
      return { valid: false, message: `VIN повинен містити 17 символів (отримано: ${cleanVin.length})` };
    }

    if (/[IOQ]/i.test(cleanVin)) {
      return { valid: false, message: 'VIN-код містить недопустимі символи (I, O, Q)' };
    }

    const transliterate = (char) => {
      if (/\d/.test(char)) return Number(char);
      const map = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
        J: 1, K: 2, L: 3, M: 4, N: 5,
        P: 7, R: 9,
        S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
      };
      return map[char];
    };

    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const checkDigit = cleanVin.charAt(8);

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = cleanVin.charAt(i);
      const value = transliterate(char);
      if (value === undefined) {
        return { valid: false, message: `Недопустимий символ у VIN: ${char}` };
      }
      sum += value * weights[i];
    }

    const calculatedCheckDigit = sum % 11;
    const expectedCheckDigit = calculatedCheckDigit === 10 ? 'X' : String(calculatedCheckDigit);

    if (checkDigit !== expectedCheckDigit) {
      return {
        valid: false,
        message: 'Невірна контрольна цифра VIN',
        expected: expectedCheckDigit,
        actual: checkDigit,
      };
    }

    return { valid: true, message: 'VIN-код валідний' };
  },

  searchAutoRIA: async (vin) => {
    return autoRiaService.searchByVin(vin);
  },

  getFullInfo: async (vin) => {
    const validation = vinServiceNew.validateVIN(vin);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const [decodeResult, autoRIAResult] = await Promise.all([
      vinServiceNew.decodeVIN(cleanVin),
      vinServiceNew.searchAutoRIA(cleanVin)
    ]);

    return {
      success: true,
      vin: cleanVin,
      validation,
      decode: decodeResult,
      autoRIA: autoRIAResult,
      primary: decodeResult.success ? decodeResult : null
    };
  }
};

module.exports = vinServiceNew;
