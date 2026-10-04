import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Terminal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  Search,
  Filter,
  Grid,
  X,
  Layers,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { codingService } from '../services/api';
import { CodingChallenge, CodeEvaluationResponse } from '../types';

export const CodingArenaPage: React.FC = () => {
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge | null>(null);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [code, setCode] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<CodeEvaluationResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState<boolean>(false);
  const [categoryStats, setCategoryStats] = useState<{
    total_problems: number;
    categories: { name: string; count: number }[];
    difficulties: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [challengesData, statsData] = await Promise.all([
        codingService.getChallenges(),
        codingService.getCategories().catch(() => null)
      ]);
      setChallenges(challengesData);
      setCategoryStats(statsData);
      if (challengesData.length > 0) {
        selectChallenge(challengesData[0], language);
      }
    } catch (err) {
      console.error('Failed to load coding challenges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectChallenge = (ch: CodingChallenge, lang: 'python' | 'javascript') => {
    setSelectedChallenge(ch);
    setCode(lang === 'python' ? ch.starter_code_python : ch.starter_code_javascript);
    setEvaluation(null);
  };

  const handleLanguageToggle = (lang: 'python' | 'javascript') => {
    setLanguage(lang);
    if (selectedChallenge) {
      setCode(lang === 'python' ? selectedChallenge.starter_code_python : selectedChallenge.starter_code_javascript);
    }
    setEvaluation(null);
  };

  const handleRunCode = async () => {
    if (!selectedChallenge) return;
    setIsEvaluating(true);
    try {
      const res = await codingService.evaluateCode(selectedChallenge.id, language, code);
      setEvaluation(res);
    } catch (e) {
      console.error('Code evaluation error:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    if (!selectedChallenge) return;
    setCode(language === 'python' ? selectedChallenge.starter_code_python : selectedChallenge.starter_code_javascript);
    setEvaluation(null);
  };

  const copySolution = () => {
    if (!evaluation?.optimal_reference_code) return;
    navigator.clipboard.writeText(evaluation.optimal_reference_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered Challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [challenges, selectedCategory, selectedDifficulty, searchQuery]);

  // Current problem index in active filtered list or all list
  const currentFilteredIndex = useMemo(() => {
    if (!selectedChallenge) return -1;
    return filteredChallenges.findIndex((c) => c.id === selectedChallenge.id);
  }, [filteredChallenges, selectedChallenge]);

  const handlePrevProblem = () => {
    if (filteredChallenges.length === 0) return;
    const prevIdx = currentFilteredIndex > 0 ? currentFilteredIndex - 1 : filteredChallenges.length - 1;
    selectChallenge(filteredChallenges[prevIdx], language);
  };

  const handleNextProblem = () => {
    if (filteredChallenges.length === 0) return;
    const nextIdx = currentFilteredIndex < filteredChallenges.length - 1 ? currentFilteredIndex + 1 : 0;
    selectChallenge(filteredChallenges[nextIdx], language);
  };

  const categoriesList = useMemo(() => {
    if (categoryStats?.categories) {
      return ['All', ...categoryStats.categories.map((c) => c.name)];
    }
    const set = new Set(challenges.map((c) => c.category));
    return ['All', ...Array.from(set)];
  }, [categoryStats, challenges]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient gradient glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-primary-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Code2 className="w-3.5 h-3.5" />
              Real-Time Algorithmic Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              Interactive AI Coding & DSA Arena
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold hidden sm:inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {challenges.length > 0 ? `${challenges.length}+ Problems` : '465+ Problems'}
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Authentic Blind 75, NeetCode 150, Striver's SDE Sheet & FAANG interview problems with live time/space complexity analysis.
            </p>
          </div>

          {/* Quick Metrics & Browse Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsBrowseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white transition flex items-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95"
            >
              <Grid className="w-4 h-4" />
              Browse All {challenges.length || 465} Problems
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                O(N) Complexity AI
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">18 Categories</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md space-y-3 shadow-lg">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 465+ DSA problems (e.g., Two Sum, Tree, DP, Graph, LRU)..."
                className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Difficulty Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    selectedDifficulty === diff
                      ? diff === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : diff === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : diff === 'Hard'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevProblem}
                title="Previous Problem"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 px-1 font-mono whitespace-nowrap">
                {currentFilteredIndex >= 0 ? `${currentFilteredIndex + 1} / ${filteredChallenges.length}` : '—'}
              </span>
              <button
                onClick={handleNextProblem}
                title="Next Problem"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Horizontal Scrolling Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-1 pr-1 flex items-center gap-1 whitespace-nowrap">
              <Layers className="w-3 h-3" /> Topic:
            </span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-primary-600/30 text-primary-300 border-primary-500/50 shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Selection Quick Strip (Showing filtered challenges) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {isLoading ? (
            <div className="text-xs text-slate-500 py-2">Loading 465+ problems...</div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-xs text-slate-500 py-2">No problems match your query or filters. Try clearing search.</div>
          ) : (
            filteredChallenges.slice(0, 50).map((ch) => {
              const isCurrent = selectedChallenge?.id === ch.id;
              const diffColor =
                ch.difficulty === 'Easy'
                  ? 'text-emerald-400 border-emerald-500/30'
                  : ch.difficulty === 'Medium'
                  ? 'text-amber-400 border-amber-500/30'
                  : 'text-rose-400 border-rose-500/30';

              return (
                <button
                  key={ch.id}
                  onClick={() => selectChallenge(ch, language)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                    isCurrent
                      ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-600/20'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{ch.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border ${diffColor} bg-slate-950/60`}>
                    {ch.difficulty}
                  </span>
                </button>
              );
            })
          )}
          {filteredChallenges.length > 50 && (
            <button
              onClick={() => setIsBrowseModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-primary-400 hover:text-primary-300 border border-primary-500/30 bg-primary-950/30 whitespace-nowrap transition flex items-center gap-1"
            >
              +{filteredChallenges.length - 50} more in Browse Drawer
            </button>
          )}
        </div>

        {/* Main 2-Column Split: Problem Description vs Code Editor & Test Runner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Problem Statement & Examples (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
            {selectedChallenge ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      selectedChallenge.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : selectedChallenge.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">
                    Category: <strong className="text-white">{selectedChallenge.category}</strong>
                  </span>
                  <span className="text-xs text-slate-400">Acceptance: {selectedChallenge.acceptance_rate}</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{selectedChallenge.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
                      {selectedChallenge.id}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{selectedChallenge.description}</p>
                </div>

                {/* Examples */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h4>
                  {selectedChallenge.examples.map((ex, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <p className="font-mono text-slate-300">
                        <strong className="text-slate-500">Input: </strong>
                        {ex.input}
                      </p>
                      <p className="font-mono text-emerald-400">
                        <strong className="text-slate-500">Output: </strong>
                        {ex.output}
                      </p>
                      {ex.explanation && (
                        <p className="text-slate-400 text-[11px] pt-1">
                          <strong>Explanation: </strong>
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 font-mono">
                    {selectedChallenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">Loading challenges...</div>
            )}
          </div>

          {/* Right Column: Code Editor & Execution Runner (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Editor Container */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
              {/* Editor Top Bar */}
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-semibold text-white">Code Editor</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Language Selector */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => handleLanguageToggle('python')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        language === 'python'
                          ? 'bg-primary-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Python 3
                    </button>
                    <button
                      onClick={() => handleLanguageToggle('javascript')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        language === 'javascript'
                          ? 'bg-primary-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      JavaScript
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={handleReset}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Area */}
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full p-4 bg-slate-950 text-emerald-300 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed selection:bg-primary-500/30"
                  placeholder="Write your algorithmic solution here..."
                />
              </div>

              {/* Run Action Bar */}
              <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Press Run to evaluate across all test cases with AI complexity scoring
                </span>
                <button
                  onClick={handleRunCode}
                  disabled={isEvaluating}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98"
                >
                  {isEvaluating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      Evaluating Code...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run & AI Review
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Case & AI Feedback Output Panel */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-5 shadow-xl"
              >
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    {evaluation.all_passed ? (
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {evaluation.all_passed ? 'All Test Cases Passed!' : 'Test Cases Incomplete'}
                        <span className="text-xs font-normal text-slate-400">
                          ({evaluation.passed_count}/{evaluation.total_count} Passed)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">Code Quality: {evaluation.code_quality_score}/100</p>
                    </div>
                  </div>

                  {/* Complexity Badges */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 font-mono">
                      Time: {evaluation.time_complexity}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-teal-400 font-mono">
                      Space: {evaluation.space_complexity}
                    </span>
                  </div>
                </div>

                {/* Test Results Pills */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Cases Breakdown</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {evaluation.test_results.map((tr) => (
                      <div
                        key={tr.test_case_index}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          tr.passed
                            ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Case {tr.test_case_index}</span>
                          <span>{tr.passed ? '✓ Passed' : '✗ Failed'}</span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-400 truncate">Input: {tr.input_str}</p>
                        <p className="font-mono text-[11px]">Expected: {tr.expected}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Review & Optimization Tips */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Algorithmic Feedback</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{evaluation.ai_feedback}</p>

                  <div className="pt-2 space-y-1">
                    <h6 className="text-[11px] font-bold text-slate-400 uppercase">Optimization Tips:</h6>
                    {evaluation.optimization_tips.map((tip, i) => (
                      <p key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="text-primary-400">•</span>
                        <span>{tip}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Reference Solution Dropdown */}
                {evaluation.optimal_reference_code && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">View Staff Engineer Reference Solution:</span>
                    <button
                      onClick={copySolution}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Optimal Solution
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Full Problem Directory Modal Drawer */}
      <AnimatePresence>
        {isBrowseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center border border-primary-500/30">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Master DSA Problem Bank
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {challenges.length} Curated Challenges
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Blind 75, NeetCode 150, Striver's SDE Sheet & FAANG high-frequency interview problems
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBrowseModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Filter Strip */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, ID, topic or keywords..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          selectedDifficulty === diff
                            ? 'bg-primary-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition border ${
                        selectedCategory === cat
                          ? 'bg-primary-600 text-white border-primary-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Problem Grid / List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
                <div className="text-xs text-slate-400 pb-1 flex justify-between">
                  <span>Showing {filteredChallenges.length} of {challenges.length} problems</span>
                  <span>Click any problem to practice in editor</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredChallenges.map((ch) => {
                    const isSelected = selectedChallenge?.id === ch.id;
                    const diffBadge =
                      ch.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : ch.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    return (
                      <div
                        key={ch.id}
                        onClick={() => {
                          selectChallenge(ch, language);
                          setIsBrowseModalOpen(false);
                        }}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-primary-950/40 border-primary-500 ring-1 ring-primary-500/50'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">{ch.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-mono text-slate-500">{ch.id}</span>
                            <span>•</span>
                            <span className="truncate">{ch.category}</span>
                            <span>•</span>
                            <span>{ch.acceptance_rate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${diffBadge}`}>
                            {ch.difficulty}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodingArenaPage;
