import api from './axios';

export default {
  getUsers() {
    return api.get('/users');
  },
  createUser(data) {
    return api.post('/users', data);
  },
  updateUser(id, data) {
    return api.put(`/users/${id}`, data);
  },
  deleteUser(id) {
    return api.delete(`/users/${id}`);
  }
};
