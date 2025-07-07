import axios from 'axios';
import { getToken } from '../auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Interceptor που προσθέτει το Authorization header
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
