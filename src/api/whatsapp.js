import api from './axios';

export default {
  // Conversation messages for a lead
  getMessages(leadId, params = {}) {
    return api.get(`/leads/${leadId}/messages`, { params, skipLoader: true });
  },
  sendMessage(leadId, data) {
    return api.post(`/leads/${leadId}/messages`, data);
  },
  getWindowStatus(leadId) {
    return api.get(`/leads/${leadId}/whatsapp/window`, { skipLoader: true });
  },

  // Templates
  getTemplates() {
    return api.get('/whatsapp/templates');
  },
  createTemplate(data) {
    return api.post('/whatsapp/templates', data);
  },
  updateTemplate(id, data) {
    return api.put(`/whatsapp/templates/${id}`, data);
  },
  deleteTemplate(id) {
    return api.delete(`/whatsapp/templates/${id}`);
  },

  // WhatsApp connection health
  getStatus() {
    return api.get('/whatsapp/status');
  }
};
