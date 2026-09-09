-- =========================================================================
-- AI Career Intelligence Platform - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =========================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin', 'job_seeker')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast user lookups by email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));

-- 2. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    target_role TEXT DEFAULT 'Software Engineer',
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    ats_score NUMERIC(5, 2) DEFAULT 0.00,
    ats_breakdown JSONB DEFAULT '{}'::jsonb,
    raw_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes (created_at DESC);

-- 3. ROADMAPS TABLE
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    timeline_weeks INTEGER NOT NULL DEFAULT 12,
    phases JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps (user_id);

-- 4. CANDIDATES TABLE (For Recruiter Dashboard)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    target_role TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    experience_years NUMERIC(4, 1) DEFAULT 0.0,
    ats_score NUMERIC(5, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Screening' CHECK (status IN ('Screening', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_candidates_ats_score ON public.candidates (ats_score DESC);

-- 5. INTERVIEWS / MOCK PREP TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    target_role TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    feedback JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- Row Level Security (RLS) Configuration
-- =========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Allow backend service role & public access (custom JWT / backend managed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Enable all for service and anon'
    ) THEN
        CREATE POLICY "Enable all for service and anon" ON public.users FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Enable all for service and anon'
    ) THEN
        CREATE POLICY "Enable all for service and anon" ON public.resumes FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'roadmaps' AND policyname = 'Enable all for service and anon'
    ) THEN
        CREATE POLICY "Enable all for service and anon" ON public.roadmaps FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Enable all for service and anon'
    ) THEN
        CREATE POLICY "Enable all for service and anon" ON public.candidates FOR ALL USING (true) WITH CHECK (true);
    END IF;

-- 6. SUBSCRIPTIONS TABLE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'starter';

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL DEFAULT 'starter' CHECK (plan_id IN ('starter', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT DEFAULT 'credit_card',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Enable all for service and anon'
    ) THEN
        CREATE POLICY "Enable all for service and anon" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;
