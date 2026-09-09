import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowUpDown,
  Download,
  CheckCircle,
  Loader2,
  Search,
  ExternalLink
} from 'lucide-react';
import { recruiterService } from '../services/api';
import { CandidateSummary } from '../types';

export const RecruiterPage: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState<string>(
    'Looking for a Senior Software Engineer with strong experience in Python, FastAPI, React, TypeScript, Docker, and PostgreSQL.'
  );
  const [targetRole, setTargetRole] = useState<string>('Senior Software Engineer');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof CandidateSummary>('match_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialCandidates = async () => {
      try {
        const data = await recruiterService.getCandidates();
        setCandidates(data);
      } catch (err) {
        console.error('Failed to load candidate leaderboard:', err);
      }
    };
    loadInitialCandidates();
  }, []);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const res = await recruiterService.bulkUpload(files, jobDescription, targetRole);
      setCandidates(res.candidates);
      setFiles([]);
    } catch (err) {
      console.error('Bulk upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSort = (field: keyof CandidateSummary) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredCandidates = candidates
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.top_skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'ATS Score', 'Match %', 'Employability %', 'Salary', 'Experience'];
    const rows = candidates.map((c) => [
      c.name,
      c.email,
      c.target_role,
      c.ats_score,
      c.match_score,
      c.employability_prob,
      c.predicted_salary,
      c.experience_years
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_rankings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            Recruiter Intelligence Studio
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Multi-Resume Ranking & Evaluation</h1>
          <p className="text-sm text-slate-400">
            Batch process candidate resumes, compute multi-model ranking, and export hiring intelligence.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-400" />
          Export Candidate CSV
        </button>
      </div>

      {/* Batch Upload Form Card */}
      <form onSubmit={handleBulkUpload} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          Batch Upload Resumes & Benchmark Against Target Job
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Select Multiple PDF/DOCX Resumes:</label>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelection}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer bg-slate-900 rounded-xl p-2 border border-slate-700"
            />
            {files.length > 0 && (
              <span className="text-xs text-emerald-400 font-semibold block mt-1">
                ✓ {files.length} resumes selected for processing
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Target Role:</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 block">Job Description & Benchmark Requirements:</label>
          <textarea
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={files.length === 0 || isUploading}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            files.length > 0 && !isUploading
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Batch Parsing & Ranking Resumes...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Process & Rank Candidates
            </>
          )}
        </button>
      </form>

      {/* Leaderboard Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Ranked Candidate Leaderboard</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {filteredCandidates.length} Candidates
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  Candidate <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('match_score')}>
                  Job Match % <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('ats_score')}>
                  ATS Score <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('employability_prob')}>
                  Employability <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('predicted_salary')}>
                  Predicted Salary <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-3">Experience</th>
                <th className="py-3 px-3">Top Verified Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No Candidates in Directory</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload candidate resumes using the form above to batch parse, evaluate, and rank applicants.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : idx === 1
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-white">
                    <div>{c.name}</div>
                    <div className="text-[11px] font-normal text-slate-500">{c.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-sky-400">{c.match_score.toFixed(1)}%</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-emerald-400">{c.ats_score.toFixed(1)}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-indigo-400">{c.employability_prob.toFixed(1)}%</span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-200">
                    ${c.predicted_salary.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {c.experience_years.toFixed(1)} yrs
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {c.top_skills.slice(0, 4).map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
