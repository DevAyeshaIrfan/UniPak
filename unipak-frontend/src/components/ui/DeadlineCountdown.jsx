import { useEffect, useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';

const units = (distance) => {
  const safe = Math.max(0, distance);
  return { days: Math.floor(safe / 86400000), hours: Math.floor((safe / 3600000) % 24), minutes: Math.floor((safe / 60000) % 60) };
};

export default function DeadlineCountdown({ targetDate, sampleValues, title = 'Planning checkpoint' }) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const [remaining, setRemaining] = useState(() => sampleValues ?? units(target - Date.now()));
  useEffect(() => {
    if (sampleValues) return;
    const update = () => setRemaining(units(target - Date.now()));
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [target, sampleValues]);
  return (
    <div className="ledger-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-500">Admission planning aid</p><h3 className="mt-1 font-semibold text-slate-950 dark:text-slate-100">{title}</h3></div>
        <Clock3 className="h-5 w-5 text-violet-400" />
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-300 border-y border-slate-300 py-3 text-center dark:divide-slate-800 dark:border-slate-800">
        {Object.entries(sampleValues ?? remaining).map(([unit, value]) => <div key={unit}><div className="ledger-number text-2xl font-semibold text-slate-950 dark:text-slate-100">{String(value).padStart(2, '0')}</div><div className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{unit}</div></div>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{sampleValues ? 'Sample countdown only' : 'Planning reference only'} — confirm each university’s official deadline.</p>
    </div>
  );
}
