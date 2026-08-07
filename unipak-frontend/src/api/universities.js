import apiClient from './client';

export const getUniversities = async (params) => {
  return apiClient.get('/universities', { params });
};

export const getUniversitiesDropdown = async () => {
  return apiClient.get('/universities/dropdown');
};

export const getCities = async () => {
  return apiClient.get('/universities/cities');
};

export const getUniversitiesByCity = async (cityName) => {
  return apiClient.get(`/universities/city/${encodeURIComponent(cityName)}`);
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

export const searchPrograms = async (params) => {
  return apiClient.get('/universities/programs/search', { params });
};

export const getCategories = async () => {
  return apiClient.get('/universities/programs/categories');
};

export const getAdmissionTests = async () => {
  return apiClient.get('/universities/admission-tests');
};

export const getTestBreakdowns = async (params) => {
  return apiClient.get('/universities/test-breakdowns', { params });
};
