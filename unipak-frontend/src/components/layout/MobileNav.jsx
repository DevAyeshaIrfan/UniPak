import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, Calculator, BarChart3, ListChecks } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: GraduationCap, label: 'Explore', path: '/explore' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: ListChecks, label: 'Tests', path: '/test-breakdowns' },
  { icon: BarChart3, label: 'Predict', path: '/prediction' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-300 bg-slate-50/95 pb-safe backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden" aria-label="Mobile navigation">
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-12 w-16 flex-col items-center justify-center gap-1 rounded-md py-1 transition-colors',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active"
                      className="absolute -top-2.5 h-1 w-7 bg-indigo-600 dark:bg-indigo-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
