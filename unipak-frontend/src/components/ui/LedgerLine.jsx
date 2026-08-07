import { cn } from '../../lib/utils';

export default function LedgerLine({ label, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-hidden={!label}>
      {label && <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</span>}
      <div className="ledger-rule flex-1" />
    </div>
  );
}
