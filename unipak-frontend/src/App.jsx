import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const UniversityDetailPage = lazy(() => import('./pages/UniversityDetailPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const PredictionPage = lazy(() => import('./pages/PredictionPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TestBreakdownPage = lazy(() => import('./pages/TestBreakdownPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="explore"
          element={
            <Suspense fallback={<PageLoader />}>
              <ExplorePage />
            </Suspense>
          }
        />
        <Route
          path="explore/:universityId"
          element={
            <Suspense fallback={<PageLoader />}>
              <UniversityDetailPage />
            </Suspense>
          }
        />
        <Route
          path="calculator"
          element={
            <Suspense fallback={<PageLoader />}>
              <CalculatorPage />
            </Suspense>
          }
        />
        <Route
          path="prediction"
          element={
            <Suspense fallback={<PageLoader />}>
              <PredictionPage />
            </Suspense>
          }
        />
        <Route
          path="ai"
          element={
            <Suspense fallback={<PageLoader />}>
              <AssistantPage />
            </Suspense>
          }
        />
        <Route
          path="saved"
          element={
            <Suspense fallback={<PageLoader />}>
              <SavedPage />
            </Suspense>
          }
        />
        <Route
          path="test-breakdowns"
          element={
            <Suspense fallback={<PageLoader />}>
              <TestBreakdownPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
