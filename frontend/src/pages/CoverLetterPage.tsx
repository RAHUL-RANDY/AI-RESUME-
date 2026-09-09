import React, { useState } from 'react';
import {
  Send,
  Mail,
  Copy,
  Check,
  Sparkles,
  Download,
  Briefcase,
  Layers,
  FileText,
  Clock,
  UserCheck,
  ChevronRight
} from 'lucide-react';

const LinkedInIcon = () => (
  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export const CoverLetterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'cold_outreach'>('cover_letter');

  // Form states
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [companyName, setCompanyName] = useState('Stripe');
  const [jobDescription, setJobDescription] = useState(
    'Looking for a Senior Backend Engineer to architect high-throughput payment infrastructure, build resilient Kafka microservices, and optimize PostgreSQL and Redis caching.'
  );
  const [keySkills, setKeySkills] = useState('Python, FastAPI, System Design, PostgreSQL, Redis, Kafka, AWS');
  const [experienceSummary, setExperienceSummary] = useState(
    '4+ years architecting microservices handling 25M daily transactions with 99.99% uptime.'
  );
  const [tone, setTone] = useState('confident_professional');

  // Cold outreach specific
  const [recipientName, setRecipientName] = useState('Sarah Jenkins');
  const [topAccomplishment, setTopAccomplishment] = useState(
    'Scaled a distributed event pipeline reducing p99 latency from 180ms to 24ms under 40k RPS'
  );
  const [portfolioUrl, setPortfolioUrl] = useState('https://github.com/rahul-eng');

  // Results
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState<any>(null);
  const [coldOutreachResult, setColdOutreachResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateCoverLetter = async () => {
    setIsLoading(true);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${API_BASE}/outreach/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          target_role: targetRole,
          company_name: companyName,
          job_description: jobDescription,
          key_skills: keySkills,
          experience_summary: experienceSummary,
          tone: tone
        })
      });
      const data = await res.json();
      setCoverLetterResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateColdOutreach = async () => {
    setIsLoading(true);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${API_BASE}/outreach/cold-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          recipient_name: recipientName,
          target_role: targetRole,
          company_name: companyName,
          top_accomplishment: topAccomplishment,
          portfolio_url: portfolioUrl
        })
      });
      const data = await res.json();
      setColdOutreachResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Response Outreach Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          AI Cover Letter & <span className="gradient-text">LinkedIn Outreach</span> Suite
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Generate tailored, high-converting cover letters and hyper-personalized recruiter cold emails & LinkedIn messages with 1-click.
        </p>

        {/* Tab Toggle */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl mt-6">
          <button
            onClick={() => setActiveTab('cover_letter')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'cover_letter'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Tailored Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('cold_outreach')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'cold_outreach'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Recruiter Cold Emails & DMs
          </button>
        </div>
      </div>

      {/* Tab 1: Cover Letter Generator */}
      {activeTab === 'cover_letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Input */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">Position & Experience Parameters</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Your Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Target Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              >
                <option value="confident_professional">Confident & High-Impact Professional</option>
                <option value="energetic_innovator">Passionate Product Innovator</option>
                <option value="executive">Executive & Engineering Leader</option>
                <option value="technical_deep_dive">Systems Architecture Focused</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Core Skills Highlighted</label>
              <input
                type="text"
                value={keySkills}
                onChange={(e) => setKeySkills(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Career Accomplishment / Track Record</label>
              <textarea
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 mt-1 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Job Description Context (Optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
                placeholder="Paste key responsibilities or requirements..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 mt-1 resize-none"
              />
            </div>

            <button
              onClick={generateCoverLetter}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Crafting Tailored Cover Letter...' : 'Generate AI Cover Letter'}
            </button>
          </div>

          {/* Result Output */}
          <div className="lg:col-span-7">
            {coverLetterResult ? (
              <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Subject Line:</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{coverLetterResult.subject_line}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(coverLetterResult.cover_letter, 'cl')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'cl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'cl' ? 'Copied!' : 'Copy Letter'}
                    </button>
                  </div>
                </div>

                {/* ATS Keywords matched */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">ATS Keywords Embedded:</span>
                  {coverLetterResult.ats_alignment_keywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                      ✓ {kw}
                    </span>
                  ))}
                </div>

                {/* Letter Body */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans select-all">
                  {coverLetterResult.cover_letter}
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  Approx. {coverLetterResult.word_count} words • Optimized for human recruiters & ATS filters
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
                  <FileText className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-white">Generate Your Tailored Cover Letter</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Fill in your target company, role, and key accomplishments on the left, then click <strong>Generate AI Cover Letter</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Recruiter Cold Outreach & LinkedIn DMs */}
      {activeTab === 'cold_outreach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Input */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">Recruiter Outreach Parameters</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Your Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Recipient Name / Title</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Sarah / Hiring Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Single Biggest Metric / Accomplishment</label>
              <textarea
                value={topAccomplishment}
                onChange={(e) => setTopAccomplishment(e.target.value)}
                rows={3}
                placeholder="e.g. Scaled event pipeline reducing latency by 45%..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 mt-1 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Portfolio / GitHub Link (Optional)</label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 mt-1"
              />
            </div>

            <button
              onClick={generateColdOutreach}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Generating Templates...' : 'Generate Cold Outreach Pack'}
            </button>
          </div>

          {/* Result Output */}
          <div className="lg:col-span-7 space-y-6">
            {coldOutreachResult ? (
              <div className="space-y-5">
                {/* Cold Email */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                      <Mail className="w-4 h-4" /> 1. Recruiter Cold Email
                    </div>
                    <button
                      onClick={() => handleCopy(coldOutreachResult.cold_email_body, 'email')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'email' ? 'Copied!' : 'Copy Email'}
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Subject: {coldOutreachResult.cold_email_subject}
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {coldOutreachResult.cold_email_body}
                  </div>
                </div>

                {/* LinkedIn DM */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                      <LinkedInIcon /> 2. Hiring Manager LinkedIn InMail / DM
                    </div>
                    <button
                      onClick={() => handleCopy(coldOutreachResult.linkedin_dm, 'dm')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'dm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'dm' ? 'Copied!' : 'Copy DM'}
                    </button>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {coldOutreachResult.linkedin_dm}
                  </div>
                </div>

                {/* Follow-up Email */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                      <Clock className="w-4 h-4" /> 3. Graceful Follow-up (Day 5)
                    </div>
                    <button
                      onClick={() => handleCopy(coldOutreachResult.follow_up_email, 'followup')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'followup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'followup' ? 'Copied!' : 'Copy Follow-up'}
                    </button>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {coldOutreachResult.follow_up_email}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400">
                  <Mail className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-white">Generate High-Converting Cold DMs</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Personalized outreach generates up to 4x higher recruiter reply rates. Enter your target company and top accomplishment to build your pack.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CoverLetterPage;
