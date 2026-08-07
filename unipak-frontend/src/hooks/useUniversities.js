import { useQuery } from '@tanstack/react-query';
import * as api from '../api/universities';

export const useUniversities = (filters = {}) => {
  return useQuery({
    queryKey: ['universities', filters],
    queryFn: () => api.getUniversities(filters),
  });
};

export const useUniversitiesDropdown = () => {
  return useQuery({
    queryKey: ['universities', 'dropdown'],
    queryFn: api.getUniversitiesDropdown,
  });
};

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: api.getCities,
  });
};

export const useUniversity = (id) => {
  return useQuery({
    queryKey: ['university', id],
    queryFn: () => api.getUniversity(id),
    enabled: !!id,
  });
};

export const useUniversityPrograms = (id) => {
  return useQuery({
    queryKey: ['university', id, 'programs'],
    queryFn: () => api.getUniversityPrograms(id),
    enabled: !!id,
  });
};

export const useUniversityFaculties = (id) => {
  return useQuery({
    queryKey: ['university', id, 'faculties'],
    queryFn: () => api.getUniversityFaculties(id),
    enabled: !!id,
  });
};

export const useUniversityFees = (id) => {
  return useQuery({
    queryKey: ['university', id, 'fees'],
    queryFn: () => api.getUniversityFees(id),
    enabled: !!id,
  });
};

export const useUniversityHostels = (id) => {
  return useQuery({
    queryKey: ['university', id, 'hostels'],
    queryFn: () => api.getUniversityHostels(id),
    enabled: !!id,
  });
};

export const useUniversityRankings = (id) => {
  return useQuery({
    queryKey: ['university', id, 'rankings'],
    queryFn: () => api.getUniversityRankings(id),
    enabled: !!id,
  });
};

export const useSearchPrograms = (params) => {
  return useQuery({
    queryKey: ['programs', 'search', params],
    queryFn: () => api.searchPrograms(params),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });
};
