import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'border border-indigo-600 bg-indigo-600 text-white shadow-sm hover:border-indigo-700 hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:border-indigo-400 dark:hover:bg-indigo-600',
  secondary: 'border border-slate-200 bg-slate-100 text-slate-900 hover:border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  outline: 'border border-indigo-300 bg-white text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-500/60 dark:bg-transparent dark:text-indigo-300 dark:hover:bg-indigo-500/10',
  cta: 'border border-slate-200 bg-white text-slate-950 hover:bg-slate-100',
  danger: 'border border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700',
};

const sizes = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 py-2 text-sm',
  lg: 'min-h-12 px-7 text-base',
};

const Button = forwardRef(({
  as: Component,
  variant = 'primary',
  size = 'md',
  children,
  className,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...rest
}, ref) => {
  const isDisabled = disabled || isLoading;

  const content = (
    <>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  const buttonClassName = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:ring-offset-1 dark:focus:ring-offset-slate-950',
    variants[variant],
    sizes[size],
    isDisabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (Component) {
    return (
      <Component
        ref={ref}
        {...rest}
        className={buttonClassName}
        aria-disabled={isDisabled || undefined}
        onClick={isDisabled ? (event) => event.preventDefault() : rest.onClick}
      >
        {content}
      </Component>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.985 } : {}}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={buttonClassName}
      {...rest}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
