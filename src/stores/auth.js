import { defineStore } from 'pinia';
import authApi from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('access_token') || null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => (state.user?.roles?.[0]) || 'Salesperson',
    roles: (state) => state.user?.roles || [],
    permissions: (state) => state.user?.permissions || []
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authApi.login(credentials);
        const data = response.data;
        
        this.token = data.access_token;
        this.user = data.user;

        localStorage.setItem('access_token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await authApi.logout();
      } catch (err) {
        console.error('Logout API call failed, removing local credentials anyway.', err);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    },
    async fetchUser() {
      if (!this.token) return null;
      try {
        const response = await authApi.getUser();
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (err) {
        if (err.response?.status === 401) {
          this.logout();
        }
        console.error('Failed to sync user data:', err);
        return null;
      }
    },
    hasPermission(permission) {
      if (!this.user) return false;
      if (this.roles.includes('Super Admin') || this.roles.includes('Company Admin')) return true;
      if (Array.isArray(permission)) {
        return permission.some(p => this.permissions.includes(p));
      }
      return this.permissions.includes(permission);
    },
    hasAnyPermission(permissions = []) {
      if (!this.user) return false;
      if (this.roles.includes('Super Admin') || this.roles.includes('Company Admin')) return true;
      return permissions.some(p => this.permissions.includes(p));
    },
    hasAllPermissions(permissions = []) {
      if (!this.user) return false;
      if (this.roles.includes('Super Admin') || this.roles.includes('Company Admin')) return true;
      return permissions.every(p => this.permissions.includes(p));
    },
    hasRole(role) {
      if (!this.user) return false;
      if (Array.isArray(role)) {
        return role.some(r => this.roles.includes(r));
      }
      return this.roles.includes(role);
    }
  }
});
