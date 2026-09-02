import api from './axios';

export default {
  getRoles() {
    return api.get('/roles');
  },
  getPermissions() {
    return api.get('/permissions');
  },
  createRole(data) {
    return api.post('/roles', data);
  },
  updateRole(id, data) {
    return api.put(`/roles/${id}`, data);
  },
  deleteRole(id) {
    return api.delete(`/roles/${id}`);
  },
  updateUserPermissions(userId, data) {
    return api.post(`/users/${userId}/roles-permissions`, data);
  }
};
