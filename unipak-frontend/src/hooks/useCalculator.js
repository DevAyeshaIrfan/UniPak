import { useQuery, useMutation } from '@tanstack/react-query';
import * as api from '../api/calculator';

export const useCalculatorUniversities = () => {
  return useQuery({
    queryKey: ['calculator', 'universities'],
    queryFn: api.getCalculatorUniversities,
  });
};

export const useCalculatorFaculties = (universityId) => {
  return useQuery({
    queryKey: ['calculator', 'faculties', universityId],
    queryFn: () => api.getCalculatorFaculties(universityId),
    enabled: !!universityId,
  });
};

export const useCalculateAggregate = () => {
  return useMutation({
    mutationFn: (data) => api.calculateAggregate(data),
  });
};

export const useCompareUniversities = () => {
  return useMutation({
    mutationFn: (data) => api.compareUniversities(data),
  });
};
