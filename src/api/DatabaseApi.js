import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  export const getDatabase = async () => api.get('/database');
  export const createDatabase = async (DatabaseSchema) => api.post('/database', DatabaseSchema);
  export const deleteDatabase = async (id) => api.delete(`/database/${id}`);

  export const getChatDatabase = async (chatId) => api.get(`/chat/database/${chatId}`);


