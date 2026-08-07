import apiClient from './client';

export const sendChatMessage = ({ message, history }) => (
  apiClient.post('/chat', { message, history }, { timeout: 25000 })
);
