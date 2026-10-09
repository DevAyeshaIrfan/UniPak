import apiClient from './client';

const normalizeUniversity = (university) => ({
  ...university,
  id: university.UniversityID,
  name: university.UniversityName,
  Name: university.UniversityName,
  City: university.CityName,
  city: university.CityName,
  sector: university.Sector,
  programCount: university.ProgramCount,
});

const normalizeFaculty = (faculty) => ({
  ...faculty,
  id: faculty.FacultyID,
  name: faculty.FacultyName,
  Name: faculty.FacultyName,
  TestName: faculty.ApplicationMethod,
  AggregateFormulaText: faculty.AggregateFormula,
  admissionTests: (faculty.admissionTests || []).map((test) => ({
    ...test,
    id: test.AdmissionTestID,
    name: test.TestName,
    total: test.TotalMarks == null ? null : Number(test.TotalMarks),
  })),
});

const normalizeComparisonResult = (item) => ({
  university: {
    id: item.universityId,
    name: item.universityName,
    city: item.cityName,
    sector: item.sector,
  },
  faculty: { id: item.facultyId, name: item.facultyName },
  program: {
    id: item.programId,
    name: item.programName || item.facultyName,
    category: item.majorCategory,
  },
  entryTestName: item.selectedTest?.testName || item.selectedTest?.TestName || item.applicationMethod,
  isHolistic: Boolean(item.result?.isHolistic),
  aggregate: item.aggregateScore,
  cutoff: item.cutoff ?? item.minCutoff ?? null,
  cutoffYear: item.cutoffYear ?? null,
  cutoffSession: item.cutoffSession ?? null,
  cutoffBasis: item.cutoffBasis ?? null,
  chance: item.chancePercent ?? null,
  margin: item.margin ?? (
    Number.isFinite(Number(item.aggregateScore)) && Number.isFinite(Number(item.minCutoff))
      ? Number((Number(item.aggregateScore) - Number(item.minCutoff)).toFixed(2))
      : null
  ),
  status: item.status || { label: item.chancePercent || 'Not available', tone: 'neutral' },
  breakdown: (item.result?.breakdown || []).map((part) => ({
    ...part,
    value: part.weightedContribution,
  })),
});

export const getCalculatorUniversities = async () => {
  const response = await apiClient.get('/calculator/universities');
  return { ...response, data: (response.data || []).map(normalizeUniversity) };
};

export const getCalculatorFaculties = async (universityId) => {
  const response = await apiClient.get(`/calculator/faculties/${universityId}`);
  return { ...response, data: (response.data || []).map(normalizeFaculty) };
};

export const calculateAggregate = async (data) => {
  const response = await apiClient.post('/calculator/calculate', data);
  return {
    ...response,
    data: (response.results || []).map((result) => ({
      ...result,
      aggregate: result.result?.aggregateScore,
      isHolistic: Boolean(result.result?.isHolistic),
      breakdown: (result.result?.breakdown || []).map((part) => ({
        ...part,
        weight: part.percentage,
        contribution: part.weightedContribution,
      })),
    })),
  };
};

export const compareUniversities = async (data) => {
  const response = await apiClient.post('/calculator/compare', data);
  const comparison = response.comparison;
  if (!comparison) return response;

  const university1 = normalizeComparisonResult(comparison.university1);
  const university2 = normalizeComparisonResult(comparison.university2);
  return {
    ...response,
    comparison: { university1, university2, recommendation: comparison.recommendation },
  };
};
