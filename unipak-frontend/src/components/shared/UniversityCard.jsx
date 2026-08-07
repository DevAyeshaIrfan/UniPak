import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const getUniversityImage = (id) => {
  const map = {
    1: 'FAST_lahore.jpg',
    2: 'UET_Lahore.jpg',
    3: 'COMSATS_lahore.jpg',
    4: 'LUMS.jpg',
    5: 'ITU-Lahore.png',
    6: 'king_edward.jpg',
    7: 'fatima_jinnah.jpg',
    8: 'FAST_karachi.jpg',
    9: 'IBA_karachi.jpg',
    10: 'NED_Karachi.jpg',
    11: 'agha_khan.jpg',
    12: 'nust_pnec.jpg',
    13: 'habib_university.jpg',
    14: 'NUST_islamabad.jpg',
    15: 'COMSATS_islamabad.jpg',
    16: 'pieas_islamabad.jpg',
    17: 'air_university.jpg',
    18: 'numl_islamabad.jpg',
    19: 'FAST_islamabad.jpg',
  };
  return map[id] ? `/images/${map[id]}` : '/images/placeholder.jpg';
};

export default function UniversityCard({ university }) {
  const {
    UniversityID,
    UniversityName,
    CityName,
    Sector,
    ProgramCount,
    programCount
  } = university;

  const displayProgramCount = ProgramCount || programCount || 0;
  const isPublic = Sector?.toLowerCase() === 'public';
  const imagePath = getUniversityImage(UniversityID);

  return (
    <Link to={`/explore/${UniversityID}`} className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-200 group-hover:border-indigo-200 group-hover:shadow-[var(--shadow-soft-lg)] dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-indigo-500/30"
      >
        <div className="relative h-44 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <img 
            src={imagePath} 
            alt={UniversityName} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=University+Image' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2",
              isPublic 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
            )}>
              {Sector}
            </span>
            <h3 className="font-semibold text-lg text-white leading-tight line-clamp-2">
              {UniversityName}
            </h3>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{CityName}</span>
          </div>
          
          <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Programs</span>
                <span className="text-sm font-semibold">{displayProgramCount}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
