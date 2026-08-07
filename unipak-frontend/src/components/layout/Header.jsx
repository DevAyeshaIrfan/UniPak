import { useLocation } from 'react-router-dom';
import { Search, GraduationCap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function Header({ title }) {
  const location = useLocation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const segment = path.split('/')[1];
    if (segment === 'test-breakdowns') return 'Test Breakdowns';
    if (segment === 'ai') return 'AI Assistant';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-slate-50/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-[4.25rem] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Left */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="brick-texture flex h-9 w-9 items-center justify-center rounded-md text-[#F3EAD8]">
              <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.03em] text-slate-950 dark:text-slate-100">
              UniPak
            </span>
          </div>
        </div>

        {/* Desktop Left */}
        <div className="hidden lg:block">
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 rounded-md border border-slate-300 bg-transparent py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 dark:border-slate-800 dark:text-slate-100"
            />
          </div>
          
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          >
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
