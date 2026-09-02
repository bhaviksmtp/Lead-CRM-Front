import api from './axios';

export default {
  getMessages(leadId) {
    return api.get(`/leads/${leadId}/messages`);
  },
  sendMessage(leadId, data) {
    return api.post(`/leads/${leadId}/messages`, data);
  },
  getInbox() {
    return api.get('/whatsapp/inbox');
  },
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
  }
};
