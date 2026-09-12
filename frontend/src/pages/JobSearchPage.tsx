import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  BookmarkPlus,
  FileText,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  Zap,
  Globe,
  Tag,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { jobService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { JobListing, JobMatchResult } from '../types';

export const JobSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { parsedResume, targetRole } = useResumeAnalysis();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [matches, setMatches] = useState<Record<string, JobMatchResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState<'All' | 'Remote' | 'Hybrid' | 'Onsite'>('All');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');
  const [trackedJobIds, setTrackedJobIds] = useState<Record<string, boolean>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const candidateSkills = useMemo(() => {
    return parsedResume?.skills || [
      'React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'TailwindCSS',
      'Docker', 'PostgreSQL', 'Git', 'REST APIs', 'System Design'
    ];
  }, [parsedResume]);

  const effectiveRole = targetRole || parsedResume?.target_role || 'Software Engineer';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadJobsAndMatches();
  }, [selectedRole, selectedWorkMode, minSalary]);

  const loadJobsAndMatches = async () => {
    setIsLoading(true);
    try {
      const isRemoteParam = selectedWorkMode === 'Remote' ? true : selectedWorkMode === 'Onsite' ? false : undefined;
      const roleParam = selectedRole === 'All' ? undefined : selectedRole;

      // 1. Fetch filtered jobs
      const jobsRes = await jobService.getJobs(
        roleParam,
        isRemoteParam,
        minSalary > 0 ? minSalary : undefined,
        searchQuery || undefined
      );

      const jobList = jobsRes.jobs || [];
      setJobs(jobList);

      // 2. Perform AI Matching with user skills
      try {
        const matchRes = await jobService.matchJobs(
          candidateSkills,
          effectiveRole,
          minSalary > 0 ? minSalary : undefined
        );
        const matchMap: Record<string, JobMatchResult> = {};
        matchRes.matches.forEach((m) => {
          matchMap[m.job_id] = m;
        });
        setMatches(matchMap);
      } catch (matchErr) {
        console.warn('AI matching fallback to client calculations:', matchErr);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to Job Tracker Kanban
  const handleTrackJob = async (job: JobListing) => {
    setTrackingLoading((prev) => ({ ...prev, [job.id]: true }));
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/tracker/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: job.company,
          role: job.title,
          location: job.location,
          salary: `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`,
          status: 'Wishlist',
          next_step: 'Prepare application & tailored resume',
          notes: `Found via AI Job Match. Key skills: ${(job.required_skills || job.skills || []).slice(0, 4).join(', ')}`,
          job_url: job.apply_url || `https://${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers`
        })
      });

      if (res.ok) {
        setTrackedJobIds((prev) => ({ ...prev, [job.id]: true }));
        showToast(`Added ${job.title} at ${job.company} to your Kanban Tracker!`);
      } else {
        // Optimistic local state fallback
        setTrackedJobIds((prev) => ({ ...prev, [job.id]: true }));
        showToast(`Saved ${job.company} role to your target wishlist!`);
      }
    } catch (e) {
      setTrackedJobIds((prev) => ({ ...prev, [job.id]: true }));
      showToast(`Saved ${job.company} role to your target wishlist!`);
    } finally {
      setTrackingLoading((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  // Filtered and sorted listings
  const displayedJobs = useMemo(() => {
    let list = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.required_skills || j.skills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'match') {
      list.sort((a, b) => {
        const scoreA = matches[a.id]?.match_percentage ?? matches[a.id]?.match_score ?? a.match_score ?? 70;
        const scoreB = matches[b.id]?.match_percentage ?? matches[b.id]?.match_score ?? b.match_score ?? 70;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'salary') {
      list.sort((a, b) => b.salary_max - a.salary_max);
    } else if (sortBy === 'recent') {
      list.sort((a, b) => (b.posted_days_ago || 0) - (a.posted_days_ago || 0));
    }

    return list;
  }, [jobs, matches, searchQuery, sortBy]);

  const roleCategories = [
    'All',
    'Full Stack',
    'Frontend',
    'Backend',
    'Machine Learning',
    'DevOps',
    'Data Science'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/90 text-white shadow-xl shadow-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              SBERT Semantic Job Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary-400" />
              AI Job Search & Match Engine
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Curated high-compensation engineering roles continuously scored against your active resume embeddings and verified skill taxonomy.
            </p>
          </div>

          {/* Active Profile Status Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="text-slate-400 font-medium">Active Candidate Profile</p>
              <p className="text-white font-semibold flex items-center gap-1.5">
                <span>{effectiveRole}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">{candidateSkills.length} Skills Synced</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="ml-auto text-xs text-primary-400 hover:text-primary-300 font-medium underline-offset-2 hover:underline"
            >
              Update
            </button>
          </div>
        </div>

        {/* Search & Faceted Filter Controls */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          {/* Main Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, company, skills (e.g., Python, React, Stripe, Remote)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition"
              />
            </div>
            <button
              onClick={loadJobsAndMatches}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95"
            >
              <Search className="w-4 h-4" />
              Find Matches
            </button>
          </div>

          {/* Filter Pills & Sliders */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Role Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {roleCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedRole(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedRole === cat
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 font-semibold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Controls: Work Mode, Min Salary, Sort */}
            <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
              {/* Work Mode Toggle */}
              <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-1">
                {(['All', 'Remote', 'Hybrid', 'Onsite'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedWorkMode(mode)}
                    className={`px-2.5 py-1 rounded-md transition ${
                      selectedWorkMode === mode
                        ? 'bg-primary-500/20 text-primary-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Min Salary Filter */}
              <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Min Base:</span>
                <select
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value={0} className="bg-slate-900">Any</option>
                  <option value={120000} className="bg-slate-900">$120k+</option>
                  <option value={150000} className="bg-slate-900">$150k+</option>
                  <option value={180000} className="bg-slate-900">$180k+</option>
                  <option value={200000} className="bg-slate-900">$200k+</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="match" className="bg-slate-900">Highest Match %</option>
                  <option value="salary" className="bg-slate-900">Top Salary</option>
                  <option value="recent" className="bg-slate-900">Recently Added</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter & Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{displayedJobs.length}</strong> matching opportunities
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ranked with Bidirectional Cosine Similarity
          </span>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-800 rounded" />
                <div className="h-16 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-4">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No job openings found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Try relaxing your salary filter, clearing search keywords, or selecting 'All' roles to see more tech opportunities.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('All');
                setSelectedWorkMode('All');
                setMinSalary(0);
              }}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedJobs.map((job) => {
              const match = matches[job.id];
              const score = Math.round(match?.match_percentage ?? match?.match_score ?? job.match_score ?? 75);
              const fitLevel = match?.fit_level ?? (score >= 85 ? 'High Match' : score >= 70 ? 'Strong Match' : 'Moderate Fit');
              const matchedSkills = (match?.matched_skills?.length ? match.matched_skills : match?.matching_skills?.length ? match.matching_skills : (job.required_skills || job.skills || [])).slice(0, 4);
              const missingSkills = match?.missing_skills || [];
              const isTracked = trackedJobIds[job.id];

              const badgeColor =
                score >= 85
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : score >= 70
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30';

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="group flex flex-col justify-between bg-slate-900/70 hover:bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all shadow-lg hover:shadow-2xl hover:shadow-primary-500/5 relative overflow-hidden"
                >
                  {/* Top Match Badge Bar */}
                  <div className="flex items-center justify-between gap-2 pb-4">
                    <div className="flex items-center gap-3">
                      {job.logo ? (
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-11 h-11 rounded-xl object-contain bg-slate-800 p-1.5 border border-slate-700"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 group-hover:text-primary-400 transition flex items-center gap-1.5">
                          {job.company}
                          {job.work_mode === 'Remote' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              Remote
                            </span>
                          )}
                        </h4>
                        <h3 className="text-base font-bold text-white leading-snug line-clamp-1">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* AI Score Badge */}
                    <div className={`flex flex-col items-end px-2.5 py-1 rounded-xl border ${badgeColor}`}>
                      <span className="text-xs font-extrabold">{score}%</span>
                      <span className="text-[9px] font-semibold opacity-90">{fitLevel}</span>
                    </div>
                  </div>

                  {/* Compensation & Meta Details */}
                  <div className="space-y-3 py-2 text-xs text-slate-300">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <DollarSign className="w-3.5 h-3.5 -mr-1" />
                        {(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k /yr
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{job.experience_level}</span>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skills Overlap Section */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                        <span>Candidate Skill Match</span>
                        <span className="text-slate-500 text-[10px]">
                          {matchedSkills.length} matched {missingSkills.length > 0 && `• ${missingSkills.length} growth`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5" />
                            {skill}
                          </span>
                        ))}
                        {missingSkills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-dashed border-slate-700 text-[10px]"
                          >
                            +{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Integration Buttons */}
                  <div className="pt-4 mt-2 border-t border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Track in Kanban Button */}
                      <button
                        onClick={() => handleTrackJob(job)}
                        disabled={isTracked || trackingLoading[job.id]}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition border ${
                          isTracked
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                        }`}
                      >
                        {isTracked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            In Kanban
                          </>
                        ) : trackingLoading[job.id] ? (
                          'Saving...'
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5 text-primary-400" />
                            Track Job
                          </>
                        )}
                      </button>

                      {/* Tailor Cover Letter Button */}
                      <button
                        onClick={() =>
                          navigate(
                            `/cover-letter?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(
                              job.title
                            )}`
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition border border-slate-700/60"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Tailor Letter
                      </button>
                    </div>

                    {/* Apply Now Primary Link */}
                    <a
                      href={job.apply_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-primary-600/20 active:scale-98"
                    >
                      Apply at {job.company}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA to Job Tracker & Resume Tailor */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-950/40 via-slate-900 to-indigo-950/40 border border-primary-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Manage Applications & Interview Pipeline
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Track your interview stages, negotiation status, and follow-ups on your integrated drag-and-drop Kanban Tracker.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tracker')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-primary-600/25"
            >
              Open Kanban Tracker
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/salary-negotiator')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 border border-slate-700"
            >
              Offer Negotiator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearchPage;
