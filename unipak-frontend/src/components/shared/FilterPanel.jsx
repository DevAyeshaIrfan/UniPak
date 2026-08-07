import React from 'react';
import { cn } from '../../lib/utils';

export default function FilterPanel({ filters, onFilterChange, cities = [] }) {
  const sectors = ['All', 'Public', 'Private'];
  
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
        <button 
          onClick={() => onFilterChange({ city: 'All', sector: 'All', hostel: false })}
          className="min-h-9 rounded-lg px-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Sector</h4>
          <div className="flex flex-wrap gap-2">
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => onFilterChange({ ...filters, sector })}
                className={cn(
                  "min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200",
                  filters.sector === sector
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">City</h4>
          <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => onFilterChange({ ...filters, city: 'All' })}
              className={cn(
                "min-h-10 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200",
                filters.city === 'All'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              All Cities
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => onFilterChange({ ...filters, city })}
                className={cn(
                  "min-h-10 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200",
                  filters.city === city
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
