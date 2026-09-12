import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Layers
} from 'lucide-react';
import { assessmentService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { TopicAssessment, AssessmentResultResponse } from '../types';

export const SkillAssessmentsPage: React.FC = () => {
  const { parsedResume } = useResumeAnalysis();

  const [topics, setTopics] = useState<TopicAssessment[]>([]);
  const [activeTopic, setActiveTopic] = useState<TopicAssessment | null>(null);
  const [quizData, setQuizData] = useState<{ topic_id: string; title: string; duration_minutes: number; questions: any[] } | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResultResponse | null>(null);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);

  const candidateName = parsedResume?.name || 'Alex Chen';

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const list = await assessmentService.getTopics();
      setTopics(list);
    } catch (e) {
      console.error('Failed to load assessment topics:', e);
    }
  };

  const startQuiz = async (t: TopicAssessment) => {
    setActiveTopic(t);
    setResult(null);
    setSelectedAnswers({});
    try {
      const quiz = await assessmentService.getQuiz(t.id);
      setQuizData(quiz);
      setTimeLeftSeconds(quiz.duration_minutes * 60);
    } catch (e) {
      console.error('Failed to load quiz:', e);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!quizData || result || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizData, result, timeLeftSeconds]);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (result) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!activeTopic) return;
    setIsSubmitting(true);
    try {
      const res = await assessmentService.submitAssessment(activeTopic.id, candidateName, selectedAnswers);
      setResult(res);
    } catch (err) {
      console.error('Assessment submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBadgeId = () => {
    if (!result?.verification_badge_id) return;
    navigator.clipboard.writeText(result.verification_badge_id);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-primary-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Award className="w-3.5 h-3.5" />
              Verified Skill Assessment Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              AI Timed Skill Assessment & Verified Badges
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Demonstrate domain proficiency with timed technical evaluations and earn cryptographically verified credentials for your resume.
            </p>
          </div>

          {quizData && !result && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-slate-400">Time Left:</span>
              <span className={`font-bold ${timeLeftSeconds < 120 ? 'text-rose-400' : 'text-white'}`}>
                {formatTime(timeLeftSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* State 1: Topic Catalog Selection (when no quiz active or after reset) */}
        {!quizData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <motion.div
                key={topic.id}
                whileHover={{ y: -3 }}
                className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{topic.badge_icon}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary-500/10 text-primary-300 border border-primary-500/20">
                      {topic.difficulty} Level
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{topic.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{topic.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {topic.duration_minutes} Mins
                    </span>
                    <span>•</span>
                    <span>{topic.questions_count} Questions</span>
                  </div>

                  <button
                    onClick={() => startQuiz(topic)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-primary-600/20"
                  >
                    Start Assessment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* State 2: Active Timed Quiz Mode */}
        {quizData && !result && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">{quizData.title} Assessment</h2>
              <span className="text-xs text-slate-400">
                Answered: {Object.keys(selectedAnswers).length} / {quizData.questions.length}
              </span>
            </div>

            <div className="space-y-6">
              {quizData.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-semibold text-white flex items-start gap-2">
                    <span className="text-primary-400 font-bold">{idx + 1}.</span>
                    <span>{q.question}</span>
                  </h4>

                  <div className="space-y-2 pt-1 pl-4">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-xl text-xs transition border flex items-center gap-3 ${
                            isSelected
                              ? 'bg-primary-500/15 border-primary-500/50 text-white font-medium shadow-md shadow-primary-500/10'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                              isSelected ? 'border-primary-400 bg-primary-500 text-white' : 'border-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setQuizData(null);
                  setActiveTopic(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Quit Assessment
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Grading Assessment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* State 3: Assessment Results & Verified Badge */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Certificate / Badge Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 rounded-3xl border border-emerald-500/30 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {result.passed ? 'Verified Passing Credential' : 'Assessment Completed'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{result.badge_title}</h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Issued to <strong>{result.candidate_name}</strong> • Scored {result.score_percentage}% ({result.correct_count}/{result.total_questions} correct) • Top {result.percentile_rank}th Percentile
                </p>
                <div className="pt-1 flex items-center gap-2 font-mono text-xs text-emerald-400">
                  <span>Badge ID: {result.verification_badge_id}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={copyBadgeId}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copiedBadge ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied ID!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Badge ID</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setResult(null);
                    setQuizData(null);
                    setActiveTopic(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  Take Another Assessment
                </button>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Solutions & Rationales
              </h3>

              <div className="space-y-4">
                {result.detailed_feedback.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      item.is_correct
                        ? 'bg-emerald-950/20 border-emerald-500/20'
                        : 'bg-rose-950/20 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">
                        {i + 1}. {item.question}
                      </span>
                      <span className={item.is_correct ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.is_correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                      <strong className="text-slate-300">Explanation: </strong>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SkillAssessmentsPage;
