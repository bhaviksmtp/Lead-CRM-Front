import { defineStore } from 'pinia';
import dashboardApi from '@/api/dashboard';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {},
    charts: {},
    todayFollowUpsList: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchDashboardStats() {
      this.loading = true;
      try {
        const response = await dashboardApi.getStats();
        const data = response.data.data;
        this.stats = data.stats;
        this.charts = data.charts;
        this.todayFollowUpsList = data.today_follow_ups_list;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to load dashboard statistics';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
