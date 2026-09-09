import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { mentorService } from '../services/api';
import { ChatMessage } from '../types';

const INITIAL_PROMPT_PILLS = [
  'How do I improve my ATS resume score?',
  'What are my missing skill gaps?',
  'Recommend best courses to take',
  'Mock System Design question',
  'STAR format bullet point example',
  'How to negotiate my salary?',
];

export const GlobalChatWidget: React.FC = () => {
  const { parsedResume, targetRole, skillGap } = useResumeAnalysis();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState<boolean>(true);

  // Chat message state with session persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('ai_career_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        role: 'assistant',
        content: `👋 Hello! I am your **AI Career Intelligence Co-Pilot**.\n\nI can answer **all your questions** — from technical architecture, coding, and system design to resume ATS optimization, skill gaps, course suggestions, and interview prep.\n\nHow can I help you accelerate your career today?`,
      },
    ];
  });

  const [followups, setFollowups] = useState<string[]>([
    'How do I improve my ATS resume score?',
    'What courses will bridge my skill gaps?',
    'Can you give me a mock interview question?',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages to session
  useEffect(() => {
    try {
      sessionStorage.setItem('ai_career_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowWelcomeBubble(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const candidateProfile = parsedResume
        ? {
            name: parsedResume.name,
            total_experience_years: parsedResume.total_experience_years || 2.0,
            skills: parsedResume.skills || [],
          }
        : undefined;

      const res = await mentorService.chat(
        updatedMessages,
        candidateProfile,
        targetRole || 'Software Engineer',
        skillGap?.missing_skills || []
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply },
      ]);

      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setFollowups(res.suggested_followups);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I ran into a temporary connection hurdle, but here is a quick tip: Make sure your target keywords appear naturally across your resume's experience and skills sections to achieve high ATS compliance. What specific topic would you like to explore next?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const defaultWelcome: ChatMessage[] = [
      {
        role: 'assistant',
        content: `👋 Chat reset! I am ready for your next question about technical engineering, system architecture, resume optimization, or interview prep.`,
      },
    ];
    setMessages(defaultWelcome);
    sessionStorage.removeItem('ai_career_chat_history');
    setFollowups(INITIAL_PROMPT_PILLS.slice(0, 3));
  };

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to format basic markdown (bold, lists, code)
  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const bulletText = line.replace(/^[\s•\-*]+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-0.5">
            {renderFormattedText(bulletText)}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="ml-2 font-medium text-slate-200 my-1">
            {renderFormattedText(line)}
          </div>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="my-1 leading-relaxed">
          {renderFormattedText(line)}
        </p>
      );
    });
  };

  const renderFormattedText = (text: string) => {
    // Basic bold parsing: **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const candidateName = parsedResume?.name ? parsedResume.name.split(' ')[0] : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Welcome Speech Bubble (When closed) */}
      <AnimatePresence>
        {!isOpen && showWelcomeBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-3 max-w-[270px] glass-panel p-3 rounded-2xl border border-sky-500/30 shadow-xl shadow-sky-500/10 text-xs text-slate-200 relative group cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeBubble(false);
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              title="Dismiss"
            >
              <X className="w-2.5 h-2.5" />
            </button>
            <div className="flex items-center gap-2 font-semibold text-sky-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Career Co-Pilot</span>
            </div>
            <p className="leading-snug text-slate-300">
              {candidateName
                ? `Hi ${candidateName}! Ask me anything about your resume, skill gaps, or interview prep.`
                : 'Ask me anything about resume ATS scores, technical questions, or career prep!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-800 text-slate-300 border border-slate-700'
            : 'bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white shadow-indigo-500/30'
        }`}
        aria-label="Toggle AI Career Chatbox"
        title="Open AI Career Co-Pilot Chatbox"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Bot className="w-6 h-6" />
            {/* Pulsing online indicator */}
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </>
        )}
      </motion.button>

      {/* Main Chatbox Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed bottom-24 right-4 sm:right-6 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-2xl transition-all ${
              isExpanded
                ? 'w-[92vw] sm:w-[540px] h-[85vh] max-h-[750px]'
                : 'w-[92vw] sm:w-[420px] h-[75vh] max-h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">AI Career Co-Pilot</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      GPT-4o
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{candidateName ? `${candidateName} (${targetRole || 'Engineer'})` : 'Ready to answer anything'}</span>
                  </div>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear conversation history"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="hidden sm:inline-flex p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isExpanded ? 'Collapse window' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Minimize chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Context Pill Banner */}
            <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Context: {targetRole || 'Software Engineer'}</span>
              </span>
              {skillGap?.missing_skills && skillGap.missing_skills.length > 0 && (
                <span className="text-amber-400/90 font-medium truncate max-w-[170px]">
                  Gap: {skillGap.missing_skills[0]}
                </span>
              )}
            </div>

            {/* Messages Feed Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble Content */}
                    <div className="relative group max-w-[85%]">
                      <div
                        className={`p-3.5 rounded-2xl ${
                          isUser
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                        }`}
                      >
                        {formatContent(m.content)}
                      </div>

                      {/* Copy reply button for assistant */}
                      {!isUser && (
                        <button
                          onClick={() => copyMessage(m.content, idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5 text-slate-400">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-1.5">
                    <span>AI Co-Pilot is thinking</span>
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-100" />
                      <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-200" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Follow-up Pills */}
            {followups.length > 0 && !isLoading && (
              <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0">
                  Suggested:
                </span>
                {followups.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(f)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 hover:text-sky-200 border border-slate-700/70 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about resume, code, system design, ATS..."
                className="flex-1 bg-slate-950/70 text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white disabled:opacity-40 transition-opacity cursor-pointer shadow-md shadow-indigo-500/20"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
