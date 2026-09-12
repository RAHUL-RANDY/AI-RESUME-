import axios from 'axios';
import {
  AuthResponse,
  User,
  ParsedResume,
  ATSScoreResponse,
  MatchResponse,
  SkillGapResponse,
  EmployabilityPredictionResponse,
  SalaryPredictionResponse,
  RecommendationResponse,
  RoadmapResponse,
  MentorChatResponse,
  InterviewQuestionsResponse,
  CandidateSummary,
  AdminSystemStats,
  ChatMessage,
  SubscriptionPlan,
  SubscriptionStatus,
  CheckoutResponse,
  RazorpayConfig,
  RazorpayOrderResponse,
  LLMStatusResponse,
  BulletRewriteResponse,
  TailorSummaryResponse,
  JobListing,
  JobMatchResult,
  OfferAnalysisResult,
  CounterOfferResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string, role: string): Promise<User> => {
    const res = await api.post<User>('/auth/register', { name, email, password, role });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  googleLogin: async (data: { credential?: string; email?: string; name?: string; role?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/google', data);
    return res.data;
  },
};

export const resumeService = {
  upload: async (file: File, jobDescription?: string, targetRole?: string): Promise<{ resume: ParsedResume; ats_result: ATSScoreResponse | null; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription) formData.append('job_description', jobDescription);
    if (targetRole) formData.append('target_role', targetRole);

    const res = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  get: async (id: string): Promise<ParsedResume> => {
    const res = await api.get<ParsedResume>(`/resume/${id}`);
    return res.data;
  },
};

export const matchingService = {
  analyze: async (resumeText: string, jobDescription: string, targetRole?: string): Promise<MatchResponse> => {
    const res = await api.post<MatchResponse>('/matching/analyze', {
      resume_text: resumeText,
      job_description: jobDescription,
      target_role: targetRole,
    });
    return res.data;
  },
  skillGap: async (resumeSkills: string[], requiredSkills: string[], preferredSkills?: string[]): Promise<SkillGapResponse> => {
    const res = await api.post<SkillGapResponse>('/matching/skill-gap', {
      resume_skills: resumeSkills,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills || [],
    });
    return res.data;
  },
};

export const predictionService = {
  predictEmployability: async (features: any): Promise<EmployabilityPredictionResponse> => {
    const res = await api.post<EmployabilityPredictionResponse>('/prediction/employability', features);
    return res.data;
  },
  predictSalary: async (features: any): Promise<SalaryPredictionResponse> => {
    const res = await api.post<SalaryPredictionResponse>('/prediction/salary', features);
    return res.data;
  },
};

export const recommendationService = {
  getCourses: async (
    missingSkills: string[],
    careerGoal?: string,
    experienceLevel?: string,
    category?: string,
    pricingType?: 'all' | 'free' | 'paid',
    topK = 12
  ): Promise<RecommendationResponse> => {
    const res = await api.post<RecommendationResponse>('/recommendation/courses', {
      missing_skills: missingSkills,
      career_goal: careerGoal,
      experience_level: experienceLevel,
      category,
      pricing_type: pricingType || 'all',
      top_k: topK,
    });
    return res.data;
  },
  getAllCourses: async (category?: string, pricingType?: 'all' | 'free' | 'paid', targetRole?: string): Promise<RecommendationResponse> => {
    const res = await api.get<RecommendationResponse>('/recommendation/all', {
      params: {
        category: category && category !== 'All' ? category : undefined,
        target_role: targetRole && targetRole !== 'All Roles' && targetRole !== 'All' ? targetRole : undefined,
        pricing_type: pricingType && pricingType !== 'all' ? pricingType : undefined,
      },
    });
    return res.data;
  },
};

export const roadmapService = {
  generate: async (targetRole: string, missingSkills: string[], experienceYears: number, userId?: string): Promise<RoadmapResponse> => {
    const res = await api.post<RoadmapResponse>('/roadmap/generate', {
      target_role: targetRole,
      missing_skills: missingSkills,
      experience_years: experienceYears,
      user_id: userId,
    });
    return res.data;
  },
  getForUser: async (userId: string): Promise<RoadmapResponse> => {
    const res = await api.get<RoadmapResponse>(`/roadmap/${userId}`);
    return res.data;
  },
};

export const mentorService = {
  chat: async (messages: ChatMessage[], candidateProfile?: any, targetRole?: string, missingSkills?: string[]): Promise<MentorChatResponse> => {
    const res = await api.post<MentorChatResponse>('/mentor/chat', {
      messages,
      candidate_profile: candidateProfile,
      target_role: targetRole,
      missing_skills: missingSkills,
    });
    return res.data;
  },
  getInterviewQuestions: async (targetRole: string, skills: string[], experienceYears: number, projects?: string[]): Promise<InterviewQuestionsResponse> => {
    const res = await api.post<InterviewQuestionsResponse>('/mentor/interview-questions', {
      target_role: targetRole,
      skills,
      experience_years: experienceYears,
      projects: projects || [],
    });
    return res.data;
  },
  getStatus: async (): Promise<LLMStatusResponse> => {
    const res = await api.get<LLMStatusResponse>('/mentor/status');
    return res.data;
  },
  rewriteBullet: async (bulletText: string, targetRole?: string, skills?: string[]): Promise<BulletRewriteResponse> => {
    const res = await api.post<BulletRewriteResponse>('/mentor/rewrite-bullet', {
      bullet_text: bulletText,
      target_role: targetRole,
      skills: skills || [],
    });
    return res.data;
  },
  tailorSummary: async (candidateName: string, experienceYears: number, skills: string[], targetRole: string, jobDescription?: string): Promise<TailorSummaryResponse> => {
    const res = await api.post<TailorSummaryResponse>('/mentor/tailor-summary', {
      candidate_name: candidateName,
      experience_years: experienceYears,
      skills,
      target_role: targetRole,
      job_description: jobDescription,
    });
    return res.data;
  },
};

export const recruiterService = {
  bulkUpload: async (files: File[], jobDescription: string, targetRole?: string): Promise<{ total_processed: number; candidates: CandidateSummary[] }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('job_description', jobDescription);
    if (targetRole) formData.append('target_role', targetRole);

    const res = await api.post('/recruiter/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getCandidates: async (): Promise<CandidateSummary[]> => {
    const res = await api.get<CandidateSummary[]>('/recruiter/candidates');
    return res.data;
  },
};

export const adminService = {
  verifyKey: async (adminKey: string): Promise<{ success: boolean; access_token: string; user: any }> => {
    const res = await api.post('/admin/verify-key', { admin_key: adminKey });
    return res.data;
  },
  getStats: async (): Promise<AdminSystemStats> => {
    const res = await api.get<AdminSystemStats>('/admin/stats');
    return res.data;
  },
  getModels: async (): Promise<any> => {
    const res = await api.get('/admin/models');
    return res.data;
  },
  getUsers: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/admin/users');
    return res.data;
  },
  updateUserRole: async (userId: string, role: string): Promise<any> => {
    const res = await api.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },
  deleteUser: async (userId: string): Promise<any> => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  }
};

export const subscriptionService = {
  getPlans: async (): Promise<{ plans: SubscriptionPlan[] }> => {
    const res = await api.get<{ plans: SubscriptionPlan[] }>('/subscription/plans');
    return res.data;
  },
  getStatus: async (): Promise<SubscriptionStatus> => {
    const res = await api.get<SubscriptionStatus>('/subscription/status');
    return res.data;
  },
  checkout: async (
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    paymentMethod = 'demo_card',
    email?: string,
    name?: string
  ): Promise<CheckoutResponse> => {
    const res = await api.post<CheckoutResponse>('/subscription/checkout', {
      plan_id: planId,
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
      email: email || undefined,
      name: name || undefined,
    });
    return res.data;
  },
  cancel: async (): Promise<{ success: boolean; message: string; tier: string }> => {
    const res = await api.post<{ success: boolean; message: string; tier: string }>('/subscription/cancel');
    return res.data;
  },
  getRazorpayConfig: async (): Promise<RazorpayConfig> => {
    const res = await api.get<RazorpayConfig>('/subscription/razorpay/config');
    return res.data;
  },
  createRazorpayOrder: async (
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    currency = 'INR',
    email?: string,
    name?: string
  ): Promise<RazorpayOrderResponse> => {
    const res = await api.post<RazorpayOrderResponse>('/subscription/razorpay/create-order', {
      plan_id: planId,
      billing_cycle: billingCycle,
      currency,
      email: email || undefined,
      name: name || undefined,
    });
    return res.data;
  },
  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    email?: string;
    name?: string;
  }): Promise<CheckoutResponse> => {
    const res = await api.post<CheckoutResponse>('/subscription/razorpay/verify-payment', data);
    return res.data;
  },
};

export const jobService = {
  getJobs: async (role?: string, remote?: boolean, minSalary?: number, search?: string): Promise<{ total: number; jobs: JobListing[] }> => {
    const params = new URLSearchParams();
    if (role && role !== 'All' && role !== 'all') params.append('role', role);
    if (remote !== undefined) params.append('work_mode', remote ? 'Remote' : 'Onsite');
    if (minSalary) params.append('min_salary', String(minSalary));
    if (search) params.append('search', search);
    const res = await api.get<JobListing[] | { total: number; jobs: JobListing[] }>(`/jobs?${params.toString()}`);
    const rawList: JobListing[] = Array.isArray(res.data) ? res.data : (res.data?.jobs || []);
    const jobs = rawList.map(j => ({
      ...j,
      skills: j.required_skills,
      match_score: j.match_score ?? 78,
    }));
    return { total: jobs.length, jobs };
  },
  matchJobs: async (skills: string[], targetRole?: string, minSalary?: number): Promise<{ total: number; matches: JobMatchResult[] }> => {
    const res = await api.post<JobMatchResult[] | { total: number; matches: JobMatchResult[] }>('/jobs/match', {
      candidate_skills: skills,
      target_role: targetRole,
      min_salary: minSalary,
    });
    const rawMatches: JobMatchResult[] = Array.isArray(res.data) ? res.data : (res.data?.matches || []);
    const matches = rawMatches.map(m => ({
      ...m,
      match_score: Math.round(m.match_percentage),
      matching_skills: m.matched_skills,
    }));
    return { total: matches.length, matches };
  },
};

export const negotiationService = {
  analyzeOffer: async (data: {
    company: string;
    role: string;
    level: string;
    base_salary: number;
    equity: number;
    sign_on: number;
    bonus: number;
    competing_offers?: number;
    years_experience?: number;
  }): Promise<OfferAnalysisResult> => {
    const res = await api.post<OfferAnalysisResult>('/negotiation/analyze', {
      company_name: data.company,
      job_role: data.role,
      level: data.level,
      base_salary: data.base_salary,
      equity_per_year: data.equity,
      sign_on_bonus: data.sign_on,
      annual_bonus_pct: data.base_salary > 0 ? (data.bonus / data.base_salary) * 100 : 0,
      has_competing_offer: (data.competing_offers || 0) > 0,
    });
    const raw = res.data;
    return {
      ...raw,
      total_comp: raw.total_annual_compensation,
      target_tc: Math.round(raw.total_annual_compensation + (raw.money_left_on_table || 15000)),
      offer_rating: raw.health_status,
      potential_upside: raw.money_left_on_table,
      recommendation: `This offer is rated ${raw.health_status}. You have an estimated +$${(raw.money_left_on_table / 1000).toFixed(0)}k in negotiation upside based on median and 75th percentile market data.`,
      market_benchmarks: {
        p25: Math.round(raw.market_median * 0.85),
        p50: raw.market_median,
        p75: raw.market_75th_percentile,
        p90: raw.market_90th_percentile,
      }
    };
  },
  generateCounter: async (data: {
    candidate_name: string;
    company: string;
    role: string;
    current_offer_tc: number;
    target_tc: number;
    strategy: 'competing_offer' | 'market_value' | 'equity_pivot' | 'remote_benefits';
    competing_details?: string;
    key_strengths?: string[];
  }): Promise<CounterOfferResponse> => {
    const offeredBase = Math.round(data.current_offer_tc * 0.7);
    const targetBase = Math.round(data.target_tc * 0.7);
    const res = await api.post<CounterOfferResponse>('/negotiation/generate-counter', {
      company_name: data.company,
      job_role: data.role,
      offered_base: offeredBase,
      target_base: targetBase,
      offered_equity: Math.round(data.current_offer_tc * 0.2),
      target_equity: Math.round(data.target_tc * 0.2),
      sign_on_bonus: 20000,
      strategy: data.strategy,
      candidate_name: data.candidate_name,
      key_achievements: data.key_strengths,
    });
    const raw = res.data;
    return {
      ...raw,
      subject_line: raw.email_subject,
      phone_talking_points: raw.phone_call_talking_points,
      objection_rebuttals: (raw.recruiter_pushback_rebuttals || []).map((r: any) => ({
        objection: r.recruiter_pushback || r.objection,
        response: r.suggested_verbiage || r.response,
      })),
    };
  },
};

export default api;
