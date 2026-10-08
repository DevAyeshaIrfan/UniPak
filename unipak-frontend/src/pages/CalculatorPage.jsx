import { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, GraduationCap, BookOpen, ChevronRight, ChevronLeft, 
  ArrowRight, Check, AlertCircle, RotateCcw, Save, Info, Search, Sparkles 
} from 'lucide-react';
import { 
  useCalculatorUniversities, 
  useCalculatorFaculties, 
  useCalculateAggregate 
} from '../hooks/useCalculator';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import GradientText from '../components/ui/GradientText';
import StepIndicator from '../components/ui/StepIndicator';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import LedgerLine from '../components/ui/LedgerLine';
import { cn, universityImages } from '../lib/utils';
import { SavedContext } from '../store/SavedContext';

const STEPS = [
  { id: 1, label: 'University' },
  { id: 2, label: 'Faculty' },
  { id: 3, label: 'Marks' },
  { id: 4, label: 'Results' }
];

export default function CalculatorPage() {
  const { saveResult } = useContext(SavedContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [testEntries, setTestEntries] = useState({});
  const [hasSavedResults, setHasSavedResults] = useState(false);
  
  const [marks, setMarks] = useState({
    matricMarks: '',
    matricTotal: 1100,
    intermediateMarks: '',
    intermediateTotal: 1100,
    entryTestScore: '',
    entryTestTotal: 200
  });

  const { data: universitiesResponse, isLoading: isLoadingUniversities } = useCalculatorUniversities();
  const universities = universitiesResponse?.data || [];
  
  const { data: facultiesResponse, isLoading: isLoadingFaculties } = useCalculatorFaculties(
    selectedUniversity?.id
  );
  const faculties = facultiesResponse?.data || [];

  const { mutate: calculate, data: resultsResponse, isPending: isCalculating, error: calculateError } = useCalculateAggregate();
  const results = resultsResponse?.data || [];

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return universities;
    return universities.filter(u => 
      u.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.City?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [universities, searchQuery]);

  const requiredFields = useMemo(() => {
    const fields = new Set();
    let hasHolistic = false;
    
    selectedFaculties.forEach(fac => {
      if (fac.isHolistic) {
        hasHolistic = true;
      }
      fac.structuredWeights?.forEach(w => {
        const type = w.ComponentType?.toLowerCase();
        if (type?.includes('matric') || type?.includes('olevel')) fields.add('matric');
        else if (type?.includes('inter') || type?.includes('fsc') || type?.includes('alevel')) fields.add('intermediate');
        else fields.add('entryTest');
      });
    });

    return { fields, hasHolistic };
  }, [selectedFaculties]);

  const liveAggregatePreview = useMemo(() => {
    const faculty = selectedFaculties[0];
    if (!faculty?.structuredWeights?.length || faculty.isHolistic) return null;
    const scoreFor = (component) => {
      const type = String(component || '').toLowerCase();
      if (type.includes('matric') || type.includes('olevel')) return Number(marks.matricTotal) > 0 ? (Number(marks.matricMarks || 0) / Number(marks.matricTotal)) * 100 : 0;
      if (type.includes('inter') || type.includes('fsc') || type.includes('alevel')) return Number(marks.intermediateTotal) > 0 ? (Number(marks.intermediateMarks || 0) / Number(marks.intermediateTotal)) * 100 : 0;
      const entry = testEntries[faculty.id] || {};
      return Number(entry.total) > 0 ? (Number(entry.score || 0) / Number(entry.total)) * 100 : 0;
    };
    return Math.min(100, Math.max(0, faculty.structuredWeights.reduce((total, weight) => total + (scoreFor(weight.ComponentType) * Number(weight.WeightPercentage || 0)) / 100, 0)));
  }, [marks, selectedFaculties, testEntries]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSelectUniversity = (university) => {
    if (selectedUniversity?.id !== university.id) {
      // Faculty and test selections belong to one university only. Clear them
      // before loading another university so stale entry-test forms cannot leak
      // into the next calculation.
      setSelectedFaculties([]);
      setTestEntries({});
    }
    setSelectedUniversity(university);
  };

  const handleCalculate = () => {
    setHasSavedResults(false);
    const payload = {
      facultyIds: selectedFaculties.map(f => f.id),
      matricMarks: Number(marks.matricMarks),
      matricTotal: Number(marks.matricTotal),
      intermediateMarks: Number(marks.intermediateMarks),
      intermediateTotal: Number(marks.intermediateTotal),
      entryTestSelections: selectedFaculties
        .filter(faculty => faculty.structuredWeights?.some(weight => weight.ComponentType === 'entry_test'))
        .map(faculty => ({
          facultyId: faculty.id,
          admissionTestId: Number(testEntries[faculty.id]?.admissionTestId),
          score: Number(testEntries[faculty.id]?.score),
          total: Number(testEntries[faculty.id]?.total),
        }))
    };
    
    calculate(payload, {
      onSuccess: () => {
        handleNext();
      }
    });
  };

  const handleSelectFaculty = (faculty) => {
    if (selectedFaculties[0]?.id === faculty.id) return;

    setSelectedFaculties([faculty]);
    setTestEntries({});
  };

  const resetCalculator = () => {
    setCurrentStep(1);
    setSelectedUniversity(null);
    setSelectedFaculties([]);
    setTestEntries({});
    setHasSavedResults(false);
    setMarks({
      matricMarks: '', matricTotal: 1100,
      intermediateMarks: '', intermediateTotal: 1100,
      entryTestScore: '', entryTestTotal: 200
    });
  };

  const handleSaveResults = () => {
    const savedAt = new Date().toISOString();

    results.forEach((result) => {
      const faculty = selectedFaculties.find((item) => item.id === result.facultyId);
      const universityId = result.universityId ?? selectedUniversity?.id;
      const facultyId = result.facultyId ?? faculty?.id;
      const aggregate = Number(result.aggregate);

      saveResult({
        id: `${universityId}-${facultyId}`,
        date: savedAt,
        universityId,
        universityName: result.universityName || selectedUniversity?.Name,
        facultyId,
        facultyName: result.facultyName || faculty?.Name,
        aggregate: Number.isFinite(aggregate) ? aggregate : null,
        isHolistic: Boolean(result.isHolistic || faculty?.isHolistic),
      });
    });

    setHasSavedResults(true);
  };

  const isMarksValid = () => {
    const { fields } = requiredFields;
    if (fields.has('matric') && (!marks.matricMarks || Number(marks.matricMarks) > Number(marks.matricTotal))) return false;
    if (fields.has('intermediate') && (!marks.intermediateMarks || Number(marks.intermediateMarks) > Number(marks.intermediateTotal))) return false;
    if (fields.has('entryTest')) {
      const testFaculties = selectedFaculties.filter(faculty => faculty.structuredWeights?.some(weight => weight.ComponentType === 'entry_test'));
      if (testFaculties.some(faculty => {
        const entry = testEntries[faculty.id];
        return !entry?.admissionTestId || !entry?.score || !entry?.total || Number(entry.score) > Number(entry.total);
      })) return false;
    }
    return true;
  };

  // Step Components
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Choose Your University</h2>
        <p className="text-slate-500 dark:text-slate-400">Select the university you want to calculate aggregate for.</p>
      </div>

      <div className="relative max-w-md mx-auto mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <Input
          type="text"
          aria-label="Search universities"
          placeholder="Search universities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {isLoadingUniversities ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : filteredUniversities.length === 0 ? (
        <EmptyState icon={Search} title="No universities found" description="Try adjusting your search criteria." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredUniversities.map((uni) => (
            <Card
              key={uni.id}
              as="button"
              type="button"
              aria-pressed={selectedUniversity?.id === uni.id}
              onClick={() => handleSelectUniversity(uni)}
              className={cn(
                "text-left w-full cursor-pointer transition-[border-color,box-shadow] hover:shadow-soft-lg",
                selectedUniversity?.id === uni.id 
                  ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                  : "hover:border-indigo-200 dark:hover:border-indigo-800"
              )}
            >
              <div className="flex items-start gap-3">
                <img 
                  src={universityImages[uni.id] || '/images/default-uni.jpg'} 
                  alt={uni.Name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-snug">{uni.Name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{uni.City}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" size="sm">{uni.Sector}</Badge>
                    <Badge variant="secondary" size="sm">{uni.programCount} Programs</Badge>
                  </div>
                </div>
                {selectedUniversity?.id === uni.id && (
                  <Check className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
        <Button 
          onClick={handleNext} 
          disabled={!selectedUniversity}
          size="lg"
          rightIcon={<ChevronRight className="h-5 w-5" />}
        >
          Next Step
        </Button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Select Department / Faculty</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Choose one faculty you want to apply to. Different faculties may have different aggregate formulas.
        </p>
      </div>

      {isLoadingFaculties ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : faculties.length === 0 ? (
        <EmptyState icon={AlertCircle} title="No faculties found" description="This university hasn't added any faculties yet." />
      ) : (
        <div className="grid gap-4 max-w-2xl mx-auto">
          {faculties.map((faculty) => {
            const isSelected = selectedFaculties.some(f => f.id === faculty.id);
            return (
              <Card
                key={faculty.id}
                as="button"
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectFaculty(faculty)}
                className={cn(
                  "text-left w-full cursor-pointer transition-[border-color,box-shadow] hover:shadow-soft-lg p-5",
                  isSelected 
                    ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                    : "hover:border-indigo-200 dark:hover:border-indigo-800"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center mt-1 flex-shrink-0 transition-colors",
                    isSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-300 dark:border-slate-600"
                  )}>
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{faculty.Name}</h3>
                      {faculty.TestName && <Badge variant="primary">{faculty.TestName}</Badge>}
                    </div>
                    
                    {faculty.isHolistic ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 p-2 rounded-md text-sm">
                        <Info className="h-4 w-4" />
                        <span>This faculty uses holistic review (interviews, essays, etc.).</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{faculty.AggregateFormulaText}</p>
                        {faculty.structuredWeights && faculty.structuredWeights.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {faculty.structuredWeights.map((w, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {w.WeightPercentage}% {w.ComponentType}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-8 max-w-2xl mx-auto">
        <Button 
          variant="outline"
          onClick={handleBack}
          leftIcon={<ChevronLeft className="h-5 w-5" />}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={selectedFaculties.length === 0}
          rightIcon={<ChevronRight className="h-5 w-5" />}
        >
          Next Step
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Enter Your Academic Marks</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Fill in your marks based on the aggregate formula requirements.
        </p>
      </div>

      {requiredFields.hasHolistic && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4 mb-6">
          <div className="flex gap-3 text-blue-800 dark:text-blue-300">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              Some selected faculties use holistic review processes. The calculator will estimate numeric chances where possible, but final admission may depend on other factors.
            </p>
          </div>
        </Card>
      )}

      {calculateError && (
        <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 p-4">
          <div className="flex gap-3 text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {calculateError.response?.data?.error || 'The aggregate could not be calculated. Please check your marks and try again.'}
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {requiredFields.fields.has('matric') && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              Matriculation / O-Level
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Obtained Marks</label>
                <Input
                  type="number"
                  min="0"
                  max={marks.matricTotal}
                  aria-label="Matriculation obtained marks"
                  value={marks.matricMarks}
                  onChange={e => setMarks({...marks, matricMarks: e.target.value})}
                  placeholder="e.g. 950"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Marks</label>
                <Input
                  type="number"
                  min="1"
                  aria-label="Matriculation total marks"
                  value={marks.matricTotal}
                  onChange={e => setMarks({...marks, matricTotal: e.target.value})}
                />
              </div>
            </div>
            {marks.matricMarks && marks.matricTotal && (
              <div className="text-sm text-right text-slate-500">
                Percentage: <span className="font-semibold text-slate-900 dark:text-white">{((marks.matricMarks / marks.matricTotal) * 100).toFixed(2)}%</span>
              </div>
            )}
          </Card>
        )}

        {requiredFields.fields.has('intermediate') && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              Intermediate / A-Level
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Obtained Marks</label>
                <Input
                  type="number"
                  min="0"
                  max={marks.intermediateTotal}
                  aria-label="Intermediate obtained marks"
                  value={marks.intermediateMarks}
                  onChange={e => setMarks({...marks, intermediateMarks: e.target.value})}
                  placeholder="e.g. 980"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Marks</label>
                <Input
                  type="number"
                  min="1"
                  aria-label="Intermediate total marks"
                  value={marks.intermediateTotal}
                  onChange={e => setMarks({...marks, intermediateTotal: e.target.value})}
                />
              </div>
            </div>
            {marks.intermediateMarks && marks.intermediateTotal && (
              <div className="text-sm text-right text-slate-500">
                Percentage: <span className="font-semibold text-slate-900 dark:text-white">{((marks.intermediateMarks / marks.intermediateTotal) * 100).toFixed(2)}%</span>
              </div>
            )}
          </Card>
        )}

        {selectedFaculties.filter(faculty => faculty.structuredWeights?.some(weight => weight.ComponentType === 'entry_test')).map(faculty => {
          const entry = testEntries[faculty.id] || {};
          const selectedTest = faculty.admissionTests?.find(test => test.id === Number(entry.admissionTestId));
          const updateEntry = changes => setTestEntries(previous => ({ ...previous, [faculty.id]: { ...previous[faculty.id], ...changes } }));
          return <Card key={faculty.id} className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Calculator className="h-5 w-5 text-indigo-500" />
              {faculty.Name} — Entry Test
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Accepted Test</label>
              <select
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5"
                aria-label={`${faculty.Name} accepted test`}
                value={entry.admissionTestId || ''}
                onChange={event => {
                  const test = faculty.admissionTests.find(item => item.id === Number(event.target.value));
                  updateEntry({ admissionTestId: event.target.value, total: test?.total || '', score: '' });
                }}
              >
                <option value="">Choose an accepted test</option>
                {(faculty.admissionTests || []).map(test => <option key={test.id} value={test.id}>{test.name}{test.total ? ` (out of ${test.total})` : ''}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Obtained Score</label>
                <Input
                  type="number"
                  min="0"
                  max={entry.total}
                  aria-label={`${faculty.Name} obtained score`}
                  value={entry.score || ''}
                  onChange={e => updateEntry({ score: e.target.value })}
                  placeholder="e.g. 145"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Score</label>
                <Input
                  type="number"
                  min="1"
                  aria-label={`${faculty.Name} total score`}
                  value={entry.total || ''}
                  readOnly={selectedTest?.total != null}
                  onChange={e => updateEntry({ total: e.target.value })}
                  placeholder={selectedTest?.total == null ? 'Enter published scale' : undefined}
                />
              </div>
            </div>
            {entry.score && entry.total && (
              <div className="text-sm text-right text-slate-500">
                Percentage: <span className="font-semibold text-slate-900 dark:text-white">{((entry.score / entry.total) * 100).toFixed(2)}%</span>
              </div>
            )}
          </Card>;
        })}
      </div>

      {liveAggregatePreview != null && (
        <Card className="border-indigo-400 p-5 dark:border-indigo-700" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-500">Live score entry</p><p className="mt-1 text-sm text-slate-500">Updates as you type. The final result still uses the official calculator response.</p></div>
            <div className="ledger-number text-3xl font-semibold text-slate-950 dark:text-slate-100">{liveAggregatePreview.toFixed(2)}%</div>
          </div>
          <LedgerLine className="my-4" />
          <div className="h-2 overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-800"><motion.div className="h-full bg-indigo-500" animate={{ width: `${liveAggregatePreview}%` }} transition={{ duration: 0.22 }} /></div>
        </Card>
      )}

      <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
        <Button 
          variant="outline"
          onClick={handleBack}
          leftIcon={<ChevronLeft className="h-5 w-5" />}
        >
          Back
        </Button>
        <Button 
          onClick={handleCalculate} 
          disabled={!isMarksValid() || isCalculating}
          isLoading={isCalculating}
          rightIcon={!isCalculating && <Calculator className="h-5 w-5" />}
          size="lg"
        >
          Calculate Aggregate
        </Button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Results</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Based on your marks, here is your calculated aggregate and admission chances.
        </p>
      </div>

      <div className="space-y-6">
        {results.map((result, idx) => {
          const faculty = selectedFaculties.find(f => f.id === result.facultyId);
          const isHolistic = result.isHolistic || faculty?.isHolistic;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card padding="p-0" className="overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedUniversity?.Name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{faculty?.Name}</p>
                    {(result.selectedTest?.TestName || faculty?.TestName) && <Badge variant="outline" className="mt-2">{result.selectedTest?.TestName || faculty.TestName}</Badge>}
                  </div>
                  
                  {!isHolistic && result.aggregate !== undefined && (
                    <div className="result-stat shrink-0">
                      <div className="text-center">
                        <p className="text-sm !text-inherit font-medium">Your Aggregate</p>
                        <GradientText className="!text-inherit mt-2 block text-5xl font-semibold tracking-tight">
                          {result.aggregate.toFixed(2)}%
                        </GradientText>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {isHolistic ? (
                    <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800/30">
                      <Info className="h-6 w-6 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Holistic Review Faculty</h4>
                        <p className="mt-1 text-sm opacity-90">
                          This program does not use a strict numeric formula for admission. Selection is based on interviews, essays, or other qualitative criteria alongside academic performance.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Breakdown Table */}
                      {result.breakdown && result.breakdown.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-indigo-500" />
                            Calculation Breakdown
                          </h4>
                          <div className="result-breakdown overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                                <tr>
                                  <th className="px-4 py-3 font-medium">Component</th>
                                  <th className="px-4 py-3 font-medium">Weight</th>
                                  <th className="px-4 py-3 font-medium">Your Score</th>
                                  <th className="px-4 py-3 font-medium text-right">Contribution</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {result.breakdown.map((item, i) => (
                                  <tr key={i} className="bg-white dark:bg-slate-900">
                                    <td data-label="Component" className="px-4 py-3 text-slate-900 dark:text-slate-200">{item.component}</td>
                                    <td data-label="Weight" className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.weight}%</td>
                                    <td data-label="Your Score" className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                      {item.yourScore?.toFixed(1)}%
                                    </td>
                                    <td data-label="Contribution" className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-200">
                                      {item.contribution.toFixed(2)}%
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold">
                                  <td colSpan={3} className="px-4 py-3 text-right text-slate-900 dark:text-white">Total Aggregate:</td>
                                  <td className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">
                                    {result.aggregate.toFixed(2)}%
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
        <Button 
          variant="outline" 
          onClick={resetCalculator}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Calculate Again
        </Button>
        <Button 
          variant="secondary"
          as="a"
          href="/prediction"
          leftIcon={<ArrowRight className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Compare Universities
        </Button>
        <Button 
          leftIcon={hasSavedResults ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          onClick={handleSaveResults}
          disabled={!results.length || hasSavedResults}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
        >
          {hasSavedResults ? 'Results Saved' : 'Save Results'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="calculator-page page-container max-w-6xl">
      <div className="mx-auto mb-12 max-w-4xl">
        <div className="mb-10 space-y-4 text-center">
          <Badge variant="primary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1 inline" />
            Premium Calculator
          </Badge>
          <h1 className="page-heading">
            Calculate Your <GradientText>Admission Chances</GradientText>
          </h1>
          <p className="page-copy mx-auto">
            Get accurate aggregate calculations based on the latest formulas for top engineering and IT universities in Pakistan.
          </p>
        </div>

        <StepIndicator 
          steps={STEPS} 
          currentStep={currentStep} 
          className="mb-12"
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
