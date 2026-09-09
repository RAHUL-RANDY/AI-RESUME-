import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Sparkles, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
  standalone?: boolean;
}

const LOADING_STEPS = [
  { progress: 18, text: 'Initializing Neural Architecture & Core Services...' },
  { progress: 42, text: 'Loading SBERT Dense Vector Embedding Models...' },
  { progress: 68, text: 'Calibrating Weighted ATS Scoring & Taxonomy Engines...' },
  { progress: 88, text: 'Syncing Random Forest Employability & Salary Regressors...' },
  { progress: 100, text: 'Neural Suite Ready — Launching AI Career Intelligence...' },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minDurationMs = 2000,
  standalone = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const intervalTime = 30;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));

      setProgress(calculatedProgress);

      // Determine step
      const currentStep = LOADING_STEPS.findIndex((s) => calculatedProgress <= s.progress);
      if (currentStep !== -1) {
        setStepIndex(currentStep);
      } else {
        setStepIndex(LOADING_STEPS.length - 1);
      }

      if (elapsed >= minDurationMs) {
        clearInterval(timer);
        setProgress(100);
        setStepIndex(LOADING_STEPS.length - 1);
        setTimeout(() => {
          setIsFinished(true);
          if (onComplete) onComplete();
        }, 350);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [minDurationMs, onComplete]);

  if (isFinished && !standalone) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="loading-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={`${
          standalone
            ? 'min-h-[80vh] flex flex-col items-center justify-center px-4 relative'
            : 'fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4 bg-[#090d16] text-white'
        }`}
      >
        {/* Ambient Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Futuristic Holographic Core */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer Rotating Dashed Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-36 h-36 rounded-full border border-dashed border-sky-400/30"
          />

          {/* Reverse Rotating Middle Ring with Orbital Blip */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute w-28 h-28 rounded-full border border-indigo-500/40 flex items-start justify-center"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] -translate-y-1.5" />
          </motion.div>

          {/* Inner Pulsing Core Ring */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/30 to-purple-500/20 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-indigo-500/30"
          >
            <Cpu className="w-9 h-9 text-sky-400 animate-pulse" />
          </motion.div>

          {/* Top-Right Mini Floating Sparkle */}
          <motion.div
            animate={{ y: [-3, 3, -3], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 p-1.5 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-sky-300 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
          </motion.div>
        </div>

        {/* Brand Title & Badges */}
        <div className="text-center max-w-md mx-auto space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 text-xs font-semibold text-slate-300 mb-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Career Intelligence Suite v2.0</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            <span className="gradient-text">Neural System Initializing</span>
          </h2>

          <p className="text-xs text-slate-400 font-mono tracking-wide h-6">
            {LOADING_STEPS[stepIndex]?.text}
          </p>
        </div>

        {/* Glowing Progress Bar Container */}
        <div className="w-72 sm:w-96 mt-6 space-y-2 relative z-10">
          <div className="h-2 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] relative"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            >
              {/* Shimmer line */}
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </motion.div>
          </div>

          {/* Status & Numeric Percentage */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
            <span className="flex items-center gap-1 text-slate-400">
              <Layers className="w-3 h-3 text-sky-400" />
              <span>SBERT • Random Forest • ATS</span>
            </span>
            <span className="text-sky-300 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Feature Security & Verification Badges */}
        <div className="mt-8 flex items-center gap-4 text-[11px] text-slate-400 border border-slate-800/80 bg-slate-900/60 rounded-xl px-4 py-2 relative z-10">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Ready</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>OpenAI GPT-4o Online</span>
          </span>
        </div>

        {/* Optional Skip Trigger (for quick access) */}
        {!standalone && (
          <button
            onClick={() => {
              setIsFinished(true);
              if (onComplete) onComplete();
            }}
            className="mt-6 text-[11px] text-slate-400 hover:text-slate-300 underline underline-offset-4 cursor-pointer transition-colors"
          >
            Skip loading screen →
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
