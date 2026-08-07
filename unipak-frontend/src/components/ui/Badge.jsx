import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300',
  default: 'border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  purple: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-400',
  outline: 'bg-transparent text-gray-600 border border-gray-300 dark:text-gray-400 dark:border-slate-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const dotColors = {
  primary: 'bg-indigo-500 dark:bg-indigo-400',
  default: 'bg-gray-500 dark:bg-slate-400',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-yellow-500 dark:bg-yellow-400',
  danger: 'bg-red-500 dark:bg-red-400',
  info: 'bg-blue-500 dark:bg-blue-400',
  purple: 'bg-violet-500 dark:bg-violet-400',
  outline: 'bg-gray-400 dark:bg-gray-500',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className,
  dot = false,
  ...rest
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm font-mono font-semibold uppercase tracking-[0.05em] leading-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {dot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            dotColors[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
