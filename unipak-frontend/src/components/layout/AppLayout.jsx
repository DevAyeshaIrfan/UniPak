import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import MobileNav from './MobileNav';
import Header from './Header';
import Footer from './Footer';
import RouteMetadata from './RouteMetadata';
import RouteErrorBoundary from './RouteErrorBoundary';

export default function AppLayout() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <RouteMetadata />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="flex h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950">
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Header />
          <main id="main-content" tabIndex={-1} className="page-shell flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className="flex min-h-full flex-col">
              <div className="flex-1">
                <RouteErrorBoundary key={location.pathname}>
                  <Outlet />
                </RouteErrorBoundary>
              </div>
              <Footer />
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    </MotionConfig>
  );
}
