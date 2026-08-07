import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  const icon = React.isValidElement(Icon)
    ? Icon
    : Icon
      ? <Icon className="h-8 w-8" strokeWidth={1.5} />
      : null;

  const actionContent = React.isValidElement(action)
    ? action
    : action?.label
      ? (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-offset-slate-900"
          >
            {action.label}
          </button>
        )
      : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl px-4 py-14 text-center",
        "border border-dashed border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40",
        className
      )}
    >
      {icon && (
        <div className="mb-4 rounded-full bg-indigo-50 p-4 dark:bg-indigo-500/10 text-indigo-500">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {actionContent && <div>{actionContent}</div>}
    </motion.div>
  );
}
