import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getChanceLabel(percent) {
  if (percent >= 85) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' };
  if (percent >= 70) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  if (percent >= 50) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
  return { label: 'Low', color: 'text-red-600 dark:text-red-400' };
}

export function getChanceColor(percent) {
  if (percent >= 85) return 'bg-emerald-500';
  if (percent >= 70) return 'bg-blue-500';
  if (percent >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getHostelBadge(status) {
  const normalizedStatus = (status || '').toLowerCase();
  if (normalizedStatus.includes('available') || normalizedStatus === 'yes') {
    return { label: 'Available', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: 'check' };
  }
  if (normalizedStatus.includes('limited')) {
    return { label: 'Limited', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: 'alert' };
  }
  return { label: 'Not Available', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: 'x' };
}

export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export const universityImages = {
  1: '/images/FAST_lahore.jpg',
  2: '/images/UET_Lahore.jpg',
  3: '/images/COMSATS_lahore.jpg',
  4: '/images/LUMS.jpg',
  5: '/images/ITU-Lahore.png',
  6: '/images/king_edward.jpg',
  7: '/images/fatima_jinnah.jpg',
  8: '/images/FAST_karachi.jpg',
  9: '/images/IBA_karachi.jpg',
  10: '/images/NED_Karachi.jpg',
  11: '/images/agha_khan.jpg',
  12: '/images/nust_pnec.jpg',
  13: '/images/habib_university.jpg',
  14: '/images/NUST_islamabad.jpg',
  15: '/images/COMSATS_islamabad.jpg',
  16: '/images/pieas_islamabad.jpg',
  17: '/images/air_university.jpg',
  18: '/images/numl_islamabad.jpg',
  19: '/images/FAST_islamabad.jpg',
};

// Campus locality and map-search queries are kept separate from the SQL schema,
// whose Universities table intentionally stores only the city and sector.
export const campusInfo = {
  1: { area: 'Block B, Faisal Town, Lahore', mapQuery: 'FAST NUCES Lahore Campus, Block B Faisal Town, Lahore' },
  2: { area: 'G.T. Road, Baghbanpura, Lahore', mapQuery: 'UET Lahore Main Campus, G.T. Road, Baghbanpura, Lahore' },
  3: { area: 'Defence Road, Off Raiwind Road, Lahore', mapQuery: 'COMSATS University Islamabad Lahore Campus, Defence Road, Lahore' },
  4: { area: 'DHA, Lahore Cantt.', mapQuery: 'Lahore University of Management Sciences, DHA Lahore Cantt' },
  5: { area: 'Arfa Software Technology Park, Ferozepur Road, Lahore', mapQuery: 'Information Technology University, Arfa Software Technology Park, Lahore' },
  6: { area: 'Nelagumbad, Lahore', mapQuery: 'King Edward Medical University, Nelagumbad, Lahore' },
  7: { area: 'Queen’s Road, Lahore', mapQuery: 'Fatima Jinnah Medical University, Queen Road, Lahore' },
  8: { area: 'Shah Latif Town, National Highway, Karachi', mapQuery: 'FAST NUCES Karachi Main Campus, Shah Latif Town, Karachi' },
  9: { area: 'University Road, Karachi', mapQuery: 'Institute of Business Administration Karachi Main Campus, University Road, Karachi' },
  10: { area: 'University Road, Karachi', mapQuery: 'NED University of Engineering and Technology, University Road, Karachi' },
  11: { area: 'Stadium Road, Karachi', mapQuery: 'Aga Khan University Hospital and Medical College, Stadium Road, Karachi' },
  12: { area: 'PNS Karsaz, Karachi', mapQuery: 'NUST Pakistan Navy Engineering College PNEC, PNS Karsaz, Karachi' },
  13: { area: 'Block 18, Gulistan-e-Jauhar, Karachi', mapQuery: 'Habib University, Block 18 Gulistan-e-Jauhar, Karachi' },
  14: { area: 'Sector H-12, Islamabad', mapQuery: 'NUST Main Campus, Sector H-12, Islamabad' },
  15: { area: 'Park Road, Tarlai Kalan, Islamabad', mapQuery: 'COMSATS University Islamabad Main Campus, Park Road, Islamabad' },
  16: { area: 'Nilore, Islamabad', mapQuery: 'Pakistan Institute of Engineering and Applied Sciences PIEAS, Nilore, Islamabad' },
  17: { area: 'PAF Complex, Sector E-9, Islamabad', mapQuery: 'Air University Islamabad, PAF Complex E-9, Islamabad' },
  18: { area: 'Sector H-9, Islamabad', mapQuery: 'National University of Modern Languages NUML, Sector H-9, Islamabad' },
  19: { area: 'A.K. Brohi Road, Sector H-11/4, Islamabad', mapQuery: 'FAST NUCES Islamabad Campus, A.K. Brohi Road H-11/4, Islamabad' },
};

export function getCampusMapUrl(universityId) {
  const query = campusInfo[universityId]?.mapQuery;
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}
