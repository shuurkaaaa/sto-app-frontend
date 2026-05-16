import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const hasToken = Boolean(token && token !== 'null' && token.trim() !== '');
  config._hadAuthToken = hasToken;
  if (hasToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || '');
    const hadAuthToken = Boolean(error?.config?._hadAuthToken);

    const isAuthFlow =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password') ||
      url.includes('/auth/me');

    if ((status === 401 || status === 403) && hadAuthToken && !isAuthFlow) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

