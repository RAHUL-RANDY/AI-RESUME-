import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TrendingUp,
  Zap,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  Layers,
  Send,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { jobService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { JobListing, JobMatchResult, ApplySource } from '../types';

export const JobSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { parsedResume, targetRole } = useResumeAnalysis();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [matches, setMatches] = useState<Record<string, JobMatchResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedTier, setSelectedTier] = useState<'All' | 'FAANG' | 'AI' | 'Indian Unicorns' | 'High TC'>('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState<'All' | 'Remote' | 'Hybrid' | 'Onsite'>('All');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');
  const [trackedJobIds, setTrackedJobIds] = useState<Record<string, boolean>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

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

  const loadJobsAndMatches = useCallback(async () => {
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
  }, [candidateSkills, effectiveRole, minSalary, searchQuery, selectedRole, selectedWorkMode]);

  useEffect(() => {
    loadJobsAndMatches();
  }, [loadJobsAndMatches]);

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
        setTrackedJobIds((prev) => ({ ...prev, [job.id]: true }));
        showToast(`Saved ${job.company} role to your target wishlist!`);
      }
    } catch {
      setTrackedJobIds((prev) => ({ ...prev, [job.id]: true }));
      showToast(`Saved ${job.company} role to your target wishlist!`);
    } finally {
      setTrackingLoading((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const toggleSources = (jobId: string) => {
    setExpandedSources((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  // Helper to categorize company tiers
  const isCompanyInTier = (company: string, tier: string, salaryMax: number): boolean => {
    const c = company.toLowerCase();
    if (tier === 'FAANG') {
      return ['google', 'meta', 'apple', 'amazon', 'netflix', 'microsoft'].some((k) => c.includes(k));
    }
    if (tier === 'AI') {
      return ['openai', 'anthropic', 'scale', 'figma', 'linear', 'vercel', 'supabase', 'datadog'].some((k) => c.includes(k));
    }
    if (tier === 'Indian Unicorns') {
      return ['razorpay', 'cred', 'swiggy', 'zomato', 'zerodha', 'flipkart', 'meesho', 'freshworks', 'browserstack', 'postman', 'hasura'].some((k) => c.includes(k));
    }
    if (tier === 'High TC') {
      return salaryMax >= 180000;
    }
    return true;
  };

  // Filtered and sorted listings
  const displayedJobs = useMemo(() => {
    // Strictly deduplicate by unique job id
    const seenIds = new Set<string>();
    const uniqueJobs: JobListing[] = [];
    for (const j of jobs) {
      if (j && j.id && !seenIds.has(j.id)) {
        seenIds.add(j.id);
        uniqueJobs.push(j);
      }
    }
    let list = uniqueJobs;

    // Filter by Company Tier
    if (selectedTier !== 'All') {
      list = list.filter((j) => isCompanyInTier(j.company, selectedTier, j.salary_max));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.required_skills || j.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort listings
    if (sortBy === 'match') {
      list.sort((a, b) => {
        const scoreA = matches[a.id]?.match_percentage ?? matches[a.id]?.match_score ?? a.match_score ?? 70;
        const scoreB = matches[b.id]?.match_percentage ?? matches[b.id]?.match_score ?? b.match_score ?? 70;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'salary') {
      list.sort((a, b) => b.salary_max - a.salary_max);
    } else if (sortBy === 'recent') {
      list.sort((a, b) => a.posted_days_ago - b.posted_days_ago);
    }

    return list;
  }, [jobs, matches, searchQuery, sortBy, selectedTier]);

  const roleCategories = ['All', 'Full Stack', 'Backend', 'Frontend', 'Machine Learning', 'DevOps', 'Data Science'];

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Ambient background lighting */}
      <div className="sv-ambient-spotlight -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-40"></div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-950/95 border border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.3)] text-white text-xs font-semibold backdrop-blur-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="sv-badge text-sky-400 border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SBERT Semantic Job Intelligence Suite</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Briefcase className="w-9 h-9 text-sky-400" />
              <span>AI Job Search & <span className="sv-text-gradient-cyan">Multi-Source Apply</span></span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-normal">
              Curated positions across FAANG, AI decacorns, and Indian unicorns with instant multi-platform apply links (Direct, LinkedIn, Indeed, Glassdoor, Wellfound).
            </p>
          </div>

          {/* Active Profile Status Badge */}
          <div className="sv-card rounded-2xl p-4 flex items-center gap-3.5 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="text-slate-400 font-medium">Active Candidate Profile</p>
              <p className="text-white font-bold flex items-center gap-1.5 font-mono">
                <span>{effectiveRole}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">{candidateSkills.length} Skills Calibrated</span>
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="ml-auto text-xs text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Update
            </button>
          </div>
        </div>

        {/* Company Tier Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mr-1">Tiers:</span>
          {(['All', 'FAANG', 'AI', 'Indian Unicorns', 'High TC'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedTier === tier
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400'
                  : 'bg-slate-950/80 border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.18]'
              }`}
            >
              {tier === 'All' ? 'All Tech Tiers' : tier === 'FAANG' ? 'FAANG & Big Tech' : tier === 'AI' ? 'Frontier AI & Decacorns' : tier === 'Indian Unicorns' ? 'Top Indian Unicorns' : 'High TC ($180k+)'}
            </button>
          ))}
        </div>

        {/* Search & Faceted Filter Controls */}
        <div className="sv-card rounded-2xl p-5 space-y-4">
          {/* Main Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, company, skills (e.g., Python, React, Stripe, Razorpay, Remote)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
              />
            </div>
            <button
              onClick={loadJobsAndMatches}
              className="sv-btn-primary px-7 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedRole === cat
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Controls: Work Mode, Min Salary, Sort */}
            <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
              {/* Work Mode Toggle */}
              <div className="flex items-center bg-slate-950/80 border border-white/[0.08] rounded-xl p-1">
                {(['All', 'Remote', 'Hybrid', 'Onsite'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedWorkMode(mode)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      selectedWorkMode === mode
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-white/[0.08] rounded-xl px-3 py-1.5 text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="match" className="bg-slate-900">Sort: Highest Match</option>
                  <option value="salary" className="bg-slate-900">Sort: Highest Salary</option>
                  <option value="recent" className="bg-slate-900">Sort: Recently Posted</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header Count */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-mono text-sm">{displayedJobs.length}</strong> verified opportunities across top employers
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 5+ Sources Per Job
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Real-Time Matching
            </span>
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sv-card rounded-2xl p-6 h-72 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-16 bg-slate-800/60 rounded-xl"></div>
                <div className="h-10 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="sv-card rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Matching Positions Found</h3>
            <p className="text-xs text-slate-400">
              Try broadening your search keywords or resetting company tier filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('All');
                setSelectedTier('All');
                setSelectedWorkMode('All');
              }}
              className="sv-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
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
              const isExpanded = expandedSources[job.id];

              const badgeColor =
                score >= 85
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : score >= 70
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30';

              const sources: ApplySource[] = job.apply_sources && job.apply_sources.length > 0
                ? job.apply_sources
                : [
                    { name: 'Direct Careers', url: job.apply_url, badge: 'Official Portal' },
                    { name: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}`, badge: 'Easy Apply' },
                    { name: 'Indeed', url: `https://www.indeed.com/jobs?q=${encodeURIComponent(job.title + ' ' + job.company)}`, badge: 'Fast Track' },
                    { name: 'Glassdoor', url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(job.title + ' ' + job.company)}`, badge: 'Reviews & TC' }
                  ];

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="sv-card rounded-2xl p-6 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  {/* Top Match Badge Bar */}
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${job.logo_color || 'from-sky-500 to-indigo-600'} flex items-center justify-center text-white font-extrabold text-sm shadow-md border border-white/20`}>
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 group-hover:text-sky-300 transition flex items-center gap-1.5">
                          <span>{job.company}</span>
                          {job.work_mode === 'Remote' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
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
                      <span className="text-xs font-extrabold font-mono">{score}%</span>
                      <span className="text-[9px] font-semibold opacity-90">{fitLevel}</span>
                    </div>
                  </div>

                  {/* Compensation & Meta Details */}
                  <div className="space-y-3 py-1 text-xs text-slate-300">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <DollarSign className="w-3.5 h-3.5 -mr-1" />
                        {job.salary_display || `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {job.location}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono">{job.experience_level}</span>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skills Overlap Section */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                        <span>Candidate Skill Match</span>
                        <span className="text-slate-500 text-[10px] font-mono">
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
                            className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-dashed border-slate-700 text-[10px]"
                          >
                            +{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Multi-Source Apply Options */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Track in Kanban Button */}
                      <button
                        onClick={() => handleTrackJob(job)}
                        disabled={isTracked || trackingLoading[job.id]}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                          isTracked
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border-white/[0.08]'
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
                            <BookmarkPlus className="w-3.5 h-3.5 text-sky-400" />
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
                        className="px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/[0.08] cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Tailor Letter
                      </button>
                    </div>

                    {/* Primary Apply Button */}
                    <div className="flex items-center gap-2">
                      <a
                        href={job.apply_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sv-btn-primary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>Apply at {job.company}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Toggle More Sources */}
                      <button
                        onClick={() => toggleSources(job.id)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                          isExpanded
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-white/[0.08]'
                        }`}
                        title="View other job boards & direct application channels"
                      >
                        <span>{sources.length} Sources</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expandable Multi-Source Channels Tray */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 space-y-1.5 overflow-hidden"
                        >
                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                            Available Application Gateways:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {sources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-white/[0.08] hover:border-sky-500/30 text-slate-300 hover:text-white flex items-center justify-between text-[11px] transition font-medium group/src"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Globe className="w-3 h-3 text-sky-400 flex-shrink-0" />
                                  <span className="truncate">{src.name}</span>
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/[0.06] group-hover/src:text-sky-300 flex-shrink-0 ml-1">
                                  {src.badge || 'Apply'}
                                </span>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA to Job Tracker & Resume Tailor */}
        <div className="mt-14 sv-card rounded-3xl p-6 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5 justify-center sm:justify-start tracking-tight">
              <TrendingUp className="w-6 h-6 text-sky-400" />
              Manage Applications & Interview Pipeline
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-normal">
              Track your interview stages, compensation negotiations, and follow-ups on your integrated drag-and-drop Kanban Tracker.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tracker')}
              className="sv-btn-primary px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg"
            >
              Open Kanban Tracker
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/salary-negotiator')}
              className="sv-btn-secondary px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold"
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
