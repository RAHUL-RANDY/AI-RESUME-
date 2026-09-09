export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscription_tier?: 'starter' | 'pro' | 'enterprise' | string;
  created_at?: string;
}

export interface SubscriptionPlan {
  id: 'starter' | 'pro' | 'enterprise' | string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  price_inr_monthly?: number;
  price_inr_yearly?: number;
  currency: string;
  symbol: string;
  symbol_inr?: string;
  description: string;
  badge: string;
  is_popular: boolean;
  features: string[];
  limits: {
    ats_scans: number;
    mentor_chats_daily: number;
    roadmap_allowed: boolean;
    recruiter_access: boolean;
  };
}

export interface SubscriptionStatus {
  user_id: string;
  subscription_tier: string;
  plan: SubscriptionPlan;
  status: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_end?: string | null;
  limits: SubscriptionPlan['limits'];
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  tier: string;
  billing_cycle: string;
  current_period_end: string;
  plan: SubscriptionPlan;
  access_token?: string | null;
  user?: User;
  payment_id?: string;
}

export interface RazorpayConfig {
  key_id: string;
  currency: string;
  is_test_mode: boolean;
}

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  amount_display: number;
  currency: string;
  key_id: string;
  plan_id: string;
  billing_cycle: string;
  plan_name: string;
  real_order_created: boolean;
}

export interface LLMStatusResponse {
  openai_configured: boolean;
  provider: string;
  model: string;
  key_preview: string | null;
  status: string;
}

export interface BulletRewriteResponse {
  metrics_focused: string;
  technical_focused: string;
  leadership_focused: string;
  key_improvements: string[];
}

export interface TailorSummaryResponse {
  summary: string;
  provider: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface EducationItem {
  degree: string;
  institution: string;
  graduation_year?: string;
  gpa?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration?: string;
  duration_years: number;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date?: string;
}

export interface ParsedResume {
  id?: string;
  user_id?: string;
  filename?: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  summary: string;
  education: EducationItem[];
  skills: string[];
  technical_skills: string[];
  soft_skills: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: string[];
  total_experience_years: number;
  raw_text: string;
  created_at?: string;
}

export interface ATSScoreBreakdown {
  keyword_match: number;
  skills_match: number;
  experience_relevance: number;
  education_match: number;
  structure_quality: number;
  formatting_readability: number;
}

export interface ATSScoreResponse {
  overall_score: number;
  breakdown: ATSScoreBreakdown;
  strengths: string[];
  deficiencies: string[];
  recommendations: string[];
  keyword_density: Record<string, number>;
}

export interface MatchResponse {
  match_score: number;
  similarity_percentage: number;
  matched_keywords: string[];
  missing_keywords: string[];
  summary_analysis: string;
}

export interface RadarAxisData {
  subject: string;
  candidate: number;
  requirement: number;
  fullMark: number;
}

export interface SkillGapResponse {
  matching_skills: string[];
  missing_skills: string[];
  optional_skills: string[];
  gap_percentage: number;
  coverage_score: number;
  radar_data: RadarAxisData[];
}

export interface FeatureContribution {
  feature: string;
  value: any;
  impact: number;
  description: string;
}

export interface EmployabilityPredictionResponse {
  employability_probability: number;
  is_employable: boolean;
  confidence_level: string;
  risk_assessment: string;
  top_contributing_features: FeatureContribution[];
}

export interface SalaryPredictionResponse {
  predicted_salary: number;
  salary_min: number;
  salary_max: number;
  currency: string;
  confidence_interval: string;
  top_contributing_features: FeatureContribution[];
}

export interface CourseItem {
  id: string;
  title: string;
  provider: string;
  url: string;
  rating: number;
  duration_hours: number;
  level: string;
  category?: string;
  target_role?: string;
  is_free?: boolean;
  price_display?: string;
  skills_covered: string[];
  relevance_score?: number;
}

export interface RecommendationResponse {
  recommended_courses: CourseItem[];
  total: number;
  free_count?: number;
  paid_count?: number;
  categories?: string[];
  roles?: string[];
}

export interface RoadmapMilestone {
  month: number;
  title: string;
  focus_skills: string[];
  goal: string;
  action_items: string[];
  projects_to_build: string[];
  recommended_certifications: string[];
}

export interface RoadmapResponse {
  user_id?: string;
  target_role: string;
  estimated_duration_months: number;
  milestones: RoadmapMilestone[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MentorChatResponse {
  reply: string;
  suggested_followups: string[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  context: string;
  key_evaluation_points: string[];
  suggested_structure: string;
}

export interface InterviewQuestionsResponse {
  target_role: string;
  questions: InterviewQuestion[];
}

export interface CandidateSummary {
  id: string;
  name: string;
  email: string;
  target_role: string;
  ats_score: number;
  match_score: number;
  employability_prob: number;
  predicted_salary: number;
  experience_years: number;
  top_skills: string[];
  uploaded_at: string;
}

export interface AdminSystemStats {
  total_users: number;
  total_candidates: number;
  total_recruiters: number;
  total_resumes_analyzed: number;
  employability_model_status: string;
  salary_model_status: string;
  nlp_models_loaded: boolean;
}
