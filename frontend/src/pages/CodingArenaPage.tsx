import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Sparkles,
  Zap,
  Terminal,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  Layers,
  AlertTriangle
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
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await codingService.getChallenges();
      setChallenges(data);
      if (data.length > 0) {
        selectChallenge(data[0], language);
      }
    } catch (err) {
      console.error('Failed to load coding challenges:', err);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[300px] bg-primary-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Code2 className="w-3.5 h-3.5" />
              Real-Time Algorithmic Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              Interactive AI Coding & DSA Arena
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              In-browser LeetCode & FAANG DSA practice with instant time/space complexity analysis and AI code review.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg">
              <Zap className="w-3.5 h-3.5" />
              <span>O(N) Complexity Analyzer</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-medium">Python & JS</span>
          </div>
        </div>

        {/* Challenge Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {challenges.map((ch) => {
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
                <span>{ch.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${diffColor} bg-slate-950/60`}>
                  {ch.difficulty}
                </span>
              </button>
            );
          })}
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
                  <h3 className="text-base font-bold text-white">{selectedChallenge.title}</h3>
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
    </div>
  );
};

export default CodingArenaPage;
