import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const sizes = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value = 0,
  color = 'bg-gradient-to-r from-indigo-500 to-violet-500',
  size = 'md',
  showLabel = false,
  className,
  animated = true,
}) {
  const [width, setWidth] = useState(0);
  const safeValue = Math.min(Math.max(0, value), 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(safeValue), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(safeValue);
    }
  }, [safeValue, animated]);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1.5 font-medium text-gray-700 dark:text-gray-300">
          <span>Progress</span>
          <span>{safeValue}%</span>
        </div>
      )}
      <div className={cn("w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden", sizes[size])}>
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: animated ? '0%' : `${safeValue}%` }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
