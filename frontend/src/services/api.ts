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
  TailorSummaryResponse
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

export default api;
