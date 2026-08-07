import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  GraduationCap,
  Calculator,
  BarChart3,
  Bot,
  Settings,
  Sun,
  Moon
  ,ListChecks
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: GraduationCap, label: 'Explore', path: '/explore' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: ListChecks, label: 'Test Breakdown', path: '/test-breakdowns' },
  { icon: BarChart3, label: 'Prediction', path: '/prediction' },
  { icon: Bot, label: 'AI Assistant', path: '/ai' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <aside className="hidden h-full w-[264px] border-r border-slate-300 bg-slate-50 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
      <div className="p-5">
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="brick-texture flex h-10 w-10 items-center justify-center rounded-md border border-indigo-400 text-[#F3EAD8]">
            <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div><span className="font-display block text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-slate-100">UniPak</span><span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-indigo-500">Merit Ledger</span></div>
        </div>

        <nav className="space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div key={item.label} className="flex items-center justify-between px-3 py-3 text-slate-400 dark:text-slate-500 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'group relative flex min-h-11 items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm transition-[color,background-color,border-color] duration-200',
                    isActive
                      ? 'border-indigo-300 bg-indigo-50 font-semibold text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-300'
                      : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 h-6 w-1 bg-indigo-600 dark:bg-indigo-400"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-300 p-5 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-800 dark:hover:border-indigo-500 dark:hover:text-slate-100"
          >
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">Ledger v1.0</span>
        </div>
      </div>
    </aside>
  );
}
