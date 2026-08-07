import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Monitor, Trash2, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';
import clsx from 'clsx';

export default function SettingsPage() {
  // Graceful fallback if useTheme is not fully setup yet
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'system';
  const setTheme = themeContext?.setTheme || (() => {});
  
  const handleClearSaved = () => {
    if (window.confirm('Are you sure you want to clear all saved universities? This cannot be undone.')) {
      // Clear saved logic here
      console.log('Cleared saved universities');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your calculation history?')) {
      // Clear history logic here
      console.log('Cleared calculation history');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('WARNING: Are you sure you want to clear ALL data? This will reset the app completely.')) {
      // Clear all logic here
      console.log('Cleared all data');
    }
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="page-container max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-indigo-500" />
          <h1 className="page-heading">
            <GradientText>Settings</GradientText>
          </h1>
        </div>
        <p className="page-copy">
          Manage your app preferences and data
        </p>
      </div>

      <div className="space-y-8">
        {/* Appearance Section */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-base font-medium text-slate-900 dark:text-white">Theme</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose how UniPak looks to you.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                    theme === option.id 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* Data Management Section */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Data Management</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-white">Saved Universities</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Remove all bookmarked universities.</p>
                </div>
                <Button variant="outline" onClick={handleClearSaved} className="shrink-0 text-slate-700 dark:text-slate-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Universities
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-white">Calculation History</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Remove all saved calculator results.</p>
                </div>
                <Button variant="outline" onClick={handleClearHistory} className="shrink-0 text-slate-700 dark:text-slate-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div>
                  <h3 className="text-base font-medium text-red-600 dark:text-red-400">Clear All Data</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete all your local data.</p>
                </div>
                <Button 
                  onClick={handleClearAll}
                  className="shrink-0 bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">About</h2>
          <Card className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white text-3xl font-bold tracking-tight">UP</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">UniPak</h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">Version 1.0.0</p>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Pakistan's Complete University Admission Platform. Find universities, compare programs, and calculate aggregates all in one place.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium">
                <a href="#privacy" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <a href="#terms" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
