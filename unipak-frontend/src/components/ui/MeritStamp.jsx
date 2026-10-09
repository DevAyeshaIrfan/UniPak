import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const getStamp = (status = '') => {
  const value = String(status?.label || status).toLowerCase();
  if (/likely|above|excellent|very high|high|positive|verified|success/.test(value)) return { label: 'LIKELY', color: 'text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-800' };
  if (/unlikely|below|very low|low|negative|danger/.test(value)) return { label: 'UNLIKELY', color: 'text-red-500 border-red-500' };
  if (/possible|reach|moderate|caution|warning/.test(value)) return { label: 'POSSIBLE', color: 'text-violet-400 border-violet-400' };
  return { label: 'REVIEW', color: 'text-slate-500 border-slate-500' };
};

export default function MeritStamp({ status, label, subLabel = 'MERIT VERDICT', size = 'md', className }) {
  const stamp = getStamp(status || label);
  const dimensions = size === 'sm' ? 'min-h-16 w-20' : size === 'lg' ? 'min-h-24 w-32' : 'min-h-20 w-28';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('relative grid shrink-0 place-items-center rounded-xl border p-2 font-sans uppercase', dimensions, stamp.color, className)}
      aria-label={`${label || stamp.label} admission verdict`}
    >
      
      <div className="relative text-center leading-none">
        <span className="block text-[8px] font-semibold tracking-[0.18em] opacity-80">{subLabel}</span>
        <span className={cn('mt-1 block font-bold tracking-[-0.04em]', size === 'sm' ? 'text-sm' : 'text-base')}>{label || stamp.label}</span>
        <span className="mt-1 block text-[7px] tracking-[0.12em] opacity-75">UNIPAK • VERIFIED</span>
      </div>
    </motion.div>
  );
}
