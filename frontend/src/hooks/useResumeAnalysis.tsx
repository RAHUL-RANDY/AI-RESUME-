import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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

const STORAGE_KEY = 'career_intel_analysis_data';

export const SAMPLE_PROFILE_DATA = {
  parsedResume: {
    id: 'sample_candidate_alex_2026',
    name: 'Rahul R',
    email: 'rahul.engineer@example.com',
    phone: '+1 (555) 382-9102',
    location: 'San Francisco, CA (Open to Remote)',
    total_experience_years: 4.5,
    technical_skills: [
      'Python', 'React', 'TypeScript', 'FastAPI', 'Node.js',
      'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'AWS',
      'Git', 'CI/CD', 'REST APIs', 'Microservices'
    ],
    soft_skills: [
      'System Architecture', 'Agile/Scrum', 'Cross-Functional Collaboration', 'Technical Problem Solving'
    ],
    skills: [
      'Python', 'React', 'TypeScript', 'FastAPI', 'Node.js',
      'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'AWS',
      'Git', 'CI/CD', 'REST APIs', 'System Architecture', 'Agile/Scrum'
    ],
    education: [
      {
        degree: 'B.S. in Computer Science & Engineering',
        institution: 'University of California, Berkeley',
        graduation_year: '2022',
        gpa: '3.85'
      }
    ],
    experience: [
      {
        company: 'CloudScale Technologies',
        role: 'Senior Full Stack Engineer',
        duration: '2023 - Present',
        duration_years: 2.0,
        description: 'Architected distributed backend microservices in FastAPI & PostgreSQL handling 2.4M daily requests with 99.98% uptime.',
        highlights: [
          'Reduced p99 API latency by 45% through Redis caching and query indexing',
          'Built responsive React/TypeScript interfaces reducing user dropoff by 34%'
        ]
      },
      {
        company: 'Apex Data Systems',
        role: 'Software Engineer',
        duration: '2021 - 2023',
        duration_years: 2.5,
        description: 'Developed scalable REST APIs and orchestrated CI/CD pipelines deploying Docker containers to AWS.',
        highlights: [
          'Engineered asynchronous background queue handling 50k daily tasks',
          'Collaborated in Scrum sprints maintaining 95%+ test coverage'
        ]
      }
    ],
    projects: [
      {
        name: 'Distributed Async Task Orchestrator',
        description: 'High-throughput asynchronous background job engine supporting 50k queued tasks per minute with automated retries.',
        technologies: ['Python', 'FastAPI', 'Redis', 'Docker', 'Celery'],
        link: 'https://github.com/RAHUL-RANDY'
      },
      {
        name: 'AI Career Suite & Resume Intelligence',
        description: 'Full stack career platform with real-time ATS scoring, SBERT semantic matching, and voice interview simulator.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'PostgreSQL'],
        link: 'https://github.com/RAHUL-RANDY/AI-RESUME-'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect - Associate',
        issuer: 'Amazon Web Services (AWS)',
        date: '2023'
      }
    ],
    languages: ['English', 'Tamil'],
    summary: 'Versatile Full Stack Engineer with 4.5+ years of production experience architecting scalable backend microservices (Python/FastAPI) and responsive modern web applications (React/TypeScript). Experienced in Docker containerization, AWS cloud infrastructure, and performance optimization.',
    raw_text: 'Rahul R - Senior Full Stack Engineer - 4.5 Years Experience in Python, React, TypeScript, FastAPI, AWS, Docker, Kubernetes, PostgreSQL.'
  } as ParsedResume,

  atsResult: {
    overall_score: 94.5,
    breakdown: {
      keyword_match: 96.0,
      skills_match: 95.0,
      experience_relevance: 94.0,
      education_match: 96.0,
      structure_quality: 98.0,
      formatting_readability: 97.0
    },
    strengths: [
      'Strong keyword density across modern Full Stack competencies (Python, React, AWS, Docker, PostgreSQL)',
      'High ratio of measurable metrics (2.4M requests, 99.98% uptime, 45% latency reduction, 50k tasks/min)',
      'Clean ATS-compliant single-column structure with standard section headers'
    ],
    deficiencies: [
      'Consider highlighting Infrastructure as Code (Terraform) to align with Staff-level roles',
      'Detail event streaming architectures (Kafka / RabbitMQ) for distributed high-load systems'
    ],
    recommendations: [
      'Highlight cloud containerization metrics (Kubernetes pod scaling)',
      'Detail event streaming architectures for distributed high-load systems'
    ],
    keyword_density: {
      python: 8,
      react: 7,
      fastapi: 5,
      docker: 4,
      aws: 4,
      postgresql: 4,
      typescript: 4
    }
  } as ATSScoreResponse,

  matchResult: {
    match_score: 88.4,
    similarity_percentage: 88.4,
    matched_keywords: ['Python', 'React', 'TypeScript', 'FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL', 'AWS', 'CI/CD'],
    missing_keywords: ['Terraform', 'Apache Kafka', 'GraphQL'],
    summary_analysis: 'Strong semantic alignment between candidate experience in Python backend microservices, React modern web UI, and containerized cloud deployment against Senior Full Stack requirements.'
  } as MatchResponse,

  skillGap: {
    matching_skills: ['Python', 'React', 'TypeScript', 'FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL', 'AWS', 'Redis'],
    missing_skills: ['Terraform', 'Apache Kafka', 'GraphQL', 'System Design'],
    optional_skills: ['MongoDB', 'Tailwind CSS'],
    gap_percentage: 15.0,
    coverage_score: 85.0,
    radar_data: [
      { subject: 'Python & FastAPI', candidate: 95, requirement: 90, fullMark: 100 },
      { subject: 'React & TS', candidate: 90, requirement: 85, fullMark: 100 },
      { subject: 'Docker & K8s', candidate: 85, requirement: 80, fullMark: 100 },
      { subject: 'AWS Cloud', candidate: 80, requirement: 85, fullMark: 100 },
      { subject: 'Databases & Redis', candidate: 90, requirement: 85, fullMark: 100 },
      { subject: 'System Design', candidate: 75, requirement: 85, fullMark: 100 }
    ]
  } as SkillGapResponse,

  employability: {
    employability_probability: 91.2,
    is_employable: true,
    confidence_level: 'Very High (94.2%)',
    risk_assessment: 'Low Career Risk - Profile demonstrates consistent technical progression and high market demand.',
    top_contributing_features: [
      { feature: 'Technical Skills Breadth (12+ Stack Proficiencies)', value: 14, impact: 0.28, description: 'Proficiency across full-stack languages and tools' },
      { feature: '4.5 Years Production Engineering Experience', value: 4.5, impact: 0.24, description: 'Mid-to-Senior industry engineering experience' },
      { feature: 'ATS Resume Score (94.5%)', value: 94.5, impact: 0.22, description: 'High keyword resonance with modern engineering roles' },
      { feature: 'Cloud Architecture & Containers (AWS/Docker/K8s)', value: 'AWS / Docker', impact: 0.16, description: 'Production container and cloud deployment' }
    ]
  } as EmployabilityPredictionResponse,

  salary: {
    predicted_salary: 148500,
    salary_min: 138000,
    salary_max: 159000,
    currency: 'USD',
    confidence_interval: '$138,000 - $159,000',
    top_contributing_features: [
      { feature: 'Full Stack Python & React Core Stack', value: 'High', impact: 32000, description: 'Strong market premium for full stack engineers' },
      { feature: '4.5 Years Experience Benchmark', value: 4.5, impact: 28500, description: 'Senior engineering market median' },
      { feature: 'Cloud & Containerization (AWS)', value: 'Certified', impact: 24000, description: 'AWS Solutions Architect certification' }
    ]
  } as SalaryPredictionResponse,

  courses: [
    {
      id: 'c_tf_01',
      title: 'Terraform on AWS: Complete Infrastructure as Code (IaC)',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/terraform-hands-on-labs/',
      level: 'Intermediate',
      duration_hours: 18,
      rating: 4.8,
      target_role: 'Full Stack Engineer',
      category: 'Cloud Architecture',
      price_display: '$19.99',
      is_free: false,
      skills_covered: ['Terraform', 'AWS', 'Infrastructure as Code', 'HCL'],
      relevance_score: 95
    },
    {
      id: 'c_kf_02',
      title: 'Apache Kafka Series: Learn Event Streaming Architecture',
      provider: 'Coursera',
      url: 'https://www.coursera.org',
      level: 'Advanced',
      duration_hours: 22,
      rating: 4.9,
      target_role: 'Full Stack Engineer',
      category: 'Backend Engineering',
      price_display: 'Free',
      is_free: true,
      skills_covered: ['Apache Kafka', 'Event Streaming', 'Distributed Systems', 'Message Queues'],
      relevance_score: 92
    },
    {
      id: 'c_sd_03',
      title: 'Grokking Modern System Design for Software Engineers',
      provider: 'Educative',
      url: 'https://www.educative.io',
      level: 'Advanced',
      duration_hours: 26,
      rating: 4.9,
      target_role: 'Full Stack Engineer',
      category: 'System Design',
      price_display: '$29.00',
      is_free: false,
      skills_covered: ['System Design', 'Scalability', 'Load Balancing', 'Consistent Hashing'],
      relevance_score: 90
    }
  ] as CourseItem[],

  roadmap: {
    target_role: 'Senior Full Stack Engineer',
    estimated_duration_months: 6,
    milestones: [
      {
        month: 1,
        title: 'Infrastructure as Code (Terraform) Mastery',
        focus_skills: ['Terraform', 'AWS ECS', 'Cloud Architecture'],
        goal: 'Provision AWS VPC, subnets, and ECS clusters using declarative Terraform HCL',
        action_items: ['Complete Terraform Hands-On Labs', 'Implement remote state locking via DynamoDB and S3'],
        projects_to_build: ['Automated Multi-Tier Cloud Deployment Template'],
        recommended_certifications: ['HashiCorp Certified Associate']
      },
      {
        month: 2,
        title: 'Distributed Event Streaming (Apache Kafka)',
        focus_skills: ['Apache Kafka', 'Event Streaming', 'Message Queues'],
        goal: 'Implement Kafka cluster with consumer groups for asynchronous order processing',
        action_items: ['Build real-time event pipeline', 'Master dead-letter queues and offset management'],
        projects_to_build: ['Real-Time Log Streamer & Metrics Aggregator'],
        recommended_certifications: ['Confluent Certified Developer']
      },
      {
        month: 3,
        title: 'Advanced Distributed System Design',
        focus_skills: ['System Design', 'Caching Patterns', 'High Availability'],
        goal: 'Deepen architectural patterns: CQRS, Event Sourcing, Circuit Breakers',
        action_items: ['Practice designing distributed rate limiters and URL shorteners', 'Read Designing Data-Intensive Applications'],
        projects_to_build: ['Distributed Rate Limiter with Redis Token Bucket'],
        recommended_certifications: ['AWS Solutions Architect Professional']
      },
      {
        month: 4,
        title: 'High-Performance API Architectures & GraphQL',
        focus_skills: ['GraphQL', 'Apollo', 'FastAPI', 'Performance'],
        goal: 'Build federated GraphQL schemas alongside FastAPI REST endpoints',
        action_items: ['Optimize query batching with DataLoader', 'Implement HTTP/2 multiplexing'],
        projects_to_build: ['Federated Gateway for Microservice Fleet'],
        recommended_certifications: ['Apollo Certified GraphQL Developer']
      },
      {
        month: 5,
        title: 'Staff-Level Interview & System Architecture Prep',
        focus_skills: ['Interview Mastery', 'STAR Method', 'Leadership'],
        goal: 'Practice live technical mock interviews with STAR framework',
        action_items: ['Complete 10 mock sessions on AI Voice Interview Coach', 'Prepare system design architectural deep dives'],
        projects_to_build: ['Technical Portfolio & Whitepaper Writeups'],
        recommended_certifications: ['CKA: Certified Kubernetes Administrator']
      },
      {
        month: 6,
        title: 'Targeted High-Compensation Applications & Outreach',
        focus_skills: ['Executive Outreach', 'Salary Negotiation', 'Offer Evaluation'],
        goal: 'Tailor resume and outreach letters for Tier-1 engineering organizations',
        action_items: ['Deploy tailored cover letters and cold outreach to hiring managers', 'Target offers in the $145k - $165k compensation band'],
        projects_to_build: ['Final High-Impact Production Case Study'],
        recommended_certifications: ['Professional Scrum Master I']
      }
    ]
  } as RoadmapResponse,

  targetRole: 'Senior Full Stack Engineer',
  jobDescription: 'Senior Full Stack Engineer position requiring Python, FastAPI, React, TypeScript, Docker, Kubernetes, AWS, and distributed systems.'
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  // 1. Initialize state from localStorage if available, or default to sample data
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.parsedResume || parsed.atsResult)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached analysis from localStorage:', e);
    }
    // Default to the rich interactive candidate profile so dashboard is always active and loaded
    return SAMPLE_PROFILE_DATA;
  };

  const initial = getInitialState();

  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(initial.parsedResume || null);
  const [atsResult, setAtsResult] = useState<ATSScoreResponse | null>(initial.atsResult || null);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(initial.matchResult || null);
  const [skillGap, setSkillGap] = useState<SkillGapResponse | null>(initial.skillGap || null);
  const [employability, setEmployability] = useState<EmployabilityPredictionResponse | null>(initial.employability || null);
  const [salary, setSalary] = useState<SalaryPredictionResponse | null>(initial.salary || null);
  const [courses, setCourses] = useState<CourseItem[]>(initial.courses || []);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(initial.roadmap || null);
  const [targetRole, setTargetRole] = useState<string>(initial.targetRole || 'Senior Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState<string>(initial.jobDescription || '');

  // Keep localStorage in sync with current state
  useEffect(() => {
    if (parsedResume || atsResult) {
      try {
        const stateToSave = {
          parsedResume,
          atsResult,
          matchResult,
          skillGap,
          employability,
          salary,
          courses,
          roadmap,
          targetRole,
          jobDescription
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.warn('Could not save analysis to localStorage:', e);
      }
    }
  }, [parsedResume, atsResult, matchResult, skillGap, employability, salary, courses, roadmap, targetRole, jobDescription]);

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
    setAllAnalysisData(SAMPLE_PROFILE_DATA);
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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
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
