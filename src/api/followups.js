import api from './axios';

export default {
  getFollowUps(params = {}) {
    return api.get('/follow-ups', { params });
  },
  createFollowUp(data) {
    return api.post('/follow-ups', data);
  },
  updateFollowUp(id, data) {
    return api.put(`/follow-ups/${id}`, data);
  },
  deleteFollowUp(id) {
    return api.delete(`/follow-ups/${id}`);
  },
  completeFollowUp(id, notes) {
    return api.post(`/follow-ups/${id}/complete`, { notes });
  },
  rescheduleFollowUp(id, scheduledAt, notes) {
    return api.post(`/follow-ups/${id}/reschedule`, { scheduled_at: scheduledAt, notes });
  }
};
