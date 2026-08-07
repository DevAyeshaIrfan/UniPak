import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const variants = {
  default: 'border border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-900',
  glass: 'border border-slate-300 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-900/95',
  gradient: 'border border-indigo-400 bg-slate-50 dark:border-indigo-700 dark:bg-slate-900',
};

const Card = ({
  children,
  className,
  hoverable = false,
  variant = 'default',
  padding = 'p-6',
  ...rest
}) => {
  const CardComponent = hoverable ? motion.div : 'div';
  const hoverProps = hoverable ? { whileHover: { y: -2 }, transition: { duration: 0.18, ease: 'easeOut' } } : {};

  return (
    <CardComponent
      className={cn(
        'rounded-lg shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-200',
        variants[variant],
        padding,
        hoverable && 'cursor-pointer hover:border-indigo-500 hover:shadow-[var(--shadow-soft-lg)] dark:hover:border-indigo-500',
        className
      )}
      {...hoverProps}
      {...rest}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
