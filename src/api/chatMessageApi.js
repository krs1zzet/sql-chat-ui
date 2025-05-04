import axios from 'axios';

const API_URL = '/api/chat-messages';

// Axios instance oluştur
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API fonksiyonları
export const getChatMessages = async (chatId) =>
  axios.get(`${API_URL}/chat/${chatId}`);

export const createChatMessage = async (data) =>
  axios.post(API_URL, data);

export const deleteChatMessage = async (id) => api.delete(`/chat-messages/${id}`);
