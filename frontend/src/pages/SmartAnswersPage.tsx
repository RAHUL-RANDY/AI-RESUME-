import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileQuestion,
  Sparkles,
  Copy,
  Check,
  Building2,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Send,
  Zap,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { smartAnswersService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { ApplicationQuestion, AnswerGenerateResponse } from '../types';

export const SmartAnswersPage: React.FC = () => {
  const { parsedResume, targetRole } = useResumeAnalysis();

  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('why-company');
  const [companyName, setCompanyName] = useState<string>('Stripe');
  const [role, setRole] = useState<string>(targetRole || parsedResume?.target_role || 'Senior Software Engineer');
  const [tone, setTone] = useState<'confident_professional' | 'executive_leader' | 'innovative_visionary'>('confident_professional');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [answerData, setAnswerData] = useState<AnswerGenerateResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const qList = await smartAnswersService.getQuestions();
      setQuestions(qList);
      if (qList.length > 0) {
        setSelectedQuestionId(qList[0].id);
      }
    } catch (e) {
      console.error('Failed to load application questions:', e);
    }
  };

  useEffect(() => {
    if (selectedQuestionId) {
      handleGenerate();
    }
  }, [selectedQuestionId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await smartAnswersService.generateAnswer({
        question_id: selectedQuestionId,
        company_name: companyName,
        target_role: role,
        skills: parsedResume?.skills || ['React', 'TypeScript', 'Python', 'FastAPI', 'AWS'],
        years_experience: parsedResume?.total_experience_years || 4,
        candidate_name: parsedResume?.name || 'Candidate',
        tone,
      });
      setAnswerData(res);
    } catch (err) {
      console.error('Failed to generate tailored answer:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!answerData) return;
    navigator.clipboard.writeText(answerData.tailored_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeQuestion = questions.find((q) => q.id === selectedQuestionId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[300px] bg-primary-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <FileQuestion className="w-3.5 h-3.5" />
              Application Intelligence Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              AI Smart Job Application Answers Generator
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Generate tailored, high-converting responses to high-stakes job portal questions (Greenhouse, Lever, Workday) using your verified resume background.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Greenhouse & Lever Ready
            </span>
          </div>
        </div>

        {/* Question Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestionId(q.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                selectedQuestionId === q.id
                  ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-600/25'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{q.category}</span>
            </button>
          ))}
        </div>

        {/* 2-Column Split: Target Parameters vs Generated Answer & Coaching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Inputs & Question Details (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-primary-400" />
                Target Company & Role
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, Datadog"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Target Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Tone & Executive Style</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-primary-500"
                >
                  <option value="confident_professional">Confident & Professional</option>
                  <option value="executive_leader">Executive Technical Leader</option>
                  <option value="innovative_visionary">Product & AI Innovator</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Custom Answer...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Tailored Answer
                  </>
                )}
              </button>
            </div>

            {/* Recruiter Evaluation Intent */}
            {activeQuestion && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Why Recruiters Ask This</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{activeQuestion.intent}</p>

                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Key Factors Evaluated:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                    {activeQuestion.key_evaluation_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Tailored Answer & Coaching Deliverables (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Active Question Title Card */}
            {activeQuestion && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">
                  Target Application Prompt
                </span>
                <h2 className="text-base font-bold text-white">{activeQuestion.question_text}</h2>
              </div>
            )}

            {/* Answer Display Card */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Ready-To-Paste Application Answer
                </h4>
                <button
                  onClick={copyToClipboard}
                  disabled={!answerData}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Answer</span>
                    </>
                  )}
                </button>
              </div>

              {answerData ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans shadow-inner">
                  {answerData.tailored_answer}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Generating answer...
                </div>
              )}

              {/* Talking Points */}
              {answerData && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Phone Screen Talking Points
                  </h5>
                  <div className="space-y-1.5">
                    {answerData.bullet_talking_points.map((pt, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Green Flags vs Red Flags */}
              {answerData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Recruiter Green Flags
                    </span>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                      {answerData.recruiter_green_flags.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Critical Red Flags to Avoid
                    </span>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                      {answerData.red_flags_to_avoid.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAnswersPage;
