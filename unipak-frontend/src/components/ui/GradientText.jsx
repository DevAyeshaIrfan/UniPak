import React from 'react';
import { cn } from '../../lib/utils';

export default function GradientText({
  children,
  className,
  from: _from = 'from-indigo-500',
  to: _to = 'to-violet-500',
  as: Component = 'span'
}) {
  return (
    <Component
      className={cn(
        "text-indigo-600 dark:text-indigo-400",
        className
      )}
    >
      {children}
    </Component>
  );
}
