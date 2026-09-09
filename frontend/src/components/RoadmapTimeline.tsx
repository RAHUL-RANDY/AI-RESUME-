import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Award, Code, Compass } from 'lucide-react';
import { RoadmapMilestone } from '../types';

interface RoadmapTimelineProps {
  milestones: RoadmapMilestone[];
  targetRole?: string;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  milestones,
  targetRole = 'Target Role'
}) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm">
        No roadmap generated. Complete resume analysis to view your customized timeline.
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-800 ml-4 md:ml-6 space-y-8 py-4">
      {milestones.map((milestone, idx) => (
        <motion.div
          key={milestone.month}
          className="relative pl-6 md:pl-8 group"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
        >
          {/* Timeline Node Dot */}
          <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <span className="text-xs font-bold">{milestone.month}</span>
          </div>

          {/* Card Content */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                {milestone.title}
              </h4>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Calendar className="w-3 h-3" /> Month {milestone.month}
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-4">{milestone.goal}</p>

            {/* Focus Skills */}
            {milestone.focus_skills && milestone.focus_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {milestone.focus_skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Action Items */}
            <div className="space-y-2 mb-4 bg-slate-900/40 rounded-lg p-3 border border-slate-800/60">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Milestone Action Items
              </div>
              <ul className="space-y-1.5">
                {milestone.action_items.map((action, aIdx) => (
                  <li key={aIdx} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projects & Certifications Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
              {milestone.projects_to_build && milestone.projects_to_build.length > 0 && (
                <div className="flex items-start gap-2 text-slate-400">
                  <Code className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-300 block">Production Milestone Architecture:</span>
                    <span>{milestone.projects_to_build.join(', ')}</span>
                  </div>
                </div>
              )}
              {milestone.recommended_certifications && milestone.recommended_certifications.length > 0 && (
                <div className="flex items-start gap-2 text-slate-400">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-300 block">Recommended Credential:</span>
                    <span>{milestone.recommended_certifications.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
