import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const getPromptSetting = async () => api.get('/prompt-setting');
export const createPromptSetting = async (promptSetting) => api.post('/prompt-setting', promptSetting);
export const deletePromptSetting = async (id) => api.delete(`/prompt-setting/${id}`);

