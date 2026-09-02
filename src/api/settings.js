import api from './axios';

export default {
  // Lead Sources
  getSources() {
    return api.get('/lead-sources');
  },
  createSource(data) {
    return api.post('/lead-sources', data);
  },
  updateSource(id, data) {
    return api.put(`/lead-sources/${id}`, data);
  },
  deleteSource(id) {
    return api.delete(`/lead-sources/${id}`);
  },

  // Lead Statuses
  getStatuses() {
    return api.get('/lead-statuses');
  },
  createStatus(data) {
    return api.post('/lead-statuses', data);
  },
  updateStatus(id, data) {
    return api.put(`/lead-statuses/${id}`, data);
  },
  deleteStatus(id) {
    return api.delete(`/lead-statuses/${id}`);
  },

  // Lead Stages
  getStages() {
    return api.get('/lead-stages');
  },
  createStage(data) {
    return api.post('/lead-stages', data);
  },
  updateStage(id, data) {
    return api.put(`/lead-stages/${id}`, data);
  },
  deleteStage(id) {
    return api.delete(`/lead-stages/${id}`);
  }
};
