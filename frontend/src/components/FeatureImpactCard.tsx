import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { FeatureContribution } from '../types';

interface FeatureImpactCardProps {
  title: string;
  features: FeatureContribution[];
  emptyMessage?: string;
}

export const FeatureImpactCard: React.FC<FeatureImpactCardProps> = ({
  title,
  features,
  emptyMessage = "SHAP feature attribution computed dynamically upon inference."
}) => {
  if (!features || features.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 border border-slate-800">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-sky-400" />
          {title}
        </h4>
        <p className="text-xs text-slate-500 italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          {title}
        </h4>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
          SHAP Attribution
        </span>
      </div>

      <div className="space-y-3">
        {features.map((item, idx) => {
          const isPositive = item.impact >= 0;
          return (
            <motion.div
              key={idx}
              className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">{item.feature}</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    isPositive
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {item.impact > 0 ? `+${item.impact}` : `${item.impact}`}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
