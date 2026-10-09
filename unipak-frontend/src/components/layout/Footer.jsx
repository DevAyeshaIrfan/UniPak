import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 inline-flex">
              <span className="text-xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">
                UniPak
              </span>
            </Link>
            <p className="mb-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
              Empowering students in Pakistan to find the right university, calculate aggregates, and predict admission chances with AI.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/unipak.app/" target="_blank" rel="noopener noreferrer" aria-label="UniPak on Instagram" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="External resource" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><Link to="/faq" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/support?type=contact" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/support?type=bug" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Report a Bug</Link></li>
              <li><Link to="/support?type=feature" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Request Feature</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2026 UniPak. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>in Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
