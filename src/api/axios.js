import axios from 'axios';
import { useLoadingStore } from '@/stores/loading';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Helper functions for safely triggering loading state
const startGlobalLoader = (config) => {
  if (config && !config.skipLoader) {
    try {
      useLoadingStore().startLoading();
    } catch {
      // Pinia might not be initialized yet
    }
  }
};

const stopGlobalLoader = (config) => {
  if (config && !config.skipLoader) {
    try {
      useLoadingStore().stopLoading();
    } catch {
      // Pinia might not be initialized yet
    }
  }
};

// Attach Bearer token on every request & start loader
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    startGlobalLoader(config);
    return config;
  },
  (error) => {
    stopGlobalLoader(error.config);
    return Promise.reject(error);
  }
);

// Handle response & stop loader globally
api.interceptors.response.use(
  (response) => {
    stopGlobalLoader(response.config);
    return response;
  },
  (error) => {
    stopGlobalLoader(error.config);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

