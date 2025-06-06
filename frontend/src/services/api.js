import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase.auth.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sessionAPI = {
  create: (data) => api.post('/sessions', data),
  getByCode: (code) => api.get(`/sessions/code/${code}`),
  getMySessions: () => api.get('/sessions/my-sessions'),
  delete: (id) => api.delete(`/sessions/${id}`),
};

export const photoAPI = {
  upload: (sessionId, formData) => api.post(`/photos/upload/${sessionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSessionPhotos: (sessionId, thumbnail = false) => 
    api.get(`/photos/session/${sessionId}?thumbnail=${thumbnail}`),
  getFullResolution: (sessionId, buyerEmail) => 
    api.get(`/photos/session/${sessionId}/full?buyer_email=${buyerEmail}`),
};

export const paymentAPI = {
  create: (data) => api.post('/payments/create', data),
  execute: (data) => api.post('/payments/execute', data),
  verify: (sessionId, buyerEmail) => api.get(`/payments/verify/${sessionId}/${buyerEmail}`),
};

export default api;