import React from 'react';
import { cn } from '../../lib/utils';

export default function Skeleton({
  width,
  height,
  className,
  variant = 'text',
  count = 1,
  ...rest
}) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-slate-800';
  
  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    card: 'rounded-xl',
    rect: 'rounded-md',
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={cn(
        baseClasses,
        variants[variant],
        className,
        variant === 'text' && count > 1 && i !== count - 1 ? 'mb-2' : ''
      )}
      style={{ width, height }}
      {...rest}
    />
  ));

  return count === 1 ? skeletons[0] : <div>{skeletons}</div>;
}
