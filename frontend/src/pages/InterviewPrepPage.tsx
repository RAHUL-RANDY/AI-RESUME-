import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle, ChevronDown, ChevronUp, BookOpen, Star, Sparkles } from 'lucide-react';
import { mentorService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { InterviewQuestion } from '../types';

export const InterviewPrepPage: React.FC = () => {
  const { parsedResume, targetRole } = useResumeAnalysis();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [candidateNotes, setCandidateNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const skills = parsedResume?.skills || ['Python', 'FastAPI', 'React', 'Docker', 'PostgreSQL'];
        const exp = parsedResume?.total_experience_years || 3.0;
        const projects = parsedResume?.projects?.map((p) => p.name) || ['Enterprise Distributed Microservices'];
        
        const res = await mentorService.getInterviewQuestions(targetRole, skills, exp, projects);
        setQuestions(res.questions);
        if (res.questions.length > 0) {
          setExpandedId(res.questions[0].id);
        }
      } catch (err) {
        console.error('Failed to load interview questions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [targetRole, parsedResume]);

  const categories = ['All', 'Technical', 'System Design', 'Behavioral', 'HR'];

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
          Interview Intelligence Studio
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Tailored Interview Questions for {targetRole}</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl mx-auto">
          Custom generated questions grounded in your technical background, target job specifications, and core engineering competencies.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          return (
            <motion.div
              key={q.id}
              className="glass-panel rounded-2xl border border-slate-800 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {q.category}
                    </span>
                    <span className="text-xs text-slate-500">{q.context}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white pt-1">{q.question}</h3>
                </div>
                <div className="text-slate-400 mt-1 flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                  {/* Evaluation Rubrics */}
                  <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" /> Key Evaluation Points (Hiring Rubric)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {q.key_evaluation_points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Answer Structure */}
                  <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-xs">
                    <h4 className="font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Suggested Strategy & Framework
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{q.suggested_structure}</p>
                  </div>

                  {/* Interactive Practice Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">
                      Draft Your Response & Practice Bullet Points:
                    </label>
                    <textarea
                      rows={3}
                      value={candidateNotes[q.id] || ''}
                      onChange={(e) => setCandidateNotes({ ...candidateNotes, [q.id]: e.target.value })}
                      placeholder="Outline your Situation, Task, Action, and Result (STAR) bullet points..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
