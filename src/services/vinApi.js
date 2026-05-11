import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/vin';

const getAuthToken = () => localStorage.getItem('token');

const vinApi = {
  decodeVIN: async (vin) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/decode`, { vin }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('VIN decode error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка при розшифруванні VIN'
      };
    }
  },

  validateVIN: async (vin) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/validate`, { vin }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('VIN validation error:', error.response?.data || error.message);
      return {
        success: false,
        valid: false,
        message: error.response?.data?.message || 'Помилка при валідації VIN'
      };
    }
  },

  getHistory: async (vin) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${vin}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('VIN history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка при отриманні історії'
      };
    }
  },

  checkComplete: async (vin) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/check`, { vin }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      return response.data;
    } catch (error) {
      console.error('VIN check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка при перевірці VIN'
      };
    }
  }
};

export default vinApi;
