import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const getChanceDetails = (percentage) => {
  if (percentage >= 75) return { color: '#3F7D6C', label: 'Very High', tailwind: 'text-emerald-500' };
  if (percentage >= 60) return { color: '#3F7D6C', label: 'High', tailwind: 'text-emerald-500' };
  if (percentage >= 40) return { color: '#D9A43B', label: 'Moderate', tailwind: 'text-violet-400' };
  if (percentage >= 25) return { color: '#8C3B27', label: 'Low', tailwind: 'text-red-500' };
  return { color: '#8C3B27', label: 'Very Low', tailwind: 'text-red-500' };
};

export default function ChanceIndicator({
  percentage = 0,
  size = 120,
  strokeWidth = 8,
  className
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercentage = Math.min(Math.max(0, percentage), 100);
  
  const { color, label, tailwind } = getChanceDetails(safePercentage);
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setAnimatedValue(safePercentage);
      return undefined;
    }
    // Simple animation for the number value
    const duration = 1000;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    const stepValue = safePercentage / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= safePercentage) {
        setAnimatedValue(safePercentage);
        clearInterval(timer);
      } else {
        setAnimatedValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [safePercentage]);

  return (
    <div className={cn("flex flex-col items-center justify-center relative", className)}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Background Circle */}
        <svg
          className="absolute transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-gray-200 dark:stroke-slate-800"
            fill="none"
          />
          {/* Animated Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        
        {/* Value Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="ledger-number text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(animatedValue)}%
          </span>
        </div>
      </div>
      
      {/* Label */}
      <span className={cn("mt-3 font-semibold text-sm", tailwind)}>
        {label}
      </span>
    </div>
  );
}
