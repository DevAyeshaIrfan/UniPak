import apiClient from './client';

export const getUniversities = async (params) => {
  return apiClient.get('/universities', { params });
};

export const getCities = async () => {
  return apiClient.get('/universities/cities');
};

export const getUniversity = async (id) => {
  return apiClient.get(`/universities/${id}`);
};

export const getUniversityFaculties = async (id) => {
  return apiClient.get(`/universities/${id}/faculties`);
};

export const getUniversityPrograms = async (id) => {
  return apiClient.get(`/universities/${id}/programs`);
};

export const getUniversityFees = async (id) => {
  return apiClient.get(`/universities/${id}/fee-structure`);
};

export const getUniversityHostels = async (id) => {
  return apiClient.get(`/universities/${id}/hostels`);
};

export const getUniversityRankings = async (id) => {
  return apiClient.get(`/merit-cutoffs/university/${id}`);
};

export const getTestBreakdowns = async (params) => {
  return apiClient.get('/universities/test-breakdowns', { params });
};
