import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Award,
  ExternalLink,
  Star,
  GitFork,
  CheckCircle2,
  TrendingUp,
  Cpu,
  BarChart3,
  Layers,
  Search,
  Check
} from 'lucide-react';

const GitHubIcon = () => (
  <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export const DeveloperProfilePage: React.FC = () => {
  const [githubUsername, setGithubUsername] = useState('torvalds');
  const [leetcodeUsername, setLeetcodeUsername] = useState('neal_wu');

  const [githubLoading, setGithubLoading] = useState(false);
  const [leetcodeLoading, setLeetcodeLoading] = useState(false);

  const [githubData, setGithubData] = useState<any>(null);
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyzeGitHub = async () => {
    if (!githubUsername.trim()) return;
    setGithubLoading(true);
    setErrorMsg(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${API_BASE}/developer/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: githubUsername })
      });
      if (!res.ok) throw new Error('Could not fetch GitHub data');
      const data = await res.json();
      setGithubData(data);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error analyzing GitHub profile');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleAnalyzeLeetCode = async () => {
    if (!leetcodeUsername.trim()) return;
    setLeetcodeLoading(true);
    setErrorMsg(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${API_BASE}/developer/leetcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: leetcodeUsername })
      });
      if (!res.ok) throw new Error('Could not fetch LeetCode data');
      const data = await res.json();
      setLeetcodeData(data);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error analyzing LeetCode profile');
    } finally {
      setLeetcodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>Proof-of-Work Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Developer Profile <span className="gradient-text">Intelligence</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Analyze public GitHub repositories and LeetCode algorithmic problem solving to compute your Verified Engineering Index for top recruiters.
        </p>
      </div>

      {/* Two Column Analyzer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GitHub Column */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <GitHubIcon />
              <span>GitHub Code Intelligence</span>
            </div>
            <p className="text-xs text-slate-400">
              Scans public repositories, stargazers, forks, and language density.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">@</span>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="github username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <button
                onClick={handleAnalyzeGitHub}
                disabled={githubLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                {githubLoading ? 'Auditing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* GitHub Results */}
          {githubData && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <img
                  src={githubData.avatar_url}
                  alt={githubData.username}
                  className="w-14 h-14 rounded-2xl border border-slate-700 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white truncate">{githubData.name || githubData.username}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {githubData.badge}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">@{githubData.username}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Eng. Index</div>
                  <div className="text-xl font-black text-emerald-400">{githubData.engineering_score}</div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-base font-bold text-white">{githubData.public_repos}</div>
                  <div className="text-[10px] text-slate-400">Repositories</div>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-base font-bold text-amber-400">{githubData.total_stars}</div>
                  <div className="text-[10px] text-slate-400">Total Stars</div>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-base font-bold text-sky-400">{githubData.followers}</div>
                  <div className="text-[10px] text-slate-400">Followers</div>
                </div>
              </div>

              {/* Languages Bar */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Top Languages Analyzed
                </div>
                <div className="space-y-1.5">
                  {githubData.top_languages?.map((lang: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-slate-300 font-medium">{lang.name}</span>
                        <span className="text-sky-400 font-mono">{lang.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repositories Highlights */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Featured Repositories
                </div>
                <div className="space-y-2">
                  {githubData.repo_highlights?.map((repo: any, i: number) => (
                    <a
                      key={i}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/50 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-white group-hover:text-sky-400 flex items-center gap-1.5">
                          {repo.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {repo.language}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {repo.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {repo.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.forks}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LeetCode Column */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Code2 className="w-5 h-5 text-amber-400" />
              <span>LeetCode DSA Benchmark</span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates algorithm problem completion, difficulty mix, and FAANG readiness.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">@</span>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  placeholder="leetcode username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <button
                onClick={handleAnalyzeLeetCode}
                disabled={leetcodeLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                {leetcodeLoading ? 'Auditing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* LeetCode Results */}
          {leetcodeData && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Candidate Handle:</div>
                  <div className="text-base font-bold text-white mt-0.5">@{leetcodeData.username}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">DSA Readiness</div>
                  <div className="text-xl font-black text-amber-400">{leetcodeData.dsa_readiness_score}%</div>
                </div>
              </div>

              {/* Solved breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-base font-black text-white">{leetcodeData.total_solved}</div>
                  <div className="text-[10px] text-slate-400">Total Solved</div>
                </div>
                <div className="bg-emerald-950/20 rounded-xl p-2.5 border border-emerald-500/20">
                  <div className="text-base font-black text-emerald-400">{leetcodeData.easy_solved}</div>
                  <div className="text-[10px] text-emerald-300/80">Easy</div>
                </div>
                <div className="bg-amber-950/20 rounded-xl p-2.5 border border-amber-500/20">
                  <div className="text-base font-black text-amber-400">{leetcodeData.medium_solved}</div>
                  <div className="text-[10px] text-amber-300/80">Medium</div>
                </div>
                <div className="bg-rose-950/20 rounded-xl p-2.5 border border-rose-500/20">
                  <div className="text-base font-black text-rose-400">{leetcodeData.hard_solved}</div>
                  <div className="text-[10px] text-rose-300/80">Hard</div>
                </div>
              </div>

              {/* Acceptance rate & Global rank */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Global Ranking: </span>
                  <strong className="text-white">#{leetcodeData.ranking?.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Acceptance Rate: </span>
                  <strong className="text-emerald-400">{leetcodeData.acceptance_rate}</strong>
                </div>
              </div>

              {/* Recommendation card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Algorithm Strategy Coaching
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {leetcodeData.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DeveloperProfilePage;
