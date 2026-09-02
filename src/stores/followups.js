import { defineStore } from 'pinia';
import followupsApi from '@/api/followups';

export const useFollowUpsStore = defineStore('followups', {
  state: () => ({
    followUps: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchFollowUps(params = {}) {
      this.loading = true;
      try {
        const response = await followupsApi.getFollowUps(params);
        this.followUps = response.data.follow_ups;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to load follow-ups';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async createFollowUp(data) {
      this.loading = true;
      try {
        const response = await followupsApi.createFollowUp(data);
        return response.data;
      } finally {
        this.loading = false;
      }
    },
    async completeFollowUp(id, notes) {
      const response = await followupsApi.completeFollowUp(id, notes);
      this.followUps = this.followUps.map(f => f.id === id ? response.data.follow_up : f);
      return response.data;
    },
    async rescheduleFollowUp(id, scheduledAt, notes) {
      const response = await followupsApi.rescheduleFollowUp(id, scheduledAt, notes);
      this.followUps = this.followUps.map(f => f.id === id ? response.data.follow_up : f);
      return response.data;
    },
    async deleteFollowUp(id) {
      await followupsApi.deleteFollowUp(id);
      this.followUps = this.followUps.filter(f => f.id !== id);
    }
  }
});
