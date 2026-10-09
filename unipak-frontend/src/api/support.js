import apiClient from './client';

export function submitSupportRequest(payload) {
  return apiClient.post('/support', payload);
}
