import React, { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  leftIcon,
  rightAddon,
  className,
  type = 'text',
  id,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          className={cn(
            'flex h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-950 shadow-sm outline-none transition-[border-color,box-shadow,background-color]',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-slate-500 dark:placeholder:text-gray-500',
            'dark:bg-slate-900 dark:text-slate-100',
            leftIcon && 'pl-10',
            rightAddon && 'pr-12',
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-500/50' 
              : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...rest}
        />
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
            {rightAddon}
          </div>
        )}
        
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute -inset-0.5 -z-10 rounded-xl border-2 border-indigo-500/15 dark:border-indigo-500/25"
            />
          )}
        </AnimatePresence>
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

Input.displayName = 'Input';

export default Input;
