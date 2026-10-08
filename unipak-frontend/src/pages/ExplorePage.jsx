import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, MapPin, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import { useUniversities, useCities } from '../hooks/useUniversities';
import UniversityCard from '../components/shared/UniversityCard';
import SearchBar from '../components/shared/SearchBar';
import FilterPanel from '../components/shared/FilterPanel';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import GradientText from '../components/ui/GradientText';
import AnimatedCounter from '../components/ui/AnimatedCounter';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    city: 'All',
    sector: 'All',
  });

  // Build query params for the API
  const queryFilters = useMemo(() => {
    const f = {};
    if (filters.city && filters.city !== 'All') f.city = filters.city;
    if (filters.sector && filters.sector !== 'All') f.sector = filters.sector;
    if (search) f.search = search;
    return f;
  }, [filters, search]);

  const { data, isLoading, isError, error } = useUniversities(queryFilters);
  const { data: citiesData } = useCities();

  // Extract arrays from API response shapes
  const universities = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const cities = useMemo(() => {
    if (!citiesData) return [];
    const raw = Array.isArray(citiesData) ? citiesData : citiesData?.data || [];
    return raw.map(c => typeof c === 'string' ? c : c.CityName).filter(Boolean);
  }, [citiesData]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <h1 className="page-heading mb-3">
            <span className="text-slate-950 dark:text-white">Explore</span>{' '}
            <GradientText>Universities</GradientText>
          </h1>
          <p className="page-copy">
            Discover your perfect university from across Pakistan
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar 
            value={search}
            onChange={setSearch}
            placeholder="Search universities by name..."
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            cities={cities}
          />
        </div>

        {/* Results count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400" aria-live="polite">
            Showing {isLoading ? '...' : <AnimatedCounter value={universities.length} duration={320} className="text-indigo-500" />} universities
          </p>
          {(search || filters.city !== 'All' || filters.sector !== 'All') && (
            <button 
              onClick={() => { setSearch(''); setFilters({ city: 'All', sector: 'All' }); }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Error state */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 border border-red-200 dark:border-red-800">
            Failed to load universities. {error?.message || 'Please check if the backend is running.'}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-80">
                <Skeleton className="h-40 w-full" />
                <div className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !isError && universities.length === 0 ? (
          <EmptyState 
            icon={<Building2 className="w-12 h-12 text-slate-400" />}
            title="No universities found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <button 
                onClick={() => { setSearch(''); setFilters({ city: 'All', sector: 'All' }); }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {universities.map((uni) => (
              <motion.div key={uni.UniversityID} variants={itemVariants}>
                <UniversityCard university={uni} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
