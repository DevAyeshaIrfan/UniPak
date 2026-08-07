import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Building2, BookOpen, GraduationCap, Clock, Calendar, Banknote, Bed, FileText, Award, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useUniversity, useUniversityPrograms, useUniversityFaculties, useUniversityFees, useUniversityHostels, useUniversityRankings } from '../hooks/useUniversities';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import GradientText from '../components/ui/GradientText';
import ProgramCard from '../components/shared/ProgramCard';
import { campusInfo, getCampusMapUrl, universityImages, cn } from '../lib/utils';
import EmptyState from '../components/ui/EmptyState';
import MeritTrendChart from '../components/ui/MeritTrendChart';

export default function UniversityDetailPage() {
  const { universityId } = useParams();
  
  const { data: uniData, isLoading: uniLoading } = useUniversity(universityId);
  const { data: programsData, isLoading: programsLoading } = useUniversityPrograms(universityId);
  const { data: facultiesData, isLoading: facultiesLoading } = useUniversityFaculties(universityId);
  const { data: feesData, isLoading: feesLoading } = useUniversityFees(universityId);
  const { data: hostelsData, isLoading: hostelsLoading } = useUniversityHostels(universityId);
  const { data: rankingsData, isLoading: rankingsLoading } = useUniversityRankings(universityId);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const university = Array.isArray(uniData) ? uniData[0] : uniData?.data ? (Array.isArray(uniData.data) ? uniData.data[0] : uniData.data) : uniData;
  const programs = Array.isArray(programsData) ? programsData : programsData?.data || [];
  const faculties = Array.isArray(facultiesData) ? facultiesData : facultiesData?.data || [];
  const fees = Array.isArray(feesData) ? feesData : feesData?.data || [];
  const hostels = Array.isArray(hostelsData) ? hostelsData : hostelsData?.data || [];
  const rankings = Array.isArray(rankingsData) ? rankingsData : rankingsData?.data || [];
  const campus = campusInfo[Number(universityId)];
  const campusMapUrl = getCampusMapUrl(Number(universityId));

  const individualFaculties = useMemo(() => {
    const unique = new Map();
    faculties.forEach((faculty) => {
      faculty.FacultyName?.split(/\s*\/\s*/).forEach((name) => {
        const trimmedName = name.trim();
        if (trimmedName && !unique.has(trimmedName)) unique.set(trimmedName, faculty);
      });
    });
    return [...unique.entries()].map(([name, faculty]) => ({ ...faculty, displayName: name }));
  }, [faculties]);

  const categories = useMemo(() => {
    const cats = new Set(programs.map(p => p.MajorCategory).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    if (selectedCategory === 'All') return programs;
    return programs.filter(p => p.MajorCategory === selectedCategory);
  }, [programs, selectedCategory]);

  const meritTrend = useMemo(() => {
    const grouped = new Map();
    rankings.forEach((rank) => {
      const value = Number(rank.ClosingMeritPercent);
      if (!Number.isFinite(value)) return;
      const name = rank.ProgramNameSource || 'Program merit';
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name).push({ year: String(rank.AdmissionYear), value });
    });
    const selected = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length)[0];
    return selected ? { name: selected[0], data: selected[1].sort((a, b) => Number(a.year) - Number(b.year)).slice(-5) } : null;
  }, [rankings]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    const s = status.toLowerCase();
    if (s.includes('yes') || s.includes('available')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (s.includes('no') || s.includes('unavailable')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (s.includes('limited')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  const uniImage = universityImages[universityId] || '/images/default_uni.jpg';

  if (uniLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
        <Skeleton className="w-full h-64 md:h-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center">
        <EmptyState title="University not found" description="The university you are looking for does not exist." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-80 pt-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={uniImage} 
            alt={university?.UniversityName} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/30" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
          <Link to="/explore" className="inline-flex items-center text-slate-300 hover:text-white mb-4 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Universities
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {university?.UniversityName}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <div className="flex items-center text-slate-200">
              <MapPin className="w-4 h-4 mr-1.5" />
              {university?.CityName || 'N/A'}
            </div>
            <div className="flex items-center text-slate-200">
              <Building2 className="w-4 h-4 mr-1.5" />
              {university?.Sector || 'N/A'} Sector
            </div>
            <div className="flex items-center text-slate-200">
              <BookOpen className="w-4 h-4 mr-1.5" />
              {programs.length} Programs
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 flex overflow-x-auto pb-2 scrollbar-hide">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="fees">Fees Structure</TabsTrigger>
            <TabsTrigger value="hostels">Hostels</TabsTrigger>
            <TabsTrigger value="rankings">Merit Cutoffs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About</h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {university?.Description || `${university?.UniversityName} is a prominent institution located in ${university?.CityName}. It offers a wide range of academic programs across various disciplines and aims to provide quality education to its students.`}
                  </p>
                </section>
                
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Schools, Faculties & Admission Info</h2>
                  {facultiesLoading ? (
                    <Skeleton className="h-40 w-full rounded-xl" />
                  ) : individualFaculties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {individualFaculties.map((fac) => (
                        <Card key={fac.displayName} className="p-5">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{fac.displayName}</h3>
                          {fac.ApplicationMethod && (
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                              <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                              Admission method: <span className="font-medium ml-1 text-slate-900 dark:text-slate-200">{fac.ApplicationMethod}</span>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No faculty information available.</p>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Quick Facts
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100 dark:border-indigo-800/50">
                      <span className="text-slate-600 dark:text-slate-400">Campus Area</span>
                      <span className="font-medium text-right text-slate-900 dark:text-slate-200">{campus?.area || 'Location not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100 dark:border-indigo-800/50">
                      <span className="text-slate-600 dark:text-slate-400">Accreditation</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">{university?.Accreditation || 'HEC Recognized'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600 dark:text-slate-400">Total Programs</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">{programs.length}</span>
                    </div>
                    {campusMapUrl && (
                      <a href={campusMapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                        <MapPin className="w-4 h-4" /> View exact campus on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6 animate-in fade-in duration-500">
            {programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : programs.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                        selectedCategory === cat 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">
                  {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''} found
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrograms.map((prog, idx) => (
                    <ProgramCard key={prog.ProgramID || idx} program={prog} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No programs found" description="No program data is available for this university at the moment." />
            )}
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="animate-in fade-in duration-500">
            {feesLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : fees.length > 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Faculty / Department</th>
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Duration</th>
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Semesters</th>
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Semester Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {fees.map((fee, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{fee.FacultyName}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{fee.Duration || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{fee.Semesters || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-semibold">
                            {fee.SemesterFee || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="No fee details" description="Fee structure is not available for this university." />
            )}
          </TabsContent>

          {/* Hostels Tab */}
          <TabsContent value="hostels" className="animate-in fade-in duration-500">
            {hostelsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : hostels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostels.map((hostel, idx) => (
                  <Card key={idx} className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{hostel.FacultyName}</h3>
                      <Badge className={cn("px-2.5 py-1 text-xs font-medium rounded-full", getStatusColor(hostel.HostelStatus))}>
                        {hostel.HostelStatus || 'Unknown'}
                      </Badge>
                    </div>
                    {hostel.HostelNote && (
                      <div className="mt-auto pt-4 flex items-start text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <Bed className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400 mt-0.5" />
                        <p>{hostel.HostelNote}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="No hostel details" description="Hostel availability information is not recorded for this university." />
            )}
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="rankings" className="animate-in fade-in duration-500">
            {rankingsLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : rankings.length > 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm border border-slate-300 dark:border-slate-800 overflow-hidden max-w-4xl mx-auto">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Historical Merit Cutoffs
                  </h3>
                </div>
                {meritTrend?.data?.length > 1 && (
                  <div className="border-b border-slate-300 p-6 dark:border-slate-800">
                    <div className="mb-2 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-500">3–5 year program trace</p><h4 className="mt-1 font-semibold">{meritTrend.name}</h4></div><span className="font-mono text-xs text-slate-500">Closing merit %</span></div>
                    <MeritTrendChart data={meritTrend.data} height={240} />
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Program</th>
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Year</th>
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Closing Merit</th>
                        <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {rankings.map((rank, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">{rank.ProgramNameSource}</td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{rank.AdmissionYear}</td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{rank.ClosingMeritPercent != null ? `${rank.ClosingMeritPercent}%` : 'Not published'}</td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{rank.MeritStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="No ranking data" description="Historical statistics and rankings are not available yet." />
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
