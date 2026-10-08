import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Calculator, GraduationCap, BookOpen } from 'lucide-react';
import { SavedContext } from '../store/SavedContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import GradientText from '../components/ui/GradientText';
import { universityImages } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    // Provide a fallback if context is not yet implemented
    return {
      savedUniversities: [],
      savedResults: [],
      removeUniversity: () => {},
      removeResult: () => {},
      clearAll: () => {},
    };
  }
  return context;
};

export default function SavedPage() {
  const { savedUniversities, savedResults, removeUniversity, removeResult, clearAll } = useSaved();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="page-heading mb-2">
            <GradientText>Saved Items</GradientText>
          </h1>
          <p className="page-copy">
            Your bookmarked universities and calculation results
          </p>
        </div>
        {(savedUniversities.length > 0 || savedResults.length > 0) && (
          <Button variant="outline" onClick={clearAll} className="flex items-center gap-2 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 dark:border-red-900/50">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-12">
        {/* Saved Universities Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Saved Universities</h2>
            <Badge variant="secondary" className="ml-2">{savedUniversities.length}</Badge>
          </div>

          {savedUniversities.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No saved universities"
              description="Start exploring and save universities you're interested in"
              action={{
                label: "Explore Universities",
                onClick: () => navigate('/explore')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedUniversities.map((uni) => (
                <motion.div
                  key={uni.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="flex flex-col h-full overflow-hidden group">
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={`/images/${universityImages[uni.id] || 'placeholder.jpg'}`} 
                        alt={uni.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <button 
                        onClick={() => removeUniversity(uni.id)}
                        className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-red-500/80 backdrop-blur-sm rounded-full text-white transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {uni.name}
                      </h3>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 gap-2">
                        <span>{uni.city}</span>
                        <span>•</span>
                        <span className="capitalize">{uni.sector}</span>
                      </div>
                      <div className="mt-auto">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => navigate(`/explore/${uni.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Results Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Saved Results</h2>
            <Badge variant="secondary" className="ml-2">{savedResults.length}</Badge>
          </div>

          {savedResults.length === 0 ? (
            <EmptyState
              icon={Calculator}
              title="No saved results"
              description="Use the aggregate calculator to save your results"
              action={{
                label: "Calculate Aggregate",
                onClick: () => navigate('/calculator')
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedResults.map((result) => (
                <motion.div
                  key={result.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-5 flex flex-col h-full border-l-4 border-l-indigo-500 relative">
                    <button 
                      onClick={() => removeResult(result.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="mb-4">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        {new Date(result.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {Number.isFinite(result.aggregate) ? `${result.aggregate.toFixed(2)}%` : 'Holistic'}
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                          Aggregate
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                          {result.universityName}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 line-clamp-1">
                          {result.facultyName}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
