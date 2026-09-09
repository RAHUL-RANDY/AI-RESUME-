import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  Filter,
  GraduationCap,
  Clock,
  Star,
  Gift,
  DollarSign,
  Briefcase,
  Layers,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { recommendationService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { CourseItem } from '../types';

export const CoursesPage: React.FC = () => {
  const { skillGap, targetRole } = useResumeAnalysis();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [freeCount, setFreeCount] = useState<number>(0);
  const [paidCount, setPaidCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'all' | 'gaps'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await recommendationService.getAllCourses();
      setCourses(res.recommended_courses || []);
      setFreeCount(res.free_count || (res.recommended_courses || []).filter(c => c.is_free).length);
      setPaidCount(res.paid_count || (res.recommended_courses || []).filter(c => !c.is_free).length);
      if (res.categories && res.categories.length > 0) {
        setCategories(['All', ...res.categories]);
      }
      if (res.roles && res.roles.length > 0) {
        setRoles(['All Roles', ...res.roles]);
      }
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const missingSkillsLower = new Set(
    (skillGap?.missing_skills || []).map((s) => s.toLowerCase().trim())
  );

  // Filtering
  const filteredCourses = courses.filter((c) => {
    // 1. Gaps view filter
    if (activeView === 'gaps') {
      const matchesAnyGap = c.skills_covered.some((skill) =>
        missingSkillsLower.has(skill.toLowerCase().trim())
      );
      if (!matchesAnyGap) return false;
    }

    // 2. Pricing filter (Free vs Paid)
    if (pricingFilter === 'free' && !c.is_free) {
      return false;
    }
    if (pricingFilter === 'paid' && c.is_free) {
      return false;
    }

    // 3. Target Job Role filter
    if (selectedRole !== 'All Roles' && c.target_role !== selectedRole) {
      return false;
    }

    // 4. Category filter
    if (selectedCategory !== 'All' && c.category !== selectedCategory) {
      return false;
    }

    // 5. Level filter
    if (selectedLevel !== 'All' && c.level.toLowerCase() !== selectedLevel.toLowerCase()) {
      return false;
    }

    // 6. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchProvider = c.provider.toLowerCase().includes(q);
      const matchRole = (c.target_role || '').toLowerCase().includes(q);
      const matchSkills = c.skills_covered.some((s) => s.toLowerCase().includes(q));
      const matchCategory = (c.category || '').toLowerCase().includes(q);
      return matchTitle || matchProvider || matchRole || matchSkills || matchCategory;
    }

    return true;
  });

  // Calculate dynamic free vs paid in current filtered subset
  const currentFreeCount = filteredCourses.filter(c => c.is_free).length;
  const currentPaidCount = filteredCourses.filter(c => !c.is_free).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-8 sm:p-10 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <GraduationCap className="w-4 h-4" />
            Job-Targeted Tech Education & Upskilling
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Targeted Tech Courses: Free & Paid Curriculum
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Curated library of 70+ accredited courses across Frontend, Backend, Full Stack, AI/ML, Cloud/DevOps,
            Data Engineering, Cybersecurity, and System Design — with clear Free vs Paid pricing.
          </p>

          {/* Quick profile role shortcut */}
          {targetRole && (
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Target Role from your Profile:</span>
              <button
                onClick={() => {
                  // Find best matching role in list
                  const match = roles.find(r => r.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(r.toLowerCase()));
                  if (match) {
                    setSelectedRole(match);
                  } else {
                    setSearchQuery(targetRole);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-semibold hover:bg-sky-500/20 transition-all cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                Filter for {targetRole}
              </button>
            </div>
          )}

          {skillGap && skillGap.missing_skills.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800 w-fit">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Identified Skill Gaps:</span>
              {skillGap.missing_skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls: Search, View Mode & Filters */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* View Toggle & Pricing Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveView('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveView('gaps')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'gaps'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Matched for My Gaps
              </button>
            </div>

            {/* Pricing Filter Pills */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setPricingFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  pricingFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setPricingFilter('free')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  pricingFilter === 'free'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-emerald-300" />
                <span>100% Free ({freeCount})</span>
              </button>
              <button
                onClick={() => setPricingFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  pricingFilter === 'paid'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-purple-300" />
                <span>Paid ({paidCount})</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Python, AWS, Docker, React, Role..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Target Job Role Filter Pills */}
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Filter by Target Job Role
            </span>
            <span className="text-xs text-slate-500">
              {filteredCourses.length} courses match criteria
            </span>
          </div>

          <div className="flex gap-2 pt-1 overflow-x-auto no-scrollbar pb-1.5 sm:flex-wrap">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  selectedRole === role
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Briefcase className={`w-3 h-3 ${selectedRole === role ? 'text-white' : 'text-slate-500'}`} />
                <span>{role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Domain Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter by Technical Domain
            </span>
          </div>

          <div className="flex gap-2 pt-1 overflow-x-auto no-scrollbar pb-1.5 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filters & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-slate-500" /> Difficulty:
            </span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-slate-800 text-sky-400 font-bold border border-sky-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {(selectedRole !== 'All Roles' || selectedCategory !== 'All' || selectedLevel !== 'All' || pricingFilter !== 'all' || searchQuery.trim() !== '' || activeView !== 'all') && (
            <button
              onClick={() => {
                setSelectedRole('All Roles');
                setSelectedCategory('All');
                setSelectedLevel('All');
                setPricingFilter('all');
                setSearchQuery('');
                setActiveView('all');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Curating job-targeted courses & certifications...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 max-w-md mx-auto space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No courses match your filter</h3>
          <p className="text-xs text-slate-400">
            Try resetting your search query or switching to 'All Job Roles' or 'All Types'.
          </p>
          <button
            onClick={() => {
              setSelectedRole('All Roles');
              setSelectedCategory('All');
              setSelectedLevel('All');
              setPricingFilter('all');
              setSearchQuery('');
              setActiveView('all');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isGapMatch = course.skills_covered.some((skill) =>
              missingSkillsLower.has(skill.toLowerCase().trim())
            );

            return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between group hover:shadow-xl ${
                  isGapMatch
                    ? 'border-amber-500/40 bg-gradient-to-b from-slate-900/90 to-amber-950/10 shadow-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/70'
                }`}
              >
                <div>
                  {/* Top Bar: Provider, Pricing Badge & Rating */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                    <div className="flex items-center gap-2 truncate max-w-[210px]">
                      <span className="font-semibold text-slate-300 truncate">
                        {course.provider}
                      </span>
                      {course.is_free ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                          <Gift className="w-2.5 h-2.5" />
                          {course.price_display || 'Free'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex-shrink-0">
                          <DollarSign className="w-2.5 h-2.5" />
                          {course.price_display || 'Paid'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-sky-300 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Target Role & Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {course.target_role && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/25 flex items-center gap-1">
                        <Briefcase className="w-2.5 h-2.5 text-sky-400" />
                        {course.target_role}
                      </span>
                    )}
                    {course.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20">
                        {course.category}
                      </span>
                    )}
                    {isGapMatch && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Bridges Skill Gap
                      </span>
                    )}
                  </div>

                  {/* Skills Covered Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.skills_covered.map((skill, idx) => {
                      const isGap = missingSkillsLower.has(skill.toLowerCase().trim());
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded-md border ${
                            isGap
                              ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Metadata & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {course.duration_hours}h
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-300">
                      {course.level}
                    </span>
                  </div>

                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                  >
                    <span>Enroll</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
