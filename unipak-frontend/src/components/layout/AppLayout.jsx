import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';

export default function AppLayout() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh overflow-hidden bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="page-shell flex-1 overflow-y-auto pb-20 lg:pb-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <MobileNav />
        </div>
      </div>
    </MotionConfig>
  );
}
