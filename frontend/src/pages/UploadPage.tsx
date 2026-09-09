import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import {
  resumeService,
  matchingService,
  predictionService,
  recommendationService,
  roadmapService
} from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';

const SAMPLE_JOB_DESCRIPTION = `Senior Full Stack Engineer
Responsibilities:
- Architect and develop scalable web applications and microservices using Python (FastAPI/Django) and modern React/TypeScript.
- Design relational database schemas and optimize query performance in PostgreSQL and Redis.
- Orchestrate containerized services with Docker and Kubernetes (K8s) on AWS or GCP.
- Implement automated CI/CD pipelines, unit testing, and telemetry monitoring.
- Collaborate with cross-functional product teams using Agile/Scrum.

Requirements:
- 3+ years of professional full stack engineering experience.
- Strong proficiency in Python, React, TypeScript, and SQL.
- Practical experience with Docker, Kubernetes, and Cloud Architecture (AWS/GCP).
- Deep understanding of REST APIs, caching strategies, and system design.
- Bachelor's degree in Computer Science, Software Engineering, or equivalent experience.`;

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAllAnalysisData } = useResumeAnalysis();

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg(null);
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExtensions.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMsg('Please select a valid PDF (.pdf) or Word document (.docx).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handlePasteSampleJD = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setTargetRole('Senior Full Stack Engineer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select or drag a resume file to upload.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Step 1: Upload and Parse Resume + ATS Score
      setStatusStep('Parsing resume text via PyMuPDF & spaCy NLP...');
      const uploadRes = await resumeService.upload(file, jobDescription, targetRole);
      const parsed = uploadRes.resume;
      const ats = uploadRes.ats_result;

      // Step 2: SBERT Semantic Matching
      setStatusStep('Computing SBERT dense semantic embeddings & cosine alignment...');
      const matchRes = await matchingService.analyze(
        parsed.raw_text,
        jobDescription || SAMPLE_JOB_DESCRIPTION,
        targetRole
      );

      // Step 3: Skill Gap Analysis
      setStatusStep('Normalizing skill taxonomy and calculating radar chart vectors...');
      const requiredSkills = matchRes.matched_keywords.concat(matchRes.missing_keywords);
      const skillGapRes = await matchingService.skillGap(
        parsed.skills,
        requiredSkills.length > 0 ? requiredSkills : ['Python', 'React', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL']
      );

      // Step 4: ML Employability Prediction
      setStatusStep('Running Random Forest Employability Classifier & SHAP Explainability...');
      const empFeatures = {
        programming_skills_count: parsed.technical_skills.length,
        ml_skills_count: parsed.skills.filter((s) => s.toLowerCase().includes('learning') || s.toLowerCase().includes('data')).length,
        sql_proficiency: parsed.skills.some((s) => s.toLowerCase().includes('sql')) ? 8 : 4,
        cloud_skills_count: parsed.skills.filter((s) => ['aws', 'docker', 'kubernetes', 'gcp'].includes(s.toLowerCase())).length,
        projects_count: parsed.projects.length,
        certifications_count: parsed.certifications.length,
        experience_years: parsed.total_experience_years,
        education_tier: 2,
        ats_score: ats ? ats.overall_score : 75.0,
        resume_match_score: matchRes.similarity_percentage
      };
      const empRes = await predictionService.predictEmployability(empFeatures);

      // Step 5: ML Salary Prediction
      setStatusStep('Running Random Forest Salary Regressor & Confidence Interval estimation...');
      const salFeatures = {
        experience_years: parsed.total_experience_years,
        education_tier: 2,
        skills_count: parsed.skills.length,
        job_role: targetRole,
        location_tier: 1,
        certifications_count: parsed.certifications.length,
        projects_count: parsed.projects.length,
        technical_expertise_score: 7.5
      };
      const salRes = await predictionService.predictSalary(salFeatures);

      // Step 6: Course Recommendations
      setStatusStep('Querying content-based course recommender against missing skills...');
      const coursesRes = await recommendationService.getCourses(
        skillGapRes.missing_skills.length > 0 ? skillGapRes.missing_skills : ['Kubernetes', 'AWS'],
        targetRole
      );

      // Step 7: Dynamic Career Roadmap
      setStatusStep('Generating customized month-by-month career roadmap...');
      const roadmapRes = await roadmapService.generate(
        targetRole,
        skillGapRes.missing_skills,
        parsed.total_experience_years
      );

      // Store in Global State
      setAllAnalysisData({
        parsedResume: parsed,
        atsResult: ats,
        matchResult: matchRes,
        skillGap: skillGapRes,
        employability: empRes,
        salary: salRes,
        courses: coursesRes.recommended_courses,
        roadmap: roadmapRes,
        targetRole: targetRole,
        jobDescription: jobDescription || SAMPLE_JOB_DESCRIPTION
      });

      setStatusStep('Complete! Directing to Career Intelligence Hub...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMsg(err?.response?.data?.detail || err.message || 'An error occurred during resume analysis.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Upload & Analyze Your Resume</h1>
        <p className="text-sm text-slate-400 mt-2">
          Run end-to-end NLP extraction, weighted ATS evaluation, SBERT matching, and trained ML predictions.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
              : file
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
          }`}
        >
          <input
            type="file"
            id="resume-file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center">
            {file ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">{file.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold mt-2 underline">
                  Click or drag to replace file
                </span>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center mb-3 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Drag & drop your resume here</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PDF (.pdf) or Word (.docx) • Max 10 MB
                </p>
                <div className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Browse Local Files
                </div>
              </>
            )}
          </div>
        </div>

        {/* Target Role Selector */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Target Career Role
            </label>
            <span className="text-[11px] text-slate-500">Used for salary modeling & skill benchmarking</span>
          </div>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="Full Stack Engineer">Full Stack Engineer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Cloud Architect">Cloud Architect</option>
            <option value="Software Engineer">Software Engineer</option>
          </select>
        </div>

        {/* Target Job Description */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> Target Job Description (Optional but Recommended)
            </label>
            <button
              type="button"
              onClick={handlePasteSampleJD}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Paste Sample Job Description
            </button>
          </div>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job requirements, responsibilities, and qualifications here to compute real ATS scores, SBERT semantic match, and skill gaps..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
        </div>

        {/* Submit Button & Progress Indicator */}
        <div>
          {isProcessing ? (
            <div className="glass-panel rounded-xl p-5 border border-sky-500/30 bg-sky-500/5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sky-400 text-sm font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Multi-Stage Intelligence Pipeline</span>
              </div>
              <p className="text-xs text-slate-300 font-mono animate-pulse">{statusStep}</p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!file}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                file
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Execute Real AI & ML Career Analysis
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
