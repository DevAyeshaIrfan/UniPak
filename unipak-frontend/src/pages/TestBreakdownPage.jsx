import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpenCheck, Search } from 'lucide-react';
import { getTestBreakdowns } from '../api/universities';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const EXCLUDED_TESTS = new Set(['sat', 'act']);

function compactUniversityName(name) {
  return String(name || '')
    .replace('FAST-NUCES (Lahore Campus)', 'FAST-NUCES — Lahore')
    .replace('FAST-NUCES (Karachi Campus)', 'FAST-NUCES — Karachi')
    .replace('FAST-NUCES (Islamabad Campus — founding/headquarters campus)', 'FAST-NUCES — Islamabad')
    .replace('FAST-NUCES (Islamabad Campus)', 'FAST-NUCES — Islamabad');
}

function subjectPoints(breakdown) {
  if (!breakdown) return ['Pattern varies by program'];
  return breakdown.split(/\s+\+\s+/).slice(0, 6);
}

function shortFormat(format) {
  return format ? format.split(';')[0].trim() : null;
}

function shortNegativeMarking(value) {
  if (!value) return null;
  if (/^no\b/i.test(value)) return 'No negative marking';
  const penalty = value.match(/[−-]0\.\d+[^;,.]*/);
  return penalty ? penalty[0].trim() : 'Negative marking applies';
}

export default function TestBreakdownPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['test-breakdowns'],
    queryFn: () => getTestBreakdowns(),
  });

  const tests = useMemo(() => {
    const term = search.trim().toLowerCase();
    const grouped = new Map();

    for (const test of data?.data || []) {
      const key = String(test.TestName || '').trim().toLowerCase();
      if (!key || EXCLUDED_TESTS.has(key)) continue;

      const existing = grouped.get(key) || {
        TestName: test.TestName,
        TotalMarks: test.TotalMarks,
        TotalMarksText: test.TotalMarksText,
        SubjectBreakdown: null,
        QuestionFormat: null,
        NegativeMarking: null,
        universities: new Set(),
      };

      existing.universities.add(compactUniversityName(test.UniversityName));
      existing.SubjectBreakdown ||= test.SubjectBreakdown;
      existing.QuestionFormat ||= test.QuestionFormat;
      existing.NegativeMarking ||= test.NegativeMarking;
      existing.TotalMarks ??= test.TotalMarks;
      grouped.set(key, existing);
    }

    return [...grouped.values()]
      .map(test => ({ ...test, universities: [...test.universities].sort() }))
      .filter(test => !term || [test.TestName, ...test.universities, test.SubjectBreakdown]
        .some(value => value?.toLowerCase().includes(term)))
      .sort((a, b) => a.TestName.localeCompare(b.TestName));
  }, [data, search]);

  return (
    <div className="page-container max-w-6xl space-y-8">
      <div className="space-y-3 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <BookOpenCheck className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <h1 className="page-heading">Entry Test Subject Breakdown</h1>
        <p className="page-copy mx-auto">One clear summary for each university entry test.</p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <Input className="pl-10" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search test, university, or subject" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-5">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}</div>
      ) : tests.length === 0 ? (
        <EmptyState title="No tests found" description="Try another search." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {tests.map(test => (
            <Card
              key={test.TestName}
              className="group space-y-4 p-6 transition-[border-color,background-color] duration-200 ease-out hover:border-indigo-500 hover:bg-indigo-50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/35"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">{test.TestName}</h2>
                <Badge variant="primary">{test.TotalMarks ?? 'Not fixed'}</Badge>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Used by</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{test.universities.join(' • ')}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Subjects</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                  {subjectPoints(test.SubjectBreakdown).map((point, index) => <li key={`${test.TestName}-${index}`}>{point}</li>)}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {shortFormat(test.QuestionFormat) && <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">{shortFormat(test.QuestionFormat)}</span>}
                {shortNegativeMarking(test.NegativeMarking) && <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">{shortNegativeMarking(test.NegativeMarking)}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
