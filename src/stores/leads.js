import { defineStore } from 'pinia';
import leadsApi from '@/api/leads';

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    leads: [],
    pagination: {},
    currentLead: null,
    loading: false,
    timeline: [],
    error: null
  }),
  actions: {
    async fetchLeads(params = {}) {
      this.loading = true;
      try {
        const response = await leadsApi.getLeads(params);
        this.leads = response.data.leads.data;
        this.pagination = response.data.leads.meta || response.data.leads;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch leads';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchLead(id) {
      this.loading = true;
      try {
        const response = await leadsApi.getLead(id);
        this.currentLead = response.data.lead;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch lead';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async createLead(data) {
      this.loading = true;
      try {
        const response = await leadsApi.createLead(data);
        return response.data;
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateLead(id, data) {
      this.loading = true;
      try {
        const response = await leadsApi.updateLead(id, data);
        this.currentLead = response.data.lead;
        return response.data;
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteLead(id) {
      this.loading = true;
      try {
        await leadsApi.deleteLead(id);
        this.leads = this.leads.filter(l => l.id !== id);
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchTimeline(id) {
      try {
        const response = await leadsApi.getTimeline(id);
        this.timeline = response.data.activities;
      } catch (err) {
        console.error('Failed to load timeline', err);
      }
    },
    async addNote(id, note) {
      try {
        const response = await leadsApi.addNote(id, note);
        await this.fetchTimeline(id);
        return response.data;
      } catch (err) {
        throw err;
      }
    },
    async markWon(id) {
      try {
        const response = await leadsApi.markWon(id);
        this.currentLead = response.data.lead;
        return response.data;
      } catch (err) {
        throw err;
      }
    },
    async markLost(id, reason) {
      try {
        const response = await leadsApi.markLost(id, { lost_reason: reason });
        this.currentLead = response.data.lead;
        return response.data;
      } catch (err) {
        throw err;
      }
    }
  }
});
