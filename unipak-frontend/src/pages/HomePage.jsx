import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BarChart3, Bed, Building2, Calculator, ChevronRight, DollarSign, MapPin, Search } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DeadlineCountdown from '../components/ui/DeadlineCountdown';
import LedgerLine from '../components/ui/LedgerLine';
import MeritStamp from '../components/ui/MeritStamp';
import MeritTrendChart from '../components/ui/MeritTrendChart';
import Footer from '../components/layout/Footer';
import nustLogo from '../../logos/nust.png';
import lumsLogo from '../../logos/LUMS.png';
import fastLogo from '../../logos/FAST logo.png';

const featuredUniversities = [
  { id: 14, shortName: 'NUST', name: 'National University of Sciences & Technology', city: 'Islamabad', sector: 'Public', logo: nustLogo, logoFrame: 'w-24', image: '/images/NUST_islamabad.jpg' },
  { id: 4, shortName: 'LUMS', name: 'Lahore University of Management Sciences', city: 'Lahore', sector: 'Private', logo: lumsLogo, logoFrame: 'w-16', image: '/images/LUMS.jpg' },
  { id: 1, shortName: 'FAST', name: 'FAST–NUCES', city: 'Lahore', sector: 'Private', logo: fastLogo, logoFrame: 'w-16', image: '/images/FAST_lahore.jpg' },
];

const features = [
  { code: '01', icon: Search, title: 'University Explorer', desc: 'Browse Pakistani universities by city, sector, program and facilities.', path: '/explore' },
  { code: '02', icon: Calculator, title: 'Aggregate Calculator', desc: 'Calculate merit using each university’s own published formula.', path: '/calculator' },
  { code: '03', icon: BarChart3, title: 'Admission Predictor', desc: 'Compare two programs against their latest recorded cutoffs.', path: '/prediction' },
  { code: '04', icon: Award, title: 'Merit Records', desc: 'Review historical closing merits and program-level cutoff records.', path: '/explore' },
  { code: '05', icon: Bed, title: 'Hostel Information', desc: 'Check available accommodation notes before you shortlist.', path: '/explore' },
  { code: '06', icon: DollarSign, title: 'Fee Structures', desc: 'Compare recorded tuition fees across faculties and programs.', path: '/explore' },
];

const sampleTrend = [
  { year: '2022', value: 78.1 }, { year: '2023', value: 79.3 }, { year: '2024', value: 80.4 }, { year: '2025', value: 81.7 }, { year: '2026', value: 82.5 },
];

const reveal = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-300 dark:border-slate-800">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-indigo-500/40 brick-texture opacity-20 lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="lg:col-span-7">
            <motion.div variants={reveal} className="mb-7 flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
              <span className="h-px w-9 bg-current" /> Pakistan admissions record · 2026
            </motion.div>
            <motion.h1 variants={reveal} className="max-w-3xl text-5xl leading-[0.97] text-slate-950 sm:text-6xl lg:text-7xl dark:text-slate-100">
              Turn your marks into an admission plan.
            </motion.h1>
            <motion.p variants={reveal} className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Explore universities, calculate your official aggregate, compare closing merits and plan your applications from one clear record.
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/explore" size="lg">Open university ledger <ArrowRight className="h-5 w-5" /></Button>
              <Button as={Link} to="/calculator" variant="outline" size="lg">Calculate aggregate</Button>
            </motion.div>
            <motion.div variants={reveal} className="mt-11 grid max-w-2xl grid-cols-3 border-y border-slate-300 py-4 dark:border-slate-800">
              {[['19+', 'Universities'], ['219+', 'Programs'], ['42', 'Departments']].map(([value, label], index) => (
                <div key={label} className={index ? 'border-l border-slate-300 px-4 dark:border-slate-800' : 'pr-4'}>
                  <div className="ledger-number text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="lg:col-span-5">
            <div className="ledger-panel relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-300 px-5 py-3 dark:border-slate-800">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-500">Sample merit record / live preview</span>
                <span className="font-mono text-[10px] text-violet-400">ML-026</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-sm text-slate-500">Estimated aggregate</p>
                    <div className="ledger-number mt-1 text-5xl font-semibold text-slate-950 dark:text-slate-100"><AnimatedCounter value={82.5} duration={900} />%</div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">Sample inputs · not a prediction</p>
                  </div>
                  <MeritStamp status="Likely" size="sm" />
                </div>
                <div className="mt-6 h-2 overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: '82.5%' }} transition={{ duration: 0.7, delay: 0.35 }} className="h-full bg-indigo-500" />
                </div>
                <LedgerLine label="5 year trace" className="mt-7" />
                <MeritTrendChart data={sampleTrend} height={185} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">Admissions toolkit</p>
            <h2 className="mt-5 text-4xl text-slate-950 dark:text-slate-100">Every important entry, kept in order.</h2>
            <p className="mt-4 max-w-md leading-7 text-slate-600 dark:text-slate-400">Built around the decisions Pakistani applicants actually make—not around a generic dashboard template.</p>
            <div className="mt-8"><DeadlineCountdown targetDate="2026-08-31T23:59:59+05:00" title="Fall planning checkpoint" /></div>
          </div>
          <div className="ledger-panel divide-y divide-slate-300 dark:divide-slate-800">
            {features.map(({ code, icon: Icon, title, desc, path }) => (
              <Link key={code} to={path} className="group grid grid-cols-[44px_1fr_auto] items-start gap-4 p-5 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                <div className="ledger-number text-sm font-semibold text-indigo-600 dark:text-indigo-400">{code}</div>
                <div><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-violet-400" /><h3 className="font-semibold text-slate-950 dark:text-slate-100">{title}</h3></div><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p></div>
                <ChevronRight className="mt-1 h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-300 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl"><p className="section-kicker">Application sequence</p><h2 className="mt-5 text-4xl">Four entries. One informed decision.</h2></div>
          <div className="mt-10 grid border-y border-slate-300 md:grid-cols-4 md:divide-x dark:border-slate-800 dark:divide-slate-800">
            {[['01', 'Choose universities', 'Search the complete university record.'], ['02', 'Calculate aggregate', 'Use program-specific formula inputs.'], ['03', 'Compare and predict', 'Review your score against cutoffs.'], ['04', 'Plan admissions', 'Shortlist and prepare your applications.']].map(([step, title, desc]) => (
              <div key={step} className="border-b border-slate-300 p-6 last:border-b-0 md:border-b-0 dark:border-slate-800"><div className="ledger-number text-3xl text-indigo-500">{step}</div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">University register</p><h2 className="mt-5 text-4xl">Featured institutions</h2></div><Link to="/explore" className="inline-flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">View complete register <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {featuredUniversities.map((uni, index) => (
            <Card key={uni.id} hoverable padding="p-0" className="group overflow-hidden">
              <Link to={`/university/${uni.id}`} className="relative isolate block min-h-[300px] overflow-hidden p-6">
                <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[58%] overflow-hidden" aria-hidden="true">
                  <img src={uni.image} alt="" width="720" height="480" loading="lazy" className="university-image-mask h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-l from-slate-950/10 to-transparent dark:from-slate-950/25" />
                </div>
                <div className="relative z-10 flex min-h-[252px] flex-col">
                  <div className="flex items-start justify-between gap-4"><div className={`grid h-16 ${uni.logoFrame} place-items-center overflow-hidden rounded-md border border-slate-300 bg-white p-1.5 dark:border-slate-700`}><img src={uni.logo} alt={`${uni.shortName} logo`} width="96" height="64" loading="lazy" className="h-full w-full object-contain" /></div><span className="bg-slate-50/80 px-1.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-500 backdrop-blur-sm dark:bg-slate-900/80">Record {String(index + 1).padStart(2, '0')}</span></div>
                  <h3 className="mt-6 max-w-[62%] text-lg font-semibold text-slate-950 dark:text-slate-100">{uni.name}</h3>
                  <div className="mt-auto flex w-fit max-w-[72%] flex-wrap items-center gap-2 border-t border-slate-300 bg-slate-50/75 pt-4 pr-2 text-sm text-slate-500 backdrop-blur-[2px] dark:border-slate-800 dark:bg-slate-900/75"><MapPin className="h-4 w-4" /> {uni.city}<span>·</span><Building2 className="h-4 w-4" /> {uni.sector}</div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="brick-texture border-y border-indigo-400 py-14 text-[#F3EAD8]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9A43B]">Your next application entry</p><h2 className="mt-3 text-4xl text-[#F3EAD8]">Ready to plan your future?</h2><p className="mt-3 max-w-2xl text-[#F3EAD8]/80">Start with the university register, then move through your aggregate and prediction records.</p></div><Button as={Link} to="/explore" variant="cta" size="lg">Get started now <ArrowRight className="h-5 w-5" /></Button></div>
      </section>
      <Footer />
    </div>
  );
}
