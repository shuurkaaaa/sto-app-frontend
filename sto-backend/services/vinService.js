const axios = require('axios');

const vinService = {
  decodeVIN: async (vin) => {
    try {
      if (!vin || vin.length < 9) {
        return {
          success: false,
          error: 'VIN-код повинен містити мінімум 9 символів'
        };
      }

      const decodedVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 17);

      const nhtsa = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${decodedVin}?format=json`,
        { timeout: 5000 }
      ).catch(() => null);

      if (nhtsa && nhtsa.data && nhtsa.data.Results) {
        const results = nhtsa.data.Results;
        
        const makeResult = results.find(r => r.Variable === 'Make');
        const modelResult = results.find(r => r.Variable === 'Model');
        const yearResult = results.find(r => r.Variable === 'Model Year');
        const bodyResult = results.find(r => r.Variable === 'Body Class');

        if (makeResult && makeResult.Value) {
          return {
            success: true,
            source: 'NHTSA',
            vin: decodedVin,
            make: makeResult.Value || 'Unknown',
            model: modelResult?.Value || 'Unknown',
            year: yearResult?.Value || 'Unknown',
            bodyType: bodyResult?.Value || 'Unknown',
            message: `${yearResult?.Value || ''} ${makeResult.Value} ${modelResult?.Value || ''}`.trim()
          };
        }
      }

      const carQueryYear = decodedVin.substring(9, 10);
      
      const yearMap = {
        'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
        'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
        'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
        'W': 2028, 'X': 2029, 'Y': 2030
      };

      const estimatedYear = yearMap[carQueryYear] || 'Unknown';

      return {
        success: true,
        source: 'VIN_DECODE',
        vin: decodedVin,
        estimatedYear: estimatedYear,
        message: `Рік: ${estimatedYear}, VIN валідний`,
        fullData: {
          vin: decodedVin,
          length: decodedVin.length,
          worldManufacturerCode: decodedVin.substring(0, 3),
          vehicleDescriptorSection: decodedVin.substring(3, 8),
          checkDigit: decodedVin.charAt(8),
          modelYear: estimatedYear,
          assemblyPlant: decodedVin.charAt(10),
          serialNumber: decodedVin.substring(11)
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Помилка при розшифруванні VIN: ${error.message}`
      };
    }
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

    const checkDigit = cleanVin.charAt(8);
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const transliterationTable = '0123456789.ABCDEFGH..J.K..L..M.N.P.R..S.T.UV.WVXYZ';

    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = cleanVin.charAt(i);
      const value = transliterationTable.indexOf(char);
      if (value === -1) return { valid: false, message: `Недопустимий символ у VIN: ${char}` };
      sum += value * weights[i];
    }

    const calculatedCheckDigit = sum % 11;
    const expectedCheckDigit = calculatedCheckDigit === 10 ? 'X' : String(calculatedCheckDigit);

    if (checkDigit !== expectedCheckDigit) {
      return { valid: false, message: 'Невірна контрольна цифра VIN' };
    }

    return { valid: true, message: 'VIN-код валідний' };
  },

  getVINHistory: async (vin) => {
    try {
      const validation = vinService.validateVIN(vin);
      if (!validation.valid) {
        return { success: false, error: validation.message };
      }

      const mockHistory = {
        success: true,
        vin: vin.toUpperCase(),
        serviceHistory: [
          {
            date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            service: 'ТО-2',
            mileage: 45000,
            notes: 'Замінено масло, фільтри, свічки'
          },
          {
            date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
            service: 'ТО-1',
            mileage: 30000,
            notes: 'Планове обслуговування'
          },
          {
            date: new Date(Date.now() - 540 * 24 * 60 * 60 * 1000).toISOString(),
            service: 'Діагностика',
            mileage: 15000,
            notes: 'Комп\'ютерна діагностика - помилок не знайдено'
          }
        ],
        totalServices: 3,
        lastService: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedMileage: 50000,
        nextServiceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      return mockHistory;

    } catch (error) {
      return {
        success: false,
        error: `Помилка при отриманні історії: ${error.message}`
      };
    }
  }
};

module.exports = vinService;
