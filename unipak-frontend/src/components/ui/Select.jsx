import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Select = forwardRef(({
  label,
  options = [],
  error,
  className,
  id,
  ...rest
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-11 w-full appearance-none rounded-md border bg-slate-50 px-3.5 py-2 pr-10 text-sm shadow-sm outline-none transition-[border-color,box-shadow,background-color]',
            'dark:bg-slate-900 dark:text-slate-100',
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-500/50' 
              : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="flex items-center text-sm text-red-500 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
