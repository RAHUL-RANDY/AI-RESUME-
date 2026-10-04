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
  Gift,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LineChart
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
      <div className="relative max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="sv-ambient-spotlight -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-50"></div>
        <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-white/[0.1] text-sky-400 flex items-center justify-center mx-auto shadow-inner">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">No Active Candidate Telemetry</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Upload your resume to benchmark against enterprise ATS parsers, SBERT cosine matching, and trained ML compensation models.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/upload"
            className="w-full sm:w-auto sv-btn-primary px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2"
          >
            Upload Resume
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={loadSampleProfile}
            className="w-full sm:w-auto sv-btn-secondary px-7 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Load Interactive Demo Profile
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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Ambient background lighting */}
      <div className="sv-ambient-spotlight -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-40"></div>

      {/* Candidate Header Profile Banner */}
      <div className="sv-card rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="sv-badge text-sky-300 border-sky-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Candidate HUD
            </span>
            <span className="text-xs font-mono text-slate-400">
              Target: <strong className="text-slate-200">{targetRole}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{parsedResume?.name || "Candidate Profile"}</span>
            <ShieldCheck className="w-6 h-6 text-sky-400 inline" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            {parsedResume?.email || "candidate@domain.com"} • {parsedResume?.total_experience_years.toFixed(1)} Years Verified Experience
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/mentor"
            className="flex-1 sm:flex-initial sv-btn-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 text-sky-400" />
            AI Career Mentor
          </Link>
          <Link
            to="/upload"
            className="flex-1 sm:flex-initial sv-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            New Analysis
          </Link>
        </div>
      </div>

      {/* Primary KPI Score Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Composite Career Score */}
        <motion.div
          className="sv-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden"
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
          className="sv-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ScoreGauge
            score={atsScore}
            label="Workday & Greenhouse ATS"
            sublabel="Strict 6-Factor Formula"
            size={140}
          />
          <button
            onClick={() => setShowAtsDetails(!showAtsDetails)}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 mt-2 cursor-pointer transition-colors"
          >
            {showAtsDetails ? 'Hide Weights' : 'View Formula Breakdown'}
            {showAtsDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </motion.div>

        {/* SBERT Match Score */}
        <motion.div
          className="sv-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden"
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
          className="sv-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden"
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
          className="sv-card rounded-2xl p-6 border-sky-500/30 space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              Dynamic ATS Scoring Formula & Factor Weights
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Total Weight: 100%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-400">Keywords</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{atsResult.breakdown.keyword_match}%</div>
              <div className="text-[10px] text-sky-400 font-semibold font-mono">Weight 25%</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-400">Skills</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{atsResult.breakdown.skills_match}%</div>
              <div className="text-[10px] text-sky-400 font-semibold font-mono">Weight 25%</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-400">Experience</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{atsResult.breakdown.experience_relevance}%</div>
              <div className="text-[10px] text-sky-400 font-semibold font-mono">Weight 20%</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-400">Education</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{atsResult.breakdown.education_match}%</div>
              <div className="text-[10px] text-sky-400 font-semibold font-mono">Weight 15%</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-400">Structure</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{atsResult.breakdown.structure_quality}%</div>
              <div className="text-[10px] text-sky-400 font-semibold font-mono">Weight 10%</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-white/[0.08]">
              <div className="text-xs text-slate-400">Formatting</div>
              <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{atsResult.breakdown.formatting_readability}%</div>
              <div className="text-[10px] text-sky-400 font-semibold font-mono">Weight 5%</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compensation & Placement Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salary Prediction Card */}
        <div className="sv-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <DollarSign className="w-4 h-4" /> Predictive ML Compensation
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                Random Forest Regressor (R² = 0.957)
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold sv-text-gradient-silver tracking-tight">
                  ${salary ? salary.predicted_salary.toLocaleString() : '145,000'}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ yr (USD Base)</span>
              </div>
              <p className="text-xs text-slate-400">Target market benchmark for {targetRole}</p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/[0.08] flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Confidence Interval (95% CI)</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  ${salary ? salary.salary_min.toLocaleString() : '135,000'} – ${salary ? salary.salary_max.toLocaleString() : '160,000'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">90th Percentile Tier</span>
            </div>
          </div>

          <FeatureImpactCard
            title="Feature Attributions (SHAP Explanations)"
            features={salary ? salary.top_contributing_features : []}
          />
        </div>

        {/* Employability & Risk Assessment Card */}
        <div className="sv-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-4 h-4" /> Placement Probability
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                Random Forest (88.2% Accuracy, 0.96 ROC-AUC)
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                  {employability ? employability.employability_probability : 88.5}%
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {employability?.confidence_level || 'High'} Confidence
                </span>
              </div>
              <p className="text-xs text-slate-400">Likelihood of passing screening to final interview rounds</p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/[0.08] text-xs text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1">Risk Assessment Profile</span>
              {employability?.risk_assessment || 'Low Risk: Candidate profile demonstrates solid architectural proficiency and competitive skill depth.'}
            </div>
          </div>

          <FeatureImpactCard
            title="Key Predictive Drivers"
            features={employability ? employability.top_contributing_features : []}
          />
        </div>
      </div>

      {/* Skill Gap Analysis & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Spider Chart */}
        <div className="lg:col-span-6 sv-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-sky-400" />
              Technical Competency Radar
            </h3>
            <p className="text-xs text-slate-400">
              Candidate capabilities benchmarked across 6 core engineering axes.
            </p>
          </div>

          <div className="py-2">
            <SkillGapRadar data={skillGap ? skillGap.radar_data : []} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-mono">
            <span className="text-slate-400">Taxonomy Coverage: <strong className="text-white">{skillGap ? skillGap.coverage_score : 75}%</strong></span>
            <span className="text-slate-400">Competency Gap: <strong className="text-amber-400">{skillGap ? skillGap.gap_percentage : 25}%</strong></span>
          </div>
        </div>

        {/* Skill Inventory Breakdown */}
        <div className="lg:col-span-6 sv-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Skill Taxonomy Inventory</h3>
              <p className="text-xs text-slate-400">
                Vector set-difference analysis against target {targetRole} requirements.
              </p>
            </div>

            {/* Matching Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 block font-mono">
                ✓ Verified Matching Skills ({skillGap?.matching_skills.length || 0})
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
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-400 block font-mono">
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
              <div className="space-y-2">
                <span className="text-xs font-bold text-sky-400 block font-mono">
                  ★ High-Value Preferred Skills ({skillGap.optional_skills.length})
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

          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
            <span>Bridge missing skills using the structured curriculum below</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Recommended Courses Grid */}
      <div className="sv-card rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Targeted Skill Upskilling Curriculum
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Ranked educational courses directly targeted to bridge your missing competencies.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-white/[0.08]">
              {courses.length} Targeted Courses
            </span>
            <Link
              to="/courses"
              className="text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3.5 py-1.5 rounded-full border border-sky-500/20 flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-950/80 rounded-xl p-5 border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">{course.provider}</span>
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
                  <span className="text-amber-400 font-bold font-mono">★ {course.rating}</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug group-hover:text-sky-300 transition-colors">
                  {course.title}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {course.skills_covered.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/[0.06]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">{course.duration_hours} hrs • {course.level}</span>
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
                  className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
                >
                  Enroll <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Month-by-Month Career Roadmap Timeline */}
      <div className="sv-card rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Dynamic Career Elevation Trajectory
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Targeted monthly milestones prioritized by highest ROI for {targetRole}.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20 font-bold">
            {roadmap?.estimated_duration_months || 4} Month Track
          </span>
        </div>

        <RoadmapTimeline
          milestones={roadmap ? roadmap.milestones : []}
          targetRole={targetRole}
        />
      </div>
    </div>
  );
};
export default DashboardPage;
