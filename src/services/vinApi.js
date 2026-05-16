import { apiClient } from './apiClient';

const vinApi = {
  decodeVIN: async (vin) => {
    try {
      const response = await apiClient.post('/vin/decode', { vin });
      return response.data;
    } catch (error) {
      console.error('VIN decode error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка при розшифруванні VIN',
      };
    }
  },

  validateVIN: async (vin) => {
    try {
      const response = await apiClient.post('/vin/validate', { vin });
      return response.data;
    } catch (error) {
      console.error('VIN validation error:', error.response?.data || error.message);
      return {
        success: false,
        valid: false,
        message: error.response?.data?.message || 'Помилка при валідації VIN',
      };
    }
  },

  getHistory: async (vin) => {
    try {
      const response = await apiClient.get(`/vin/history/${encodeURIComponent(vin)}`);
      return response.data;
    } catch (error) {
      console.error('VIN history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка при отриманні історії',
      };
    }
  },

  checkComplete: async (vin) => {
    try {
      const response = await apiClient.post('/vin/check', { vin });
      return response.data;
    } catch (error) {
      console.error('VIN check error:', error.response?.data || error.message);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Помилка при перевірці VIN',
      };
    }
  },
};

export default vinApi;
