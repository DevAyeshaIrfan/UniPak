import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setPageMetadata } from '../../lib/metadata';

const ROUTE_METADATA = {
  '/': {
    title: 'UniPak',
    description: 'Explore Pakistani universities, calculate admission aggregates, compare merit cutoffs, and plan your applications.',
  },
  '/explore': {
    title: 'Explore Universities',
    description: 'Browse and filter Pakistani universities by city and sector, then review their programs, fees, hostels, and admission requirements.',
  },
  '/calculator': {
    title: 'Aggregate Calculator',
    description: 'Calculate your university admission aggregate with faculty-specific formulas and accepted entry-test scores.',
  },
  '/test-breakdowns': {
    title: 'Entry Test Breakdowns',
    description: 'Review subjects, formats, totals, and negative-marking details for common Pakistani university entry tests.',
  },
  '/prediction': {
    title: 'Admission Prediction',
    description: 'Compare two university programs using their admission formulas and available merit-cutoff records.',
  },
  '/ai': {
    title: 'Admissions AI Assistant',
    description: 'Ask the UniPak assistant about universities, programs, entry tests, aggregates, merit cutoffs, fees, and hostels.',
  },
  '/saved': {
    title: 'Saved Results',
    description: 'Review university bookmarks and aggregate-calculation results saved locally in UniPak.',
  },
  '/settings': {
    title: 'Settings',
    description: 'Manage UniPak appearance preferences and locally saved application-planning data.',
  },
  '/faq': {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about UniPak university data, aggregate calculations, merit predictions, and saved results.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'Learn how UniPak handles locally saved data, API requests, and AI Assistant messages.',
  },
  '/support': {
    title: 'Support',
    description: 'Contact UniPak, report a bug, or record a feature request for the local university-admissions project.',
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'Read the general terms that apply when using UniPak university-admission planning tools and information.',
  },
};

export default function RouteMetadata() {
  const location = useLocation();

  useEffect(() => {
    const isUniversityDetail = /^\/explore\/[^/]+$/.test(location.pathname);
    const metadata = ROUTE_METADATA[location.pathname] || (isUniversityDetail
      ? {
          title: 'University Details',
          description: 'Review university programs, faculties, fees, hostel information, merit cutoffs, and campus directions on UniPak.',
        }
      : {
          title: 'Page Not Found',
          description: 'The requested UniPak page could not be found.',
          robots: 'noindex, follow',
        });

    setPageMetadata({ ...metadata, path: location.pathname });
  }, [location.pathname]);

  return null;
}
