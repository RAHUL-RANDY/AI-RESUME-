import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCw, ArrowRight, LayoutDashboard, Sparkles, UploadCloud } from 'lucide-react';
import { LoadingScreen } from '../components/LoadingScreen';

export const LoadingPage: React.FC = () => {
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [duration, setDuration] = useState<number>(2500);

  const restartLoading = (newDuration: number = 2500) => {
    setDuration(newDuration);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
      {/* Header Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Loading Experience</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">AI Neural Loading Showcase</h1>
          <p className="text-xs text-slate-400">
            Preview the platform preloader, SBERT initialization, and neural calibration sequence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => restartLoading(2000)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Replay Sequence</span>
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Analyze Resume</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Embedded Loading Screen Container */}
      <div className="w-full glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <LoadingScreen key={reloadKey} standalone={true} minDurationMs={duration} />
      </div>

      {/* Speed Presets */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Test Duration:</span>
        <button
          onClick={() => restartLoading(1500)}
          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Fast (1.5s)
        </button>
        <button
          onClick={() => restartLoading(3000)}
          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Standard (3.0s)
        </button>
        <button
          onClick={() => restartLoading(5000)}
          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Deep Calibration (5.0s)
        </button>
      </div>
    </div>
  );
};
