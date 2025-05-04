import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API fonksiyonları
export const getUsers = async () => api.get('/user');
export const createUser = async (userData) => api.post('/user', userData);
export const deleteUser = async (id) => api.delete(`/user/${id}`);
export const getUserByEmail = async (email) => api.get(`/userByEmail?email=${encodeURIComponent(email)}`);