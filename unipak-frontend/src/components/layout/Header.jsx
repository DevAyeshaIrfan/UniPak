import { Link } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import Sidebar from './Sidebar';
import Button from '../ui/Button';

export default function Header() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-6 lg:px-10">
        <Link to="/" aria-label="UniPak home" className="site-logo shrink-0 text-slate-950 dark:text-white">UniPak<span className="text-slate-400">.</span></Link>
        <Sidebar />
        <div className="flex items-center gap-2">
          <div className="relative hidden 2xl:block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search..." aria-label="Search" className="h-10 w-32 rounded-full border border-slate-200 bg-transparent pl-9 pr-3 text-sm dark:border-slate-700" />
          </div>
          <button onClick={toggleTheme} aria-label={isDark ? 'Use light theme' : 'Use dark theme'} className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Button as={Link} to="/explore" size="sm" className="min-h-10 px-4">Get started</Button>
        </div>
      </div>
    </header>
  );
}
