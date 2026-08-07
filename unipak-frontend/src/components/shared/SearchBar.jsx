import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn("group relative flex w-full items-center", className)}>
      <Search className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" strokeWidth={1.8} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base text-slate-900 shadow-[var(--shadow-soft)] outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
