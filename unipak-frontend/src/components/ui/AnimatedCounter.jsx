import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../lib/utils';

const easeOutQuart = (t) => 1 - --t * t * t * t;

export default function AnimatedCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  className,
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setCount(parseFloat(value) || 0);
      return undefined;
    }
    
    let startTime;
    let animationFrame;
    const startValue = 0;
    const endValue = parseFloat(value) || 0;

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easedPercentage = easeOutQuart(percentage);
      const currentValue = startValue + (endValue - startValue) * easedPercentage;
      
      setCount(currentValue);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        setCount(endValue);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration, isVisible]);

  // Format to whole number or 1 decimal if needed
  const displayValue = Number.isInteger(parseFloat(value)) 
    ? Math.round(count) 
    : count.toFixed(1);

  return (
    <span ref={elementRef} className={cn("font-medium", className)}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
