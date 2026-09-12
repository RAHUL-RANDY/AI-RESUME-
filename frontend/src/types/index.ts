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
  target_role?: string;
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

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  work_mode: 'Remote' | 'Hybrid' | 'Onsite' | string;
  role_category: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  salary_display: string;
  logo_color: string;
  required_skills: string[];
  skills?: string[];
  description: string;
  apply_url: string;
  posted_days_ago: number;
  is_featured?: boolean;
  logo?: string;
  match_score?: number;
}

export interface JobMatchResult {
  job_id: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  fit_level: 'High Match' | 'Strong Match' | 'Moderate Fit' | string;
  job?: JobListing;
  match_score?: number;
  matching_skills?: string[];
}

export interface OfferAnalysisResult {
  total_annual_compensation: number;
  market_median: number;
  market_75th_percentile: number;
  market_90th_percentile: number;
  money_left_on_table: number;
  percentile_rank: number;
  leverage_score: number;
  health_status: string;
  breakdown_chart: Record<string, number>;
  // UI aliases
  total_comp?: number;
  target_tc?: number;
  offer_rating?: string;
  potential_upside?: number;
  recommendation?: string;
  market_benchmarks?: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

export interface CounterOfferResponse {
  email_subject: string;
  email_body: string;
  phone_call_talking_points: string[];
  recruiter_pushback_rebuttals: {
    recruiter_pushback: string;
    recommended_strategy: string;
    suggested_verbiage: string;
  }[];
  // UI aliases
  subject_line?: string;
  phone_talking_points?: string[];
  objection_rebuttals?: {
    objection: string;
    response: string;
  }[];
}

// 1. Coding & DSA Arena Types
export interface TestCase {
  input_str: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  category: string;
  acceptance_rate: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starter_code_python: string;
  starter_code_javascript: string;
  test_cases: TestCase[];
}

export interface TestResult {
  test_case_index: number;
  input_str: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface CodeEvaluationResponse {
  all_passed: boolean;
  passed_count: number;
  total_count: number;
  test_results: TestResult[];
  time_complexity: string;
  space_complexity: string;
  code_quality_score: number;
  ai_feedback: string;
  optimization_tips: string[];
  optimal_reference_code: string;
}

// 2. Portfolio Generator Types
export interface PortfolioProject {
  name: string;
  description: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
}

export interface PortfolioExperience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface PortfolioGenerateResponse {
  portfolio_slug: string;
  theme: string;
  html_bundle: string;
  stats: {
    skills_count: number;
    projects_count: number;
    theme: string;
    ready_for_download: boolean;
  };
}

// 3. Smart Application Answers Types
export interface ApplicationQuestion {
  id: string;
  category: string;
  question_text: string;
  intent: string;
  key_evaluation_factors: string[];
}

export interface AnswerGenerateResponse {
  question_id: string;
  company_name: string;
  tailored_answer: string;
  bullet_talking_points: string[];
  recruiter_green_flags: string[];
  red_flags_to_avoid: string[];
}

// 4. Timed Skill Assessment Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_option_index?: number;
  explanation?: string;
}

export interface TopicAssessment {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  difficulty: string;
  duration_minutes: number;
  questions_count: number;
}

export interface AssessmentResultResponse {
  topic_id: string;
  topic_title: string;
  candidate_name: string;
  score_percentage: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  percentile_rank: number;
  verification_badge_id: string;
  badge_title: string;
  detailed_feedback: {
    question_id: number;
    question: string;
    user_choice: number;
    correct_option_index: number;
    is_correct: boolean;
    explanation: string;
  }[];
}

// 5. ATS Score Optimizer & Resume Creator Types
export interface BoostBulletVariations {
  metrics_driven: string;
  leadership_driven: string;
  tech_systems_driven: string;
}

export interface BoostBulletResponse {
  original_bullet: string;
  variations: BoostBulletVariations;
  action_verbs_used: string[];
  predicted_ats_boost: number;
}

export interface AnalyzeATSResponse {
  ats_score: number;
  grade: string;
  metrics_count: number;
  action_verb_count: number;
  found_keywords: string[];
  missing_critical_keywords: string[];
  weak_phrases_detected: string[];
  improvements: string[];
}

export interface AutoBoostResponse {
  old_score: number;
  new_score: number;
  boost_delta: number;
  boosted_summary: string;
  boosted_skills: string;
  boosted_experiences: any[];
  boosted_projects: any[];
  keywords_injected: string[];
  improvements_applied: string[];
}

