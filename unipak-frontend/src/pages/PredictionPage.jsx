import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpDown,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  PieChart as PieChartIcon,
  RotateCcw,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  useCalculatorFaculties,
  useCalculatorUniversities,
  useCompareUniversities,
} from '../hooks/useCalculator';
import { useUniversityPrograms } from '../hooks/useUniversities';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import GradientText from '../components/ui/GradientText';
import MeritStamp from '../components/ui/MeritStamp';

const emptyProfile = () => ({
  matricMarks: '',
  matricTotal: '1100',
  intermediateMarks: '',
  intermediateTotal: '1100',
  admissionTestId: '',
  entryTestScore: '',
  entryTestTotal: '',
});

const hasValidPair = (marks, total) => {
  const score = Number(marks);
  const maximum = Number(total);
  return marks !== '' && total !== '' && Number.isFinite(score) && Number.isFinite(maximum)
    && score >= 0 && maximum > 0 && score <= maximum;
};

const programId = (program) => String(program?.ProgramID ?? '');

const statusClasses = {
  positive: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
  negative: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900',
  neutral: 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
};

const colorStyles = {
  indigo: {
    border: 'border-indigo-200 dark:border-indigo-900/40',
    bar: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    focus: 'focus:ring-indigo-500',
  },
  cyan: {
    border: 'border-cyan-200 dark:border-cyan-900/40',
    bar: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    focus: 'focus:ring-cyan-500',
  },
};

const EMPTY_TESTS = [];

function MarksPair({ label, prefix, marksName, totalName, profile, onChange, accent }) {
  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <h4 className="flex items-center font-semibold text-slate-700 dark:text-slate-200">
        <span className={`mr-2 h-2 w-2 rounded-full ${accent}`} />
        {label}
      </h4>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          name={marksName}
          aria-label={`${prefix} ${label} obtained marks`}
          placeholder="Obtained"
          value={profile[marksName]}
          onChange={onChange}
        />
        <span className="text-slate-400">/</span>
        <Input
          type="number"
          min="1"
          name={totalName}
          aria-label={`${prefix} ${label} total marks`}
          placeholder="Total"
          value={profile[totalName]}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function ProfilePanel({ number, color, university, program, faculty, profile, setProfile }) {
  const styles = colorStyles[color];
  const tests = faculty?.admissionTests || EMPTY_TESTS;
  const requiresEntryTest = tests.length > 0 || faculty?.structuredWeights?.some(
    (weight) => weight.ComponentType === 'entry_test',
  );

  useEffect(() => {
    if (!requiresEntryTest || !tests.length) {
      if (profile.admissionTestId || profile.entryTestScore || profile.entryTestTotal) {
        setProfile((current) => ({
          ...current,
          admissionTestId: '',
          entryTestScore: '',
          entryTestTotal: '',
        }));
      }
      return;
    }
    const currentTest = tests.find((test) => String(test.id) === String(profile.admissionTestId));
    const nextTest = currentTest || tests[0];
    const total = nextTest.total == null ? profile.entryTestTotal : String(nextTest.total);
    if (String(profile.admissionTestId) !== String(nextTest.id) || profile.entryTestTotal !== total) {
      setProfile((current) => ({
        ...current,
        admissionTestId: String(nextTest.id),
        entryTestTotal: total,
        entryTestScore: currentTest ? current.entryTestScore : '',
      }));
    }
  }, [faculty?.id, requiresEntryTest, tests, profile.admissionTestId, profile.entryTestScore, profile.entryTestTotal, setProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleTestChange = (event) => {
    const test = tests.find((item) => String(item.id) === event.target.value);
    setProfile((current) => ({
      ...current,
      admissionTestId: event.target.value,
      entryTestScore: '',
      entryTestTotal: test?.total == null ? '' : String(test.total),
    }));
  };

  return (
    <Card className={`relative overflow-hidden p-6 ${styles.border}`}>
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <div className="mb-5 flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${styles.badge}`}>
          {number}
        </span>
        <div>
          <h3 className="text-lg font-bold">{university?.name || `Option ${number}`}</h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {program?.ProgramName || 'Select a program first'}
          </p>
          {faculty?.AggregateFormulaText && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {faculty.AggregateFormulaText}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <MarksPair
          label="Matric / O-Level"
          prefix={university?.name || `Option ${number}`}
          marksName="matricMarks"
          totalName="matricTotal"
          profile={profile}
          onChange={handleChange}
          accent={styles.bar}
        />
        <MarksPair
          label="Intermediate / A-Level"
          prefix={university?.name || `Option ${number}`}
          marksName="intermediateMarks"
          totalName="intermediateTotal"
          profile={profile}
          onChange={handleChange}
          accent="bg-cyan-500"
        />

        {requiresEntryTest && (
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <h4 className="flex items-center font-semibold text-slate-700 dark:text-slate-200">
              <span className="mr-2 h-2 w-2 rounded-full bg-violet-500" />
              Entry Test
            </h4>
            <select
              aria-label={`${university?.name || `Option ${number}`} entry test`}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={profile.admissionTestId}
              onChange={handleTestChange}
            >
              <option value="">Choose accepted test</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name}{test.total == null ? '' : ` (${test.total} marks)`}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                name="entryTestScore"
                aria-label={`${university?.name || `Option ${number}`} entry test obtained marks`}
                placeholder="Obtained"
                value={profile.entryTestScore}
                onChange={handleChange}
              />
              <span className="text-slate-400">/</span>
              <Input
                type="number"
                min="1"
                name="entryTestTotal"
                aria-label={`${university?.name || `Option ${number}`} entry test total marks`}
                placeholder="Total"
                value={profile.entryTestTotal}
                onChange={handleChange}
                disabled={tests.find((test) => String(test.id) === String(profile.admissionTestId))?.total != null}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function SelectionCard({ number, color, universityId, setUniversityId, otherUniversityId, universities, programs, programValue, setProgramValue, loading }) {
  const styles = colorStyles[color];
  return (
    <Card className="relative overflow-hidden p-6">
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <h3 className="mb-5 flex items-center text-xl font-bold">
        <span className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${styles.badge}`}>
          {number}
        </span>
        {number === 1 ? 'First Option' : 'Second Option'}
      </h3>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Select University</label>
          <select
            aria-label={`Option ${number} university`}
            className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${styles.focus}`}
            value={universityId}
            onChange={(event) => setUniversityId(event.target.value)}
          >
            <option value="">Choose university</option>
            {universities.map((university) => (
              <option key={university.id} value={university.id} disabled={String(university.id) === String(otherUniversityId)}>
                {university.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Select Program</label>
          <select
            aria-label={`Option ${number} program`}
            className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${styles.focus}`}
            value={programValue}
            onChange={(event) => setProgramValue(event.target.value)}
            disabled={!universityId || loading}
          >
            <option value="">Choose program</option>
            {programs.map((program) => (
              <option key={program.ProgramID} value={program.ProgramID}>{program.ProgramName}</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

function ResultCard({ item, color, number }) {
  const styles = colorStyles[color];
  const status = item.status || { label: 'Not available', tone: 'neutral' };
  const marginText = Number.isFinite(item.margin)
    ? `${item.margin >= 0 ? '+' : ''}${item.margin.toFixed(2)}%`
    : '—';
  const StatusIcon = status.tone === 'positive' ? CheckCircle : status.tone === 'negative' ? TrendingDown : status.tone === 'warning' ? AlertTriangle : Target;
  const cutoffLabel = ['SAT', 'NAT', 'NU'].includes(item.cutoffBasis)
    ? `${item.cutoffBasis} cutoff`
    : 'Latest cutoff';

  return (
    <Card className={`relative overflow-hidden p-6 ${styles.border}`}>
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${styles.badge}`}>{number}</span>
        <div>
          <h3 className="text-xl font-bold">{item.university.name}</h3>
          <p className="font-medium text-slate-600 dark:text-slate-300">{item.program.name}</p>
          {item.entryTestName && <p className="mt-1 text-sm text-slate-500">Test: {item.entryTestName}</p>}
        </div>
        </div>
        <MeritStamp status={status.label || status.tone} size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500">Your aggregate</p>
          <p className="ledger-number mt-1 text-2xl font-bold">{Number.isFinite(item.aggregate) ? `${item.aggregate.toFixed(2)}%` : 'Holistic'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500">{cutoffLabel}{item.cutoffYear ? ` (${item.cutoffYear})` : ''}</p>
          <p className="mt-1 text-2xl font-bold">{Number.isFinite(item.cutoff) ? `${item.cutoff.toFixed(2)}%` : '—'}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500">Difference</p>
          <p className={`ledger-number mt-1 text-2xl font-bold ${!Number.isFinite(item.margin) ? 'text-slate-400' : item.margin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{marginText}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500">Chance estimate</p>
          <p className="ledger-number mt-1 text-2xl font-bold">{Number.isFinite(item.chance) ? `${item.chance}%` : 'N/A'}</p>
        </div>
      </div>
      <div className={`mt-4 flex items-center rounded-xl border px-4 py-3 ${statusClasses[status.tone] || statusClasses.neutral}`}>
        <StatusIcon className="mr-2 h-5 w-5" />
        <span className="font-semibold">{status.label}</span>
      </div>
    </Card>
  );
}

function ComparisonTable({ items }) {
  const [sort, setSort] = useState({ key: 'aggregate', direction: 'desc' });
  const rows = useMemo(() => [...items].sort((a, b) => {
    const first = sort.key === 'programName' ? a.program.name : a[sort.key] ?? '';
    const second = sort.key === 'programName' ? b.program.name : b[sort.key] ?? '';
    const result = typeof first === 'number' && typeof second === 'number' ? first - second : String(first).localeCompare(String(second));
    return sort.direction === 'asc' ? result : -result;
  }), [items, sort]);
  const selectSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));
  const columns = [['programName', 'Program'], ['aggregate', 'Your merit'], ['cutoff', 'Closing merit'], ['fee', 'Fees'], ['seats', 'Seats'], ['deadline', 'Deadline']];
  const display = (row, key) => {
    if (key === 'programName') return row.program.name;
    if (key === 'aggregate' || key === 'cutoff') return Number.isFinite(row[key]) ? `${row[key].toFixed(2)}%` : 'N/R';
    return row[key] ?? 'Not recorded';
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-300 p-5 dark:border-slate-800"><h2 className="text-xl">Sortable program ledger</h2><p className="mt-1 text-sm text-slate-500">Unavailable fields are marked “not recorded”; no estimates are invented.</p></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-950"><tr><th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">University</th>{columns.map(([key, label]) => <th key={key} className="px-4 py-3" aria-sort={sort.key === key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}><button onClick={() => selectSort(key)} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-indigo-500">{label}<ArrowUpDown className="h-3 w-3" /></button></th>)}</tr></thead>
          <tbody className="divide-y divide-slate-300 dark:divide-slate-800">{rows.map((row) => <tr key={`${row.university.id}-${row.program.id}`} className="hover:bg-indigo-50 dark:hover:bg-indigo-950/35"><td className="px-4 py-4 font-semibold">{row.university.name}</td>{columns.map(([key]) => <td key={key} className={key === 'aggregate' || key === 'cutoff' ? 'ledger-number px-4 py-4' : 'px-4 py-4 text-slate-500'}>{display(row, key)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}

export default function PredictionPage() {
  const [step, setStep] = useState('selection');
  const [uni1Id, setUni1Id] = useState('');
  const [uni2Id, setUni2Id] = useState('');
  const [program1Id, setProgram1Id] = useState('');
  const [program2Id, setProgram2Id] = useState('');
  const [profile1, setProfile1] = useState(emptyProfile);
  const [profile2, setProfile2] = useState(emptyProfile);

  const { data: universitiesResponse, isLoading: loadingUniversities } = useCalculatorUniversities();
  const { data: programs1Response, isLoading: loadingPrograms1 } = useUniversityPrograms(uni1Id);
  const { data: programs2Response, isLoading: loadingPrograms2 } = useUniversityPrograms(uni2Id);
  const { data: faculties1Response } = useCalculatorFaculties(uni1Id);
  const { data: faculties2Response } = useCalculatorFaculties(uni2Id);
  const { mutate: compare, data: comparisonData, isPending, error } = useCompareUniversities();

  const universities = universitiesResponse?.data || [];
  const programs1 = programs1Response?.data || [];
  const programs2 = programs2Response?.data || [];
  const faculties1 = faculties1Response?.data || [];
  const faculties2 = faculties2Response?.data || [];
  const selectedProgram1 = programs1.find((program) => programId(program) === String(program1Id));
  const selectedProgram2 = programs2.find((program) => programId(program) === String(program2Id));
  const selectedFaculty1 = faculties1.find((faculty) => String(faculty.id) === String(selectedProgram1?.FacultyID));
  const selectedFaculty2 = faculties2.find((faculty) => String(faculty.id) === String(selectedProgram2?.FacultyID));
  const selectedUniversity1 = universities.find((university) => String(university.id) === String(uni1Id));
  const selectedUniversity2 = universities.find((university) => String(university.id) === String(uni2Id));

  useEffect(() => {
    setProgram1Id('');
    setProfile1(emptyProfile());
  }, [uni1Id]);
  useEffect(() => {
    setProgram2Id('');
    setProfile2(emptyProfile());
  }, [uni2Id]);

  const profileValid = (profile, faculty) => {
    const baseValid = hasValidPair(profile.matricMarks, profile.matricTotal)
      && hasValidPair(profile.intermediateMarks, profile.intermediateTotal);
    const needsTest = (faculty?.admissionTests?.length || 0) > 0
      || faculty?.structuredWeights?.some((weight) => weight.ComponentType === 'entry_test');
    return baseValid && (!needsTest || (
      profile.admissionTestId && hasValidPair(profile.entryTestScore, profile.entryTestTotal)
    ));
  };

  const formValid = useMemo(() => (
    uni1Id && uni2Id && uni1Id !== uni2Id && program1Id && program2Id
      && profileValid(profile1, selectedFaculty1)
      && profileValid(profile2, selectedFaculty2)
  ), [uni1Id, uni2Id, program1Id, program2Id, profile1, profile2, selectedFaculty1, selectedFaculty2]);

  const submitComparison = () => {
    if (!formValid) return;
    compare({
      programId1: Number(program1Id),
      programId2: Number(program2Id),
      profile1,
      profile2,
    }, {
      onSuccess: () => {
        setStep('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const errorMessage = error?.response?.data?.error || error?.message;
  const comparison = comparisonData?.comparison;
  const chanceItems = comparison ? [
    { item: comparison.university1, color: '#B3502E' },
    { item: comparison.university2, color: '#D9A43B' },
  ] : [];

  return (
    <div className="page-container relative max-w-6xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-indigo-50/45 to-transparent dark:from-indigo-950/15" />
      <AnimatePresence mode="wait">
        {step === 'selection' ? (
          <motion.div key="selection" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl space-y-8">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <Badge className="border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Scale className="mr-2 inline h-4 w-4" /> Program Comparison
              </Badge>
              <h1 className="page-heading">Prediction <GradientText>Analysis</GradientText></h1>
              <p className="page-copy mx-auto">Choose one program from each university, enter the marks required by each admission formula, and compare both results with their latest program cutoffs.</p>
            </div>

            {errorMessage && (
              <div className="flex items-center rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                <AlertTriangle className="mr-3 h-5 w-5 shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <SelectionCard number={1} color="indigo" universityId={uni1Id} setUniversityId={setUni1Id} otherUniversityId={uni2Id} universities={universities} programs={programs1} programValue={program1Id} setProgramValue={setProgram1Id} loading={loadingUniversities || loadingPrograms1} />
              <SelectionCard number={2} color="cyan" universityId={uni2Id} setUniversityId={setUni2Id} otherUniversityId={uni1Id} universities={universities} programs={programs2} programValue={program2Id} setProgramValue={setProgram2Id} loading={loadingUniversities || loadingPrograms2} />
            </div>

            {(selectedProgram1 || selectedProgram2) && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-indigo-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Marks for Each Program</h2>
                    <p className="text-sm text-slate-500">Each side uses its own accepted test and total marks.</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {selectedProgram1 ? <ProfilePanel number={1} color="indigo" university={selectedUniversity1} program={selectedProgram1} faculty={selectedFaculty1} profile={profile1} setProfile={setProfile1} /> : <Card className="p-6 text-slate-500">Select the first program to enter marks.</Card>}
                  {selectedProgram2 ? <ProfilePanel number={2} color="cyan" university={selectedUniversity2} program={selectedProgram2} faculty={selectedFaculty2} profile={profile2} setProfile={setProfile2} /> : <Card className="p-6 text-slate-500">Select the second program to enter marks.</Card>}
                </div>
              </section>
            )}

            <div className="flex justify-center">
              <Button size="lg" className="min-w-[280px] text-base" disabled={!formValid || isPending} onClick={submitComparison}>
                {isPending ? <><RotateCcw className="mr-2 h-5 w-5 animate-spin" /> Calculating…</> : <><Scale className="mr-2 h-5 w-5" /> Compare Programs <ArrowRight className="ml-2 h-5 w-5" /></>}
              </Button>
            </div>
          </motion.div>
        ) : comparison ? (
          <motion.div key="results" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-8">
            <div className="text-center">
              <Badge className="border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"><TrendingUp className="mr-2 inline h-4 w-4" /> Program-level result</Badge>
              <h1 className="mt-4 text-4xl font-extrabold">Prediction <GradientText>Results</GradientText></h1>
              <p className="mt-3 text-slate-500">Your calculated aggregates versus the latest recorded cutoff for each selected program.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ResultCard item={comparison.university1} color="indigo" number={1} />
              <ResultCard item={comparison.university2} color="cyan" number={2} />
            </div>

            <ComparisonTable items={[comparison.university1, comparison.university2]} />

            <Card className="p-6">
              <h2 className="mb-2 flex items-center text-xl font-bold"><PieChartIcon className="mr-2 h-5 w-5 text-indigo-500" /> Admission Chance Estimate</h2>
              <p className="mb-6 text-sm text-slate-500">Each pie uses your aggregate and the matching program and test cutoff.</p>
              <div className="grid gap-8">
                {chanceItems.map(({ item, color }) => {
                  const chance = Number.isFinite(item.chance) ? item.chance : 0;
                  const pieData = [{ value: chance }, { value: 100 - chance }];
                  return (
                    <div key={`${item.university.id}-${item.program.id}`} className="mx-auto w-full max-w-lg text-center">
                      <div className="relative mx-auto h-56 max-w-sm">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={64} outerRadius={86} startAngle={90} endAngle={-270} stroke="none">
                              <Cell fill={color} />
                              <Cell fill="#334155" opacity={0.22} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold">{Number.isFinite(item.chance) ? `${item.chance}%` : 'N/A'}</span>
                        </div>
                      </div>
                      <p className="font-bold">{item.university.name}</p>
                      <p className="text-sm text-slate-500">{item.program.name}{item.cutoffBasis ? ` · ${item.cutoffBasis}` : ''}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-center text-xs text-slate-500">This is a cutoff-based estimate, not a guarantee of admission.</p>
            </Card>

            <Card className="border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50 to-white p-6 dark:from-amber-950/20 dark:to-slate-900">
              <h2 className="mb-2 flex items-center text-xl font-bold"><Target className="mr-2 h-5 w-5 text-amber-500" /> What the data suggests</h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">{comparison.recommendation}</p>
            </Card>

            <div className="flex justify-center pb-12">
              <Button size="lg" variant="outline" onClick={() => { setStep('selection'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <RotateCcw className="mr-2 h-4 w-4" /> Change Comparison
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
