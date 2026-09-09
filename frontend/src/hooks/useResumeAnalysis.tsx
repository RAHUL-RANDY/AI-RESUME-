import { useState, createContext, useContext, ReactNode } from 'react';
import {
  ParsedResume,
  ATSScoreResponse,
  MatchResponse,
  SkillGapResponse,
  EmployabilityPredictionResponse,
  SalaryPredictionResponse,
  CourseItem,
  RoadmapResponse,
} from '../types';

interface AnalysisContextType {
  parsedResume: ParsedResume | null;
  atsResult: ATSScoreResponse | null;
  matchResult: MatchResponse | null;
  skillGap: SkillGapResponse | null;
  employability: EmployabilityPredictionResponse | null;
  salary: SalaryPredictionResponse | null;
  courses: CourseItem[];
  roadmap: RoadmapResponse | null;
  targetRole: string;
  jobDescription: string;
  setAllAnalysisData: (data: Partial<AnalysisContextType>) => void;
  loadSampleProfile: () => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [atsResult, setAtsResult] = useState<ATSScoreResponse | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGapResponse | null>(null);
  const [employability, setEmployability] = useState<EmployabilityPredictionResponse | null>(null);
  const [salary, setSalary] = useState<SalaryPredictionResponse | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState<string>('');

  const setAllAnalysisData = (data: Partial<AnalysisContextType>) => {
    if (data.parsedResume !== undefined) setParsedResume(data.parsedResume);
    if (data.atsResult !== undefined) setAtsResult(data.atsResult);
    if (data.matchResult !== undefined) setMatchResult(data.matchResult);
    if (data.skillGap !== undefined) setSkillGap(data.skillGap);
    if (data.employability !== undefined) setEmployability(data.employability);
    if (data.salary !== undefined) setSalary(data.salary);
    if (data.courses !== undefined) setCourses(data.courses);
    if (data.roadmap !== undefined) setRoadmap(data.roadmap);
    if (data.targetRole !== undefined) setTargetRole(data.targetRole);
    if (data.jobDescription !== undefined) setJobDescription(data.jobDescription);
  };

  const loadSampleProfile = () => {
    // Demo data removed
  };

  const clearAnalysis = () => {
    setParsedResume(null);
    setAtsResult(null);
    setMatchResult(null);
    setSkillGap(null);
    setEmployability(null);
    setSalary(null);
    setCourses([]);
    setRoadmap(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        parsedResume,
        atsResult,
        matchResult,
        skillGap,
        employability,
        salary,
        courses,
        roadmap,
        targetRole,
        jobDescription,
        setAllAnalysisData,
        loadSampleProfile,
        clearAnalysis
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useResumeAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useResumeAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
