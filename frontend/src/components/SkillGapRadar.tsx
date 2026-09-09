import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { RadarAxisData } from '../types';

interface SkillGapRadarProps {
  data: RadarAxisData[];
}

export const SkillGapRadar: React.FC<SkillGapRadarProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No radar metrics available. Upload a resume to generate skill vectors.
      </div>
    );
  }

  return (
    <div className="w-full h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            stroke="#1e293b"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Radar
            name="Candidate Proficiency"
            dataKey="candidate"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.45}
          />
          <Radar
            name="Job Requirement"
            dataKey="requirement"
            stroke="#c084fc"
            fill="#c084fc"
            fillOpacity={0.25}
          />
          <Legend
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '8px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
