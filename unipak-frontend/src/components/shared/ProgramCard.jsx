import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Banknote, BedDouble, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

function parseSemesterFees(feeText) {
  if (!feeText) return { estimated: 'Not available', firstSemester: 'Not available' };
  const feePattern = /PKR\s*[\d,]+(?:\s*[–—-]\s*[\d,]+)?/gi;
  const firstSemesterIndex = feeText.search(/first[- ]semester/i);
  const allFees = feeText.match(feePattern) || [];
  if (firstSemesterIndex < 0) return { estimated: allFees[0] || 'Not available', firstSemester: 'Not available' };
  const regularFees = feeText.slice(0, firstSemesterIndex).match(feePattern) || [];
  const firstSemesterFees = feeText.slice(firstSemesterIndex).match(feePattern) || [];
  return {
    estimated: regularFees[0] || allFees[1] || allFees[0] || 'Not available',
    firstSemester: firstSemesterFees[0] || allFees[0] || 'Not available',
  };
}

function getHostelDisplay(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'yes') return { label: 'Hostel available', className: 'text-emerald-600 dark:text-emerald-400' };
  if (normalized === 'limited') return { label: 'Limited hostel', className: 'text-amber-600 dark:text-amber-400' };
  if (normalized === 'no') return { label: 'No hostel', className: 'text-rose-600 dark:text-rose-400' };
  return { label: 'Hostel not specified', className: 'text-slate-500 dark:text-slate-400' };
}

export default function ProgramCard({ program }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    ProgramName,
    MajorCategory,
    FacultyName,
    Duration,
    Semesters,
    SemesterFee,
    HostelStatus,
    AggregateFormula,
    ApplicationMethod
  } = program;
  const fees = parseSemesterFees(SemesterFee);
  const hostel = getHostelDisplay(HostelStatus);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-200 hover:border-indigo-200 hover:shadow-[var(--shadow-soft-lg)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30">
      <div 
        className="cursor-pointer select-none p-5 outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {MajorCategory}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {FacultyName}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white leading-tight">
              {ProgramName}
            </h3>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-[transform,background-color] duration-200", isExpanded ? "rotate-180 bg-slate-100 dark:bg-slate-800" : "bg-transparent")}>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm">{Duration || 'Duration not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm">{Semesters} Semesters</span>
          </div>
          <div className={cn("flex items-center gap-2", hostel.className)}>
            <BedDouble className="w-4 h-4" />
            <span className="text-sm font-medium">{hostel.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Banknote className="w-3.5 h-3.5" /> Estimated fee
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{fees.estimated}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">First semester fee</div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{fees.firstSemester}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
          >
            <div className="p-5 flex flex-col sm:flex-row gap-6">
              {AggregateFormula && (
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Aggregate Formula</h4>
                  <div className="bg-slate-900 dark:bg-black/50 p-3 rounded-xl border border-slate-700 dark:border-slate-800 text-slate-300 font-mono text-sm overflow-x-auto">
                    <code>{AggregateFormula}</code>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Application Method</h4>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ApplicationMethod || 'Apply online through the university admission portal. Make sure to review all eligibility criteria before applying.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
