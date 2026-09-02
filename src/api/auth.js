import api from './axios';

export default {
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  logout() {
    return api.post('/logout');
  },
  me() {
    return api.get('/user');
  },
  getUser() {
    return api.get('/user');
  }
};
