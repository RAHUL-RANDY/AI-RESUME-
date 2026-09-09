import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Loader2, ArrowRight, Wand2, Copy, Check, Cpu, X } from 'lucide-react';
import { mentorService } from '../services/api';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { ChatMessage, LLMStatusResponse, BulletRewriteResponse } from '../types';

export const MentorPage: React.FC = () => {
  const { parsedResume, targetRole, skillGap } = useResumeAnalysis();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: parsedResume?.name
        ? `Hello ${parsedResume.name.split(' ')[0]}! I am your AI Career Intelligence Mentor. I have reviewed your background as a **${targetRole || 'Software Engineer'}** with **${parsedResume.total_experience_years || 2.0} years of experience**. How can I help you accelerate your career goals today?`
        : `Hello! I am your AI Career Intelligence Mentor. How can I help you accelerate your career goals today? You can ask me anything about technical architecture, system design, resume ATS optimization, or interview prep!`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [followups, setFollowups] = useState<string[]>([
    `How do I architect production systems with ${skillGap?.missing_skills[0] || 'Distributed Systems'}?`,
    `How do I highlight my achievements in ${targetRole} technical interviews?`,
    'Can you critique my resume bullet points?'
  ]);

  // LLM Status & OpenAI Bullet Rewriter
  const [llmStatus, setLlmStatus] = useState<LLMStatusResponse | null>(null);
  const [showRewriter, setShowRewriter] = useState<boolean>(false);
  const [bulletInput, setBulletInput] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewrittenBullets, setRewrittenBullets] = useState<BulletRewriteResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    mentorService.getStatus().then(setLlmStatus).catch(() => null);
  }, []);

  const handleRewrite = async () => {
    if (!bulletInput.trim() || isRewriting) return;
    setIsRewriting(true);
    try {
      const res = await mentorService.rewriteBullet(
        bulletInput,
        targetRole,
        parsedResume?.skills || skillGap?.matching_skills
      );
      setRewrittenBullets(res);
    } catch (e) {
      console.error('Bullet rewrite error:', e);
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await mentorService.chat(
        updatedMessages,
        parsedResume || undefined,
        targetRole,
        skillGap?.missing_skills
      );

      setMessages([...updatedMessages, { role: 'assistant', content: res.reply }]);
      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setFollowups(res.suggested_followups);
      }
    } catch (err) {
      console.error('Mentor chat error:', err);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'I encountered an issue processing your query. Please verify your connection or try asking another question.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Mentor Header */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AI Career Mentor
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Online
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Grounded in {parsedResume?.name || 'Candidate'} Profile • Target: {targetRole}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {llmStatus?.openai_configured ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm" title="Connected to OpenAI GPT-4o API">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">OpenAI ({llmStatus.model})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20" title="Using built-in NLP semantic engine. Set OPENAI_API_KEY in .env to switch to GPT-4o">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium">NLP Context Engine</span>
            </div>
          )}

          <button
            onClick={() => setShowRewriter(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-colors cursor-pointer shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Bullet Rewriter</span>
            <span className="sm:hidden">Rewriter</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 glass-panel rounded-2xl p-4 border border-slate-800 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-sky-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>AI Mentor is thinking and evaluating career context...</span>
          </div>
        )}
      </div>

      {/* Suggested Followups */}
      {followups.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-2 my-3">
          {followups.map((tip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(tip)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{tip}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your AI Career Mentor anything about roles, skills, or negotiations..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl flex items-center justify-center transition-all ${
            input.trim() && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* AI Bullet Rewriter Modal */}
      <AnimatePresence>
        {showRewriter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-panel border border-slate-700 bg-slate-900/95 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowRewriter(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    AI Resume Bullet Enhancer
                    {llmStatus?.openai_configured ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        OpenAI GPT-4o
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                        NLP Heuristic
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transform plain resume bullets into high-impact Google XYZ / STAR statements with metrics.
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-slate-300">
                  Paste your raw resume bullet point:
                </label>
                <textarea
                  value={bulletInput}
                  onChange={(e) => setBulletInput(e.target.value)}
                  placeholder="e.g. Worked on the backend api using python and postgres to improve query speed..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Target Role: <strong className="text-slate-300">{targetRole || 'Software Engineer'}</strong>
                  </span>
                  <button
                    onClick={handleRewrite}
                    disabled={!bulletInput.trim() || isRewriting}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      bulletInput.trim() && !isRewriting
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer shadow-md'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isRewriting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enhancing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Enhance Bullet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              {rewrittenBullets && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enhanced Variations:
                  </h4>

                  {/* 1. Metrics */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        📈 Metrics & Scale Driven
                      </span>
                      <button
                        onClick={() => copyToClipboard(rewrittenBullets.metrics_focused, 'metrics')}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedKey === 'metrics' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      • {rewrittenBullets.metrics_focused}
                    </p>
                  </div>

                  {/* 2. Technical */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        🛠 Technical Depth & Architecture
                      </span>
                      <button
                        onClick={() => copyToClipboard(rewrittenBullets.technical_focused, 'tech')}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedKey === 'tech' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      • {rewrittenBullets.technical_focused}
                    </p>
                  </div>

                  {/* 3. Leadership */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        🤝 Leadership & Ownership
                      </span>
                      <button
                        onClick={() => copyToClipboard(rewrittenBullets.leadership_focused, 'lead')}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedKey === 'lead' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      • {rewrittenBullets.leadership_focused}
                    </p>
                  </div>

                  {/* Improvements tips */}
                  {rewrittenBullets.key_improvements && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      <strong className="text-slate-300">Why these work: </strong>
                      {rewrittenBullets.key_improvements.join(' • ')}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
