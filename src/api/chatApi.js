import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API fonksiyonları
export const getChats = async (userId) =>
  axios.get(`/api/chat?userId=${userId}`);

export const createChat = async (chatTitle, userId) =>
  axios.post('/api/chat', { chatTitle, userId });

export const deleteChat = async (id) => api.delete(`/chat/${id}`);
