import api from './axios';

export default {
  getStats(params = {}) {
    return api.get('/dashboard', { params });
  },
  getEmployeePerformance(params = {}) {
    return api.get('/employee-performance', { params });
  }
};
