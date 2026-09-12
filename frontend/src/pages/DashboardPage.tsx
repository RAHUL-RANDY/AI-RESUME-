import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  Bot,
  Gift
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { SkillGapRadar } from '../components/SkillGapRadar';
import { FeatureImpactCard } from '../components/FeatureImpactCard';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';

export const DashboardPage: React.FC = () => {
  const {
    parsedResume,
    atsResult,
    matchResult,
    skillGap,
    employability,
    salary,
    courses,
    roadmap,
    targetRole,
    loadSampleProfile
  } = useResumeAnalysis();

  const [showAtsDetails, setShowAtsDetails] = useState<boolean>(false);

  // If no analysis is loaded, prompt user to upload resume or load sample profile
  if (!parsedResume && !atsResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Resume Analysis</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Upload your resume to calculate your dynamic ATS score, SBERT match, ML predictions, and personalized roadmap, or load a sample candidate profile.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/upload"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            Upload Resume Now
          </Link>
          <button
            onClick={loadSampleProfile}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            Load Interactive Sample Profile
          </button>
        </div>
      </div>
    );
  }

  // Composite Career Intelligence Score
  const atsScore = atsResult ? atsResult.overall_score : 80.0;
  const matchScore = matchResult ? matchResult.similarity_percentage : 75.0;
  const empScore = employability ? employability.employability_probability : 85.0;
  const compositeScore = Math.round(0.35 * atsScore + 0.35 * matchScore + 0.30 * empScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Candidate Header Profile Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              Active Candidate Analysis
            </span>
            <span className="text-xs text-slate-400">• {targetRole}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {parsedResume?.name || "Candidate Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {parsedResume?.email} • {parsedResume?.total_experience_years.toFixed(1)} Years Industry Experience
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/mentor"
            className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-600 text-white shadow transition-colors text-center"
          >
            <Bot className="w-4 h-4" />
            Consult AI Mentor
          </Link>
          <Link
            to="/upload"
            className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-center"
          >
            New Analysis
          </Link>
        </div>
      </div>

      {/* Primary KPI Score Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Composite Career Score */}
        <motion.div
          className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ScoreGauge
            score={compositeScore}
            label="Career Intelligence Score"
            sublabel="Composite Readiness Index"
            size={140}
          />
        </motion.div>

        {/* ATS Score */}
        <motion.div
          className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ScoreGauge
            score={atsScore}
            label="Dynamic ATS Score"
            sublabel="Strict 6-Factor Formula"
            size={140}
          />
          <button
            onClick={() => setShowAtsDetails(!showAtsDetails)}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 mt-1 cursor-pointer"
          >
            {showAtsDetails ? 'Hide Weights' : 'View Formula Breakdown'}
            {showAtsDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </motion.div>

        {/* SBERT Match Score */}
        <motion.div
          className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ScoreGauge
            score={matchScore}
            label="SBERT Semantic Match"
            sublabel="Dense Embedding Cosine"
            size={140}
          />
        </motion.div>

        {/* Employability ML Score */}
        <motion.div
          className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ScoreGauge
            score={empScore}
            label="ML Employability"
            sublabel="Random Forest Model"
            size={140}
          />
        </motion.div>
      </div>

      {/* Expandable ATS Weighting Accordion */}
      {showAtsDetails && atsResult && (
        <motion.div
          className="glass-panel rounded-2xl p-6 border border-sky-500/20 bg-sky-500/5 space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-400" />
            Dynamic ATS Scoring Weights & Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Keyword Match</div>
              <div className="text-lg font-bold text-white mt-0.5">{atsResult.breakdown.keyword_match}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight 25%</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Skills Match</div>
              <div className="text-lg font-bold text-white mt-0.5">{atsResult.breakdown.skills_match}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight 25%</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Experience</div>
              <div className="text-lg font-bold text-white mt-0.5">{atsResult.breakdown.experience_relevance}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight 20%</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Education</div>
              <div className="text-lg font-bold text-white mt-0.5">{atsResult.breakdown.education_match}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight 15%</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Structure</div>
              <div className="text-lg font-bold text-white mt-0.5">{atsResult.breakdown.structure_quality}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight 10%</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400">Formatting</div>
              <div className="text-lg font-bold text-white mt-0.5">{atsResult.breakdown.formatting_readability}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Weight 5%</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compensation & Risk Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salary Prediction Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> ML Salary Prediction
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                Random Forest Regressor (R² = 0.957)
              </span>
            </div>

            <div className="my-4">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                ${salary ? salary.predicted_salary.toLocaleString() : '145,000'}
              </span>
              <span className="text-sm font-semibold text-slate-400 ml-2">/ year (USD)</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 mb-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Range (95% CI)</span>
                <span className="text-slate-200 font-semibold">
                  ${salary ? salary.salary_min.toLocaleString() : '135,000'} – ${salary ? salary.salary_max.toLocaleString() : '160,000'}
                </span>
              </div>
            </div>
          </div>

          <FeatureImpactCard
            title="Why This Salary?"
            features={salary ? salary.top_contributing_features : []}
          />
        </div>

        {/* Employability & Risk Assessment Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Hiring Placement Probability
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                Random Forest (88.2% Accuracy, 0.96 ROC-AUC)
              </span>
            </div>

            <div className="my-4 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {employability ? employability.employability_probability : 88.5}%
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {employability?.confidence_level || 'High'} Confidence
              </span>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 mb-4">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">Risk Assessment</span>
              {employability?.risk_assessment || 'Low Risk: Candidate profile demonstrates strong technical foundation.'}
            </div>
          </div>

          <FeatureImpactCard
            title="Why This Employability Score?"
            features={employability ? employability.top_contributing_features : []}
          />
        </div>
      </div>

      {/* Skill Gap Analysis & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Spider Chart */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-sky-400" />
              Skill Architecture Radar
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Candidate proficiency benchmarked against target {targetRole} requirements across 6 axes.
            </p>
          </div>

          <SkillGapRadar data={skillGap ? skillGap.radar_data : []} />

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>Coverage Score: <strong className="text-white">{skillGap ? skillGap.coverage_score : 75}%</strong></span>
            <span>Skill Gap: <strong className="text-amber-400">{skillGap ? skillGap.gap_percentage : 25}%</strong></span>
          </div>
        </div>

        {/* Skill Inventory Breakdown */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Skill Taxonomy Inventory</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set-difference analysis against target job description requirements.
            </p>

            {/* Matching Skills */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-emerald-400 block mb-2">
                ✓ Matching Verified Skills ({skillGap?.matching_skills.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.matching_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-rose-400 block mb-2">
                ✗ Target Skill Gaps to Close ({skillGap?.missing_skills.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.missing_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Optional / Bonus Skills */}
            {skillGap?.optional_skills && skillGap.optional_skills.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-sky-400 block mb-2">
                  ★ Preferred Bonus Skills ({skillGap.optional_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.optional_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Bridge missing skills using the roadmap below</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Recommended Courses Carousel / Grid */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Content-Based Course Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Ranked educational courses directly targeted to bridge your missing competencies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 w-fit">
              {courses.length} Targeted Courses
            </span>
            <Link
              to="/courses"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/20 flex items-center gap-1 transition-colors"
            >
              <span>Browse All 55+ Courses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <span className="font-semibold text-slate-300 truncate">{course.provider}</span>
                    {course.is_free ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Gift className="w-2.5 h-2.5" />
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <DollarSign className="w-2.5 h-2.5" />
                        Paid
                      </span>
                    )}
                  </div>
                  <span className="text-amber-400 font-bold flex-shrink-0">★ {course.rating}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2 leading-snug">{course.title}</h4>
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.skills_covered.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{course.duration_hours} hrs • {course.level}</span>
                  {course.price_display && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      course.is_free
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-indigo-500/10 text-indigo-300'
                    }`}>
                      {course.price_display}
                    </span>
                  )}
                </div>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  Enroll <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Month-by-Month Career Roadmap Timeline */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              Month-by-Month Career Advancement Roadmap
            </h3>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {roadmap?.estimated_duration_months || 4} Month Trajectory
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dynamically scheduled milestones driven by your missing skill inventory for {targetRole}.
          </p>
        </div>

        <RoadmapTimeline
          milestones={roadmap ? roadmap.milestones : []}
          targetRole={targetRole}
        />
      </div>
    </div>
  );
};
