import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Sparkles,
  Download,
  Copy,
  Check,
  Eye,
  Laptop,
  Smartphone,
  Palette,
  ExternalLink,
  Code,
  UserCheck,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { portfolioService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { PortfolioGenerateResponse } from '../types';

export const PortfolioBuilderPage: React.FC = () => {
  const { parsedResume, targetRole } = useResumeAnalysis();

  const [name, setName] = useState(parsedResume?.name || 'Alex Chen');
  const [title, setTitle] = useState(targetRole || parsedResume?.target_role || 'Senior Full Stack & Cloud Architect');
  const [summary, setSummary] = useState(
    parsedResume?.summary ||
    'Full-stack engineer specializing in scalable cloud architectures, high-performance distributed microservices, and modern web application suites.'
  );
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [email, setEmail] = useState(parsedResume?.email || 'alex.chen.dev@example.com');
  const [githubUrl, setGithubUrl] = useState(parsedResume?.github || 'https://github.com');
  const [linkedinUrl, setLinkedinUrl] = useState(parsedResume?.linkedin || 'https://linkedin.com');
  const [skills, setSkills] = useState<string[]>(
    parsedResume?.skills || ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'Docker', 'PostgreSQL', 'AWS']
  );
  const [theme, setTheme] = useState<'obsidian_dark' | 'cyber_matrix' | 'solar_minimal' | 'executive_navy'>('obsidian_dark');

  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioGenerateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    handleGenerate();
  }, [theme]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await portfolioService.generatePortfolio({
        name,
        title,
        summary,
        email,
        location,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        skills,
        theme,
      });
      setPortfolioData(res);
    } catch (err) {
      console.error('Failed to generate portfolio:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHtml = () => {
    if (!portfolioData) return;
    const blob = new Blob([portfolioData.html_bundle], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolioData.portfolio_slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyHtml = () => {
    if (!portfolioData) return;
    navigator.clipboard.writeText(portfolioData.html_bundle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-primary-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-3.5 h-3.5" />
              1-Click Developer Portfolio Generator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              AI Developer Portfolio Generator
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Instantly transform your verified resume & engineering skills into a standalone, modern portfolio website ready to deploy or download.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyHtml}
              disabled={!portfolioData}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={downloadHtml}
              disabled={!portfolioData}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-primary-600/25 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Controls vs Live Interactive Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customization Controls (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-primary-400" />
              Portfolio Themes
            </h3>

            {/* Theme Selector */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'obsidian_dark', name: 'Obsidian Dark', color: 'bg-slate-900 border-sky-500/40 text-sky-300' },
                { id: 'cyber_matrix', name: 'Cyber Matrix', color: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' },
                { id: 'solar_minimal', name: 'Solar Minimal', color: 'bg-slate-100 border-slate-300 text-slate-900' },
                { id: 'executive_navy', name: 'Executive Navy', color: 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                    theme === t.id
                      ? `${t.color} ring-2 ring-primary-500 shadow-md`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Details Form */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Details</h3>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Headline / Role Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Executive Bio / Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">GitHub Link</label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">LinkedIn Link</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Regenerating Portfolio...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Update Live Preview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Responsive Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {/* Viewport bar */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Interactive Sandbox</span>
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                    previewDevice === 'desktop'
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                    previewDevice === 'mobile'
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile (390px)
                </button>
              </div>
            </div>

            {/* Iframe Viewport Container */}
            <div
              className={`mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-[400px] border-4 border-slate-700' : 'w-full'
              }`}
            >
              <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2">{portfolioData?.portfolio_slug || 'portfolio'}.html</span>
                </span>
                <span className="text-emerald-400">100% Validated HTML5</span>
              </div>

              {portfolioData?.html_bundle ? (
                <iframe
                  srcDoc={portfolioData.html_bundle}
                  title="Portfolio Live Preview"
                  className="w-full h-[640px] border-0 bg-slate-950"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="h-[640px] flex items-center justify-center text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Compiling portfolio bundle...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBuilderPage;
