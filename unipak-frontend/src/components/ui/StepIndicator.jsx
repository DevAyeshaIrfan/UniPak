import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StepIndicator({
  steps = [],
  currentStep = 0,
  className
}) {
  const activeIndex = Math.max(0, Math.min(currentStep - 1, steps.length - 1));
  const progress = steps.length > 1 ? (activeIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className={cn("w-full px-8 py-4", className)}>
      <div className="flex items-center justify-between w-full relative">
        <div className="absolute left-4 right-4 top-4 z-0 h-px overflow-hidden bg-slate-300 dark:bg-slate-800">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCurrent = idx === activeIndex;
          const isCompleted = idx < activeIndex || (currentStep >= steps.length && isCurrent);

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 group">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? 'var(--app-foreground)' : 'var(--app-surface)',
                  borderColor: isCompleted || isCurrent ? 'var(--app-foreground)' : 'var(--app-border)',
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border font-sans shadow-sm transition-colors duration-300",
                  "dark:bg-slate-800 dark:border-slate-700",
                  (isCompleted || isCurrent) ? "bg-indigo-500 text-white dark:text-slate-950" : "bg-white text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-white dark:text-slate-950" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {idx + 1}
                  </span>
                )}
              </motion.div>
              
              <div className="absolute top-10 flex flex-col items-center w-20 text-center">
                <span className={cn(
                  "text-xs font-semibold whitespace-nowrap transition-colors",
                  isCurrent ? "text-indigo-600 dark:text-indigo-400" : 
                  isCompleted ? "text-gray-800 dark:text-gray-200" : "text-slate-500 dark:text-slate-400"
                )}>
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
