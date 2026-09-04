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
        this.leads = response.data.leads.data || [];
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
      } finally {
        this.loading = false;
      }
    },
    async deleteLead(id) {
      this.loading = true;
      try {
        await leadsApi.deleteLead(id);
        this.leads = this.leads.filter(l => l.id !== id);
      } finally {
        this.loading = false;
      }
    },
    async fetchTimeline(id) {
      try {
        const response = await leadsApi.getTimeline(id);
        this.timeline = response.data.activities || [];
      } catch (err) {
        console.error('Failed to load timeline', err);
      }
    },
    async logActivity(id, data) {
      const response = await leadsApi.logActivity(id, data);
      await this.fetchTimeline(id);
      return response.data;
    },
    async addNote(id, note) {
      const response = await leadsApi.addNote(id, { note });
      await this.fetchTimeline(id);
      return response.data;
    },
    async markWon(id) {
      const response = await leadsApi.markWon(id);
      this.currentLead = response.data.lead;
      return response.data;
    },
    async markLost(id, reason) {
      const response = await leadsApi.markLost(id, { lost_reason: reason });
      this.currentLead = response.data.lead;
      return response.data;
    },
    async checkDuplicate(data) {
      const response = await leadsApi.checkDuplicate(data);
      return response.data;
    },
    async bulkAssign(leadIds, assignedTo) {
      const response = await leadsApi.bulkAssign({ lead_ids: leadIds, assigned_to: assignedTo });
      return response.data;
    },
    async bulkStatus(leadIds, statusId, stageId) {
      const response = await leadsApi.bulkStatus({ lead_ids: leadIds, status_id: statusId, stage_id: stageId });
      return response.data;
    },
    async bulkDelete(leadIds) {
      const response = await leadsApi.bulkDelete({ lead_ids: leadIds });
      return response.data;
    },
    async exportLeads() {
      const response = await leadsApi.exportLeads();
      return response.data.leads || [];
    },
    async importLeads(leadsList, skipDuplicates = true) {
      const response = await leadsApi.importLeads({ leads: leadsList, skip_duplicates: skipDuplicates });
      return response.data;
    }
  }
});
