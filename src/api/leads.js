import api from './axios';

export default {
  getLeads(params = {}) {
    return api.get('/leads', { params });
  },
  getLead(id) {
    return api.get(`/leads/${id}`);
  },
  createLead(data) {
    return api.post('/leads', data);
  },
  updateLead(id, data) {
    return api.put(`/leads/${id}`, data);
  },
  deleteLead(id) {
    return api.delete(`/leads/${id}`);
  },
  getTimeline(id) {
    return api.get(`/leads/${id}/timeline`);
  },
  addNote(id, data) {
    return api.post(`/leads/${id}/notes`, data);
  },
  markWon(id) {
    return api.post(`/leads/${id}/won`);
  },
  markLost(id, data) {
    return api.post(`/leads/${id}/lost`, data);
  },
  logActivity(id, data) {
    return api.post(`/leads/${id}/activity`, data);
  },
  checkDuplicate(data) {
    return api.post('/leads/check-duplicate', data);
  },
  bulkAssign(data) {
    return api.post('/leads/bulk-assign', data);
  },
  bulkStatus(data) {
    return api.post('/leads/bulk-status', data);
  },
  bulkDelete(data) {
    return api.post('/leads/bulk-delete', data);
  },
  exportLeads() {
    return api.get('/leads/export');
  },
  importLeads(data) {
    return api.post('/leads/import', data);
  },
  getAllActivities(params = {}) {
    return api.get('/activities', { params });
  }
};
