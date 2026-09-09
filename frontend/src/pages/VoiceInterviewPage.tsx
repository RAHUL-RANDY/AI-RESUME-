import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Gauge,
  HelpCircle,
  Activity
} from 'lucide-react';

interface VoiceEvaluation {
  overall_score: number;
  technical_accuracy_score: number;
  communication_score: number;
  star_method_score: number;
  filler_word_count: number;
  filler_words_detected: string[];
  speaking_pace_wpm: number;
  pace_assessment: string;
  strengths: string[];
  improvements: string[];
  star_breakdown: Record<string, string>;
  model_answer: string;
}

const QUESTION_BANK = [
  {
    role: 'Full Stack Engineer',
    category: 'System Design',
    question: 'How do you design a real-time notification service that scales to 50 million active users with low latency?'
  },
  {
    role: 'Backend Engineer',
    category: 'Technical',
    question: 'Explain how you diagnose and fix a sudden database connection pool exhaustion in a production microservice.'
  },
  {
    role: 'Frontend Engineer',
    category: 'Technical',
    question: 'How do you identify and resolve Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) bottlenecks in a React web application?'
  },
  {
    role: 'Engineering Lead',
    category: 'Behavioral',
    question: 'Tell me about a time you had a technical disagreement with a team member on architectural decisions. How did you resolve it?'
  },
  {
    role: 'AI / Machine Learning',
    category: 'System Design',
    question: 'How would you build an end-to-end RAG (Retrieval-Augmented Generation) pipeline ensuring low latency and semantic accuracy?'
  }
];

export const VoiceInterviewPage: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<VoiceEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const currentQ = QUESTION_BANK[selectedIdx];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
        setInterimText(interimTranscript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition event:', e.error);
        if (e.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser.');
        }
      };

      recognition.onend = () => {
        // Recognition completed
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg('Web Speech API is not supported in this browser. You can still type your answer manually.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Text to speech for interviewer question
  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingQuestion(true);
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    setErrorMsg(null);
    setEvaluation(null);
    setTranscript('');
    setInterimText('');
    setDurationSeconds(0);
    startTimeRef.current = Date.now();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error('Error starting recognition:', err);
      }
    } else {
      setIsRecording(true);
    }

    timerRef.current = setInterval(() => {
      setDurationSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handleEvaluate = async () => {
    const fullText = (transcript + ' ' + interimText).trim();
    if (!fullText || fullText.split(/\s+/).length < 4) {
      setErrorMsg('Please speak or enter at least a few sentences so the AI can evaluate your response.');
      return;
    }

    setIsEvaluating(true);
    setErrorMsg(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    try {
      const res = await fetch(`${API_BASE}/voice-interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          category: currentQ.category,
          transcript: fullText,
          target_role: targetRole,
          duration_seconds: Math.max(10, durationSeconds)
        })
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate answer. Please try again.');
      }

      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI evaluation server.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    stopRecording();
    setTranscript('');
    setInterimText('');
    setEvaluation(null);
    setErrorMsg(null);
    setDurationSeconds(0);
    setSelectedIdx((prev) => (prev + 1) % QUESTION_BANK.length);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Gen Voice AI Coach</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Live AI <span className="gradient-text">Voice Interview</span> Simulator
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Practice high-stakes engineering interviews out loud. Get instant real-time feedback on filler words, speaking pace (WPM), STAR structure, and technical accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interview Simulator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentQ.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">Question {selectedIdx + 1} of {QUESTION_BANK.length}</span>
              </div>
              <button
                onClick={nextQuestion}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
              >
                Skip Question <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-xl font-semibold text-white leading-relaxed mb-6">
              "{currentQ.question}"
            </h2>

            {/* Audio Question Playback */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={speakQuestion}
                disabled={isSpeakingQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Volume2 className={`w-4 h-4 text-sky-400 ${isSpeakingQuestion ? 'animate-bounce' : ''}`} />
                {isSpeakingQuestion ? 'Interviewer Speaking...' : 'Listen to AI Question'}
              </button>

              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                <label className="text-xs text-slate-400 font-medium">Role:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Machine Learning Engineer">ML / AI Engineer</option>
                  <option value="Engineering Manager">Engineering Manager</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voice Input Station */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {isRecording ? 'Microphone Active — Listening...' : 'Microphone Ready'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>{Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Audio Waves Simulation */}
            {isRecording && (
              <div className="h-10 flex items-center justify-center gap-1.5 bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
                {[40, 70, 90, 40, 80, 100, 60, 40, 90, 70, 30, 85, 95, 60, 45].map((height, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-gradient-to-t from-sky-500 to-indigo-400 rounded-full animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${idx * 0.08}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Live Spoken Transcript */}
            <div className="relative">
              <textarea
                value={transcript + (interimText ? ' ' + interimText : '')}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click 'Start Spoken Answer' and talk into your microphone, or type your answer directly here..."
                rows={5}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-none leading-relaxed"
              />
              {transcript && (
                <button
                  onClick={() => { setTranscript(''); setInterimText(''); }}
                  className="absolute top-3 right-3 text-[11px] text-slate-500 hover:text-slate-300 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition transform active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  Start Spoken Answer
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 transition transform active:scale-95"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Recording
                </button>
              )}

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || isRecording || (!transcript && !interimText)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sky-400 border border-slate-700 font-semibold text-xs transition sm:ml-auto shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                {isEvaluating ? 'AI Scoring Spoken Answer...' : 'Analyze Answer'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Feedback Report */}
        <div className="lg:col-span-5">
          {evaluation ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall AI Rating</div>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {evaluation.overall_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Award className="w-7 h-7 text-sky-400" />
                </div>
              </div>

              {/* Score Meters */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Technical Accuracy</span>
                    <span className="text-sky-400">{evaluation.technical_accuracy_score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${evaluation.technical_accuracy_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Communication & Delivery</span>
                    <span className="text-indigo-400">{evaluation.communication_score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${evaluation.communication_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">STAR Methodology</span>
                    <span className="text-purple-400">{evaluation.star_method_score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${evaluation.star_method_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Filler Words & Speaking Pace */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Filler Words Detected</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {evaluation.filler_word_count} <span className="text-xs font-normal text-slate-400">words</span>
                  </div>
                  {evaluation.filler_words_detected.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {evaluation.filler_words_detected.map((f, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          "{f}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Speaking Pace</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {evaluation.speaking_pace_wpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {evaluation.pace_assessment}
                  </p>
                </div>
              </div>

              {/* Actionable Strengths & Improvements */}
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> What You Did Well
                  </h4>
                  <ul className="space-y-1.5">
                    {evaluation.strengths.map((st, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Next Steps to Elevate
                  </h4>
                  <ul className="space-y-1.5">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exemplary Benchmark Answer */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 rounded-xl p-4 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Staff-Level Benchmark Answer
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{evaluation.model_answer}"
                </p>
              </div>

              <button
                onClick={nextQuestion}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Practice Next Question
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-inner">
                <Mic className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="text-lg font-bold text-white">No Evaluation Yet</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Click <strong className="text-sky-400">Start Spoken Answer</strong>, speak your answer into your mic, then click <strong className="text-sky-400">Analyze Answer</strong> to see your live interview coaching scorecard.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-1 bg-slate-900 rounded-md border border-slate-800">✨ Filler Word Detection</span>
                <span className="px-2 py-1 bg-slate-900 rounded-md border border-slate-800">⏱️ Pace / WPM</span>
                <span className="px-2 py-1 bg-slate-900 rounded-md border border-slate-800">🎯 STAR Alignment</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VoiceInterviewPage;
