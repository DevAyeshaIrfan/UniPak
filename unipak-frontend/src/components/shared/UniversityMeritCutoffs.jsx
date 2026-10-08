import { useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import MeritTrendChart from '../ui/MeritTrendChart';
import { expandMeritCutoffs, buildMeritTrend } from '../../lib/meritCutoffs';

const selectClass = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

export default function UniversityMeritCutoffs({ rankings }) {
  const rows = useMemo(() => expandMeritCutoffs(rankings), [rankings]);
  const [selectedTest, setSelectedTest] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('');
  const tests = [...new Set(rows.map(row => row.testLabel))].sort();
  const activeTest = tests.includes(selectedTest) ? selectedTest : 'All';
  const filteredRows = activeTest === 'All' ? rows : rows.filter(row => row.testLabel === activeTest);
  const programs = [...new Map(rows.map(row => [row.programKey, row.ProgramNameSource || row.ProgramName])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1]));
  const activeProgram = programs.some(([key]) => key === selectedProgram) ? selectedProgram : programs[0]?.[0];
  const trend = buildMeritTrend(filteredRows, activeProgram);
  const programName = programs.find(([key]) => key === activeProgram)?.[1];

  return (
    <section aria-label="Historical merit cutoffs" className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-slate-300 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-indigo-50 p-6 dark:border-slate-700 dark:bg-indigo-900/10">
        <h3 className="flex items-center text-lg font-semibold text-indigo-900 dark:text-indigo-200"><Award className="mr-2 h-5 w-5" />Historical Merit Cutoffs</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {tests.length > 1 && <label className="text-sm font-medium" htmlFor="merit-test-filter">Admission test / category
            <select id="merit-test-filter" className={selectClass} value={activeTest} onChange={event => setSelectedTest(event.target.value)}>
              <option value="All">All tests / categories</option>
              {tests.map(test => <option key={test} value={test}>{test}</option>)}
            </select>
          </label>}
          <label className="text-sm font-medium" htmlFor="merit-program-select">Program graph
            <select id="merit-program-select" className={selectClass} value={activeProgram || ''} onChange={event => setSelectedProgram(event.target.value)}>
              {programs.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="border-b border-slate-300 p-6 dark:border-slate-800">
        <h4 className="font-semibold">{programName}</h4>
        <p className="mb-4 mt-1 text-xs text-slate-500">Closing merit %. The latest recorded list for each year and test/category is shown.</p>
        {trend.data.length ? <MeritTrendChart data={trend.data} series={trend.series} height={260} label={`${programName} closing merit by year and admission test`} />
          : <p className="py-8 text-sm text-slate-500" role="status">No numeric cutoff is available for this program{activeTest !== 'All' ? ` under ${activeTest}` : ''}.</p>}
        {trend.data.length === 1 && <p className="mt-2 text-xs text-slate-500">Only one year has a numeric cutoff for this selection.</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="px-6 py-3 text-left text-sm text-slate-500" aria-live="polite">{filteredRows.length} cutoff records · {activeTest === 'All' ? 'All tests / categories' : activeTest}</caption>
          <thead><tr className="border-b border-slate-200 dark:border-slate-700">
            {['Program', 'Year', 'Test / Category', 'Closing Merit', 'Status'].map(title => <th scope="col" key={title} className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">{title}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredRows.map(row => <tr key={row.displayKey} className="transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{row.ProgramNameSource}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.AdmissionYear}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.displayBasis}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.ClosingMeritPercent != null ? `${row.ClosingMeritPercent}%` : 'Not available'}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.MeritStatus}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
