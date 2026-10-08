import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Bookmark, Bot, Calculator, Ellipsis, GraduationCap, Home, ListChecks, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: GraduationCap, label: 'Explore', path: '/explore' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: ListChecks, label: 'Tests', path: '/test-breakdowns' },
  { icon: BarChart3, label: 'Predict', path: '/prediction' },
];

const moreItems = [
  { icon: Bot, label: 'AI Assistant', path: '/ai' },
  { icon: Bookmark, label: 'Saved Items', path: '/saved' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function MobileNav() {
  const location = useLocation();
  const menuRef = useRef(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isMoreRouteActive = moreItems.some((item) => location.pathname === item.path);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMoreOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMoreOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMoreOpen]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-300 bg-slate-50/95 pb-safe backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden" aria-label="Mobile navigation">
      <div className="flex items-center justify-around px-1 py-2.5 sm:px-2">
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
        <div ref={menuRef} className="relative">
          {isMoreOpen && (
            <div
              id="mobile-more-menu"
              role="menu"
              aria-label="More navigation"
              className="absolute bottom-[calc(100%+0.75rem)] right-0 w-60 overflow-hidden rounded-xl border border-slate-300 bg-slate-50 p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="px-3 pb-2 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">More destinations</p>
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    role="menuitem"
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsMoreOpen((current) => !current)}
            aria-expanded={isMoreOpen}
            aria-controls="mobile-more-menu"
            aria-haspopup="menu"
            className={cn(
              'relative flex min-h-12 w-14 flex-col items-center justify-center gap-1 rounded-md py-1 transition-colors sm:w-16',
              isMoreOpen || isMoreRouteActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            )}
          >
            <Ellipsis className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-[11px] font-semibold">More</span>
            {isMoreRouteActive && (
              <motion.div
                layoutId="mobile-active"
                className="absolute -top-2.5 h-1 w-7 bg-indigo-600 dark:bg-indigo-400"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
