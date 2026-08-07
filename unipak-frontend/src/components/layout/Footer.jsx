import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-indigo-500" />
      
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 inline-flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white dark:bg-indigo-500">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">
                UniPak
              </span>
            </Link>
            <p className="mb-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
              Empowering students in Pakistan to find the right university, calculate aggregates, and predict admission chances with AI.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Explore Universities</Link></li>
              <li><Link to="/calculator" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Aggregate Calculator</Link></li>
              <li><Link to="/prediction" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admission Prediction</Link></li>
              <li><Link to="/ai" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Support Center</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admission Guides</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
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
