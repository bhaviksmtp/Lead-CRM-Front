import api from './axios';

export default {
  getPipeline() {
    return api.get('/pipeline');
  }
};
