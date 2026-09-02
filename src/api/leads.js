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
  }
};
