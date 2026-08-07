import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <h1 className="ledger-number mb-4 text-8xl font-bold md:text-9xl">
          <GradientText>404</GradientText>
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as={Link} to="/" className="flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Button>
          <Button as={Link} to="/explore" variant="outline" className="flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Explore Universities
          </Button>
        </div>
        
        <div className="mt-12 text-slate-500 dark:text-slate-500">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 mx-auto hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
