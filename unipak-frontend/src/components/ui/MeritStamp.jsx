import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const getStamp = (status = '') => {
  const value = String(status?.label || status).toLowerCase();
  if (/likely|above|excellent|very high|high|positive|verified|success/.test(value)) return { label: 'LIKELY', color: 'text-emerald-500 border-emerald-500' };
  if (/unlikely|below|very low|low|negative|danger/.test(value)) return { label: 'UNLIKELY', color: 'text-red-500 border-red-500' };
  if (/possible|reach|moderate|caution|warning/.test(value)) return { label: 'POSSIBLE', color: 'text-violet-400 border-violet-400' };
  return { label: 'REVIEW', color: 'text-slate-500 border-slate-500' };
};

export default function MeritStamp({ status, label, subLabel = 'MERIT VERDICT', size = 'md', className }) {
  const stamp = getStamp(status || label);
  const dimensions = size === 'sm' ? 'h-20 w-20' : size === 'lg' ? 'h-32 w-32' : 'h-24 w-24';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.86, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
      transition={{ type: 'spring', stiffness: 430, damping: 24, mass: 0.55 }}
      className={cn('relative grid shrink-0 place-items-center rounded-full border-2 border-dashed p-1 font-mono uppercase', dimensions, stamp.color, className)}
      aria-label={`${label || stamp.label} admission verdict`}
    >
      <div className="absolute inset-1 rounded-full border border-current opacity-70" />
      <div className="relative text-center leading-none">
        <span className="block text-[8px] font-semibold tracking-[0.18em] opacity-80">{subLabel}</span>
        <span className={cn('mt-1 block font-bold tracking-[-0.04em]', size === 'sm' ? 'text-sm' : 'text-base')}>{label || stamp.label}</span>
        <span className="mt-1 block text-[7px] tracking-[0.12em] opacity-75">UNIPAK • VERIFIED</span>
      </div>
    </motion.div>
  );
}
