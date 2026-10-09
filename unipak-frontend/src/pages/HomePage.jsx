import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';

import { ArrowRight, Award, BarChart3, Bed, Building2, Calculator, DollarSign, MapPin, Search } from 'lucide-react';

import AnimatedCounter from '../components/ui/AnimatedCounter';

import Button from '../components/ui/Button';

import Card from '../components/ui/Card';

import DeadlineCountdown from '../components/ui/DeadlineCountdown';

import LedgerLine from '../components/ui/LedgerLine';

import MeritStamp from '../components/ui/MeritStamp';

import MeritTrendChart from '../components/ui/MeritTrendChart';

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

    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">

      <section className="editorial-section !pb-10">

        <div className="hero-grid">

          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>

            <motion.p variants={reveal} className="section-kicker mb-6">Pakistan admissions record · 2026</motion.p>

            <motion.h1 variants={reveal} className="hero-title max-w-2xl">Turn your marks into an admission plan.</motion.h1>

            <motion.p variants={reveal} className="mt-6 max-w-xl text-lg leading-8 text-slate-500 dark:text-slate-400">

              Explore universities, calculate your official aggregate, compare closing merits and plan your applications from one clear record.

            </motion.p>

            <motion.div variants={reveal} className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Button as={Link} to="/explore" size="lg">Open university ledger <ArrowRight className="h-4 w-4" /></Button>

              <Button as={Link} to="/calculator" variant="outline" size="lg">Calculate aggregate</Button>

            </motion.div>

            <motion.div variants={reveal} className="mt-10 flex gap-8 sm:gap-10">

              {[['19+', 'Universities'], ['219+', 'Programs'], ['42', 'Departments']].map(([value, label]) => (

                <div key={label}>

                  <div className="ledger-number text-2xl font-semibold">{value}</div>

                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{label}</div>

                </div>

              ))}

            </motion.div>

          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15 }} className="min-w-0 rounded-3xl border border-slate-200 bg-slate-100 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">

            <div className="ledger-panel overflow-hidden">

              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                <span className="text-xs text-slate-500 dark:text-slate-400">Sample merit record / live preview</span>

                <span className="text-[10px] text-slate-500">ML-026</span>

              </div>

              <div className="p-5 sm:p-6">

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">Estimated aggregate</p>

                    <div className="ledger-number mt-2 text-5xl font-semibold"><AnimatedCounter value={82.5} duration={900} />%</div>

                    <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">Sample inputs · not a prediction</p>

                  </div>

                  <MeritStamp status="Likely" size="sm" />

                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                  <motion.div initial={{ width: 0 }} animate={{ width: '82.5%' }} transition={{ duration: 0.4, delay: 0.2 }} className="h-full rounded-full bg-slate-900 dark:bg-slate-100" />

                </div>

                <LedgerLine label="5 year trace" className="mt-7" />

                <MeritTrendChart data={sampleTrend} height={170} />

              </div>

            </div>

          </motion.div>

        </div>

        <div className="trust-row mt-16">

          <p className="text-xs text-slate-500 dark:text-slate-400">University register</p>

          {featuredUniversities.map(uni => <Link key={uni.id} to={`/explore/${uni.id}`} aria-label={uni.name} className="flex min-h-12 items-center gap-3"><img className="trust-logo" src={uni.logo} alt={`${uni.shortName} logo`} /><span className="hidden text-sm font-semibold sm:block">{uni.shortName}</span></Link>)}

          <Link to="/explore" className="inline-flex items-center gap-2 text-xs text-slate-500">And many more <ArrowRight className="h-3 w-3" /></Link>

        </div>

      </section>



      <section className="editorial-section">

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div className="max-w-xl"><p className="section-kicker">Admissions toolkit</p><h2 className="mt-4 text-4xl leading-tight sm:text-[42px]">Every important entry, kept in order.</h2></div>

          <p className="max-w-sm text-base leading-7 text-slate-500 dark:text-slate-400">Built around the decisions Pakistani applicants actually make—not around a generic dashboard template.</p>

        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">

          {features.map(({ code, icon: Icon, title, desc, path }) => (

            <Link key={code} to={path} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-7 transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">

              <div className="mb-8 flex items-center justify-between"><Icon className="h-5 w-5" strokeWidth={1.5} /><span className="text-xs text-slate-400">{code}</span></div>

              <h3 className="text-lg font-semibold">{title}</h3>

              <p className="mt-3 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p>

              <ArrowRight className="mt-6 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />

            </Link>

          ))}

        </div>

      </section>



      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

        <div className="editorial-section">

          <div className="grid gap-12 lg:grid-cols-[1fr_340px]">

            <div>

              <p className="section-kicker">Application sequence</p><h2 className="mt-4 max-w-lg text-4xl leading-tight sm:text-[42px]">Four entries. One informed decision.</h2>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">

                {[['01', 'Choose universities', 'Search the complete university record.'], ['02', 'Calculate aggregate', 'Use program-specific formula inputs.'], ['03', 'Compare and predict', 'Review your score against cutoffs.'], ['04', 'Plan admissions', 'Shortlist and prepare your applications.']].map(([step, title, desc]) => (

                  <div key={step} className="border-t border-slate-200 pt-5 dark:border-slate-800"><div className="text-xs text-slate-500">{step}</div><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p></div>

                ))}

              </div>

            </div>

            <div className="self-center"><DeadlineCountdown sampleValues={{ days: 12, hours: 8, minutes: 30 }} title="Fall planning checkpoint" /></div>

          </div>

        </div>

      </section>



      <section className="editorial-section">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">University register</p><h2 className="mt-4 text-4xl sm:text-[42px]">Featured institutions</h2></div><Link to="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">View complete register <ArrowRight className="h-4 w-4" /></Link></div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">

          {featuredUniversities.map((uni, index) => (

            <Card key={uni.id} hoverable padding="p-0" className="group overflow-hidden">

              <Link to={`/explore/${uni.id}`} className="flex h-full flex-col">

                <div className="relative h-44 overflow-hidden"><img src={uni.image} alt="" width="720" height="480" loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.025]" /><span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] text-slate-600">Record {String(index + 1).padStart(2, '0')}</span></div>

                <div className="flex flex-1 flex-col p-6"><h3 className="text-lg font-semibold">{uni.name}</h3><div className="mt-auto flex items-center gap-2 pt-6 text-xs text-slate-500 dark:text-slate-400"><MapPin className="h-3.5 w-3.5" /> {uni.city}<span>·</span><Building2 className="h-3.5 w-3.5" /> {uni.sector}</div></div>

              </Link>

            </Card>

          ))}

        </div>

      </section>



      <section className="border-t border-slate-200 dark:border-slate-800">

        <div className="editorial-section text-center"><p className="section-kicker">Your next application entry</p><h2 className="mx-auto mt-5 max-w-2xl text-4xl leading-tight sm:text-5xl">Ready to plan your future?</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-slate-500 dark:text-slate-400">Start with the university register, then move through your aggregate and prediction records.</p><Button as={Link} to="/explore" size="lg" className="mt-8">Get started now <ArrowRight className="h-4 w-4" /></Button></div>

      </section>

    </div>

  );

}

