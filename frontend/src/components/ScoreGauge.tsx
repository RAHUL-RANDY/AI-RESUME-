import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  sublabel,
  size = 150,
  strokeWidth = 12
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Determine color scheme
  let color = '#ef4444'; // Red
  let badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
  let badgeText = 'Needs Work';

  if (clampedScore >= 80) {
    color = '#10b981'; // Green
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    badgeText = 'Excellent';
  } else if (clampedScore >= 65) {
    color = '#38bdf8'; // Sky Blue
    badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    badgeText = 'Competitive';
  } else if (clampedScore >= 50) {
    color = '#f59e0b'; // Amber
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    badgeText = 'Moderate';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-3xl font-bold tracking-tight text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {Math.round(clampedScore)}
            <span className="text-sm font-normal text-slate-400">%</span>
          </motion.span>
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border mt-1 ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};
