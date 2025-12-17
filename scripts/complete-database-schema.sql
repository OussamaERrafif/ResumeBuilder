-- ============================================================================
-- ApexResume Complete Database Schema
-- Version: 1.0.0
-- ============================================================================
-- This script creates ALL tables required for the ApexResume application.
-- Run this in your Supabase SQL Editor.
-- 
-- IMPORTANT: Run this script in order. Tables are created with proper 
-- dependencies and foreign keys.
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES TABLE
-- Core user profile information linked to Supabase Auth
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  bio text,
  location text,
  website text,
  linkedin text,
  github text,
  twitter text,
  job_title text,
  company text,
  is_onboarded boolean DEFAULT false,
  referral_source text,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_expires timestamp with time zone,
  ai_credits integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- ============================================================================
-- 2. RESUMES TABLE
-- Stores user resumes with JSON data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Resume',
  template_id text DEFAULT 'classic',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_updated_at_idx ON public.resumes(updated_at DESC);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own resumes" ON public.resumes;
CREATE POLICY "Users can create own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
CREATE POLICY "Users can update own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;

-- ============================================================================
-- 3. COVER LETTERS TABLE
-- Stores user cover letters with optional resume link
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Cover Letter',
  resume_id uuid,
  job_title text,
  company_name text,
  job_description text,
  content text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cover_letters_pkey PRIMARY KEY (id),
  CONSTRAINT cover_letters_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT cover_letters_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON public.cover_letters(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_updated_at_idx ON public.cover_letters(updated_at DESC);

-- Enable RLS
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own cover letters" ON public.cover_letters;
CREATE POLICY "Users can view own cover letters" ON public.cover_letters
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own cover letters" ON public.cover_letters;
CREATE POLICY "Users can create own cover letters" ON public.cover_letters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cover letters" ON public.cover_letters;
CREATE POLICY "Users can update own cover letters" ON public.cover_letters
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cover letters" ON public.cover_letters;
CREATE POLICY "Users can delete own cover letters" ON public.cover_letters
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.cover_letters TO authenticated;
GRANT ALL ON public.cover_letters TO service_role;

-- ============================================================================
-- 4. NOTIFICATION SETTINGS TABLE
-- User notification preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  feature_updates boolean NOT NULL DEFAULT true,
  security_alerts boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_settings_pkey PRIMARY KEY (id),
  CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS notification_settings_user_id_idx ON public.notification_settings(user_id);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notification_settings;
CREATE POLICY "Users can view own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;
CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notification_settings;
CREATE POLICY "Users can update own notification settings" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notification settings" ON public.notification_settings;
CREATE POLICY "Users can delete own notification settings" ON public.notification_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.notification_settings TO authenticated;
GRANT ALL ON public.notification_settings TO service_role;

-- ============================================================================
-- 5. USER PREFERENCES TABLE
-- User app preferences (theme, language, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'UTC',
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  date_format text NOT NULL DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;

-- ============================================================================
-- 6. SECURITY SETTINGS TABLE
-- User security preferences and login sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.security_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  last_password_change timestamp with time zone,
  login_sessions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT security_settings_pkey PRIMARY KEY (id),
  CONSTRAINT security_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS security_settings_user_id_idx ON public.security_settings(user_id);

-- Enable RLS
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own security settings" ON public.security_settings;
CREATE POLICY "Users can view own security settings" ON public.security_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own security settings" ON public.security_settings;
CREATE POLICY "Users can insert own security settings" ON public.security_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own security settings" ON public.security_settings;
CREATE POLICY "Users can update own security settings" ON public.security_settings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own security settings" ON public.security_settings;
CREATE POLICY "Users can delete own security settings" ON public.security_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;

-- ============================================================================
-- 7. AI CREDITS USAGE TABLE
-- Tracks AI credit consumption
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_credits_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  credits_used integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_credits_usage_pkey PRIMARY KEY (id),
  CONSTRAINT ai_credits_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS ai_credits_usage_user_id_idx ON public.ai_credits_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_credits_usage_created_at_idx ON public.ai_credits_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_credits_usage_feature_idx ON public.ai_credits_usage(feature);
CREATE INDEX IF NOT EXISTS ai_credits_usage_user_created_idx ON public.ai_credits_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_credits_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own credit usage" ON public.ai_credits_usage;
CREATE POLICY "Users can view own credit usage" ON public.ai_credits_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credit usage" ON public.ai_credits_usage;
CREATE POLICY "Users can insert own credit usage" ON public.ai_credits_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON public.ai_credits_usage;
CREATE POLICY "Service role full access" ON public.ai_credits_usage
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT ON public.ai_credits_usage TO authenticated;
GRANT ALL ON public.ai_credits_usage TO service_role;

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to get monthly credit usage
CREATE OR REPLACE FUNCTION get_monthly_credit_usage(p_user_id uuid)
RETURNS TABLE(
  total_used integer,
  transaction_count integer,
  by_feature jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN credits_used > 0 THEN credits_used ELSE 0 END)::integer, 0) as total_used,
    COUNT(*)::integer as transaction_count,
    COALESCE(
      jsonb_object_agg(feature, feature_total) FILTER (WHERE feature IS NOT NULL),
      '{}'::jsonb
    ) as by_feature
  FROM (
    SELECT 
      acu.feature,
      SUM(CASE WHEN acu.credits_used > 0 THEN acu.credits_used ELSE 0 END) as feature_total
    FROM public.ai_credits_usage acu
    WHERE acu.user_id = p_user_id
      AND acu.created_at >= date_trunc('month', now())
      AND acu.credits_used > 0
    GROUP BY acu.feature
  ) subq;
END;
$$;

GRANT EXECUTE ON FUNCTION get_monthly_credit_usage(uuid) TO authenticated;

-- Function to safely deduct credits (atomic operation)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id uuid,
  p_feature text,
  p_credits integer,
  p_description text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  new_balance integer,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits integer;
  v_new_balance integer;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT ai_credits INTO v_current_credits
  FROM public.user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'User profile not found'::text;
    RETURN;
  END IF;

  IF v_current_credits < p_credits THEN
    RETURN QUERY SELECT false, v_current_credits, 'Insufficient credits'::text;
    RETURN;
  END IF;

  v_new_balance := v_current_credits - p_credits;

  -- Update credits
  UPDATE public.user_profiles
  SET ai_credits = v_new_balance,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Record usage
  INSERT INTO public.ai_credits_usage (user_id, feature, credits_used, description)
  VALUES (p_user_id, p_feature, p_credits, p_description);

  RETURN QUERY SELECT true, v_new_balance, NULL::text;
END;
$$;

GRANT EXECUTE ON FUNCTION deduct_credits(uuid, text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, text, integer, text) TO service_role;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_credits integer,
  p_feature text,
  p_description text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  new_balance integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance integer;
  v_max_credits integer;
  v_tier text;
BEGIN
  -- Get user tier to determine max credits
  SELECT subscription_tier INTO v_tier
  FROM public.user_profiles
  WHERE user_id = p_user_id;

  -- Set max credits based on tier
  v_max_credits := CASE v_tier
    WHEN 'premium' THEN 1000
    WHEN 'pro' THEN 200
    ELSE 10
  END;

  -- Update credits (capped at max)
  UPDATE public.user_profiles
  SET ai_credits = LEAST(ai_credits + p_credits, v_max_credits),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING ai_credits INTO v_new_balance;

  -- Record transaction (negative credits_used means credits added)
  INSERT INTO public.ai_credits_usage (user_id, feature, credits_used, description)
  VALUES (p_user_id, p_feature, -p_credits, p_description);

  RETURN QUERY SELECT true, v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION add_credits(uuid, integer, text, text) TO service_role;

-- ============================================================================
-- 9. TRIGGER: Auto-create user profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, ai_credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    10  -- Default free tier credits
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. STORAGE BUCKET: Avatars
-- ============================================================================
-- Note: Run this in Supabase Dashboard > Storage > Create New Bucket
-- Or use the SQL below:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 11. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.user_profiles IS 'Core user profile data linked to Supabase Auth';
COMMENT ON TABLE public.resumes IS 'User resumes stored as JSON data';
COMMENT ON TABLE public.cover_letters IS 'AI-generated cover letters linked to resumes';
COMMENT ON TABLE public.notification_settings IS 'User email/notification preferences';
COMMENT ON TABLE public.user_preferences IS 'User app preferences (theme, language, etc.)';
COMMENT ON TABLE public.security_settings IS 'User security settings and session history';
COMMENT ON TABLE public.ai_credits_usage IS 'Tracks AI credit consumption per user';

COMMENT ON COLUMN public.ai_credits_usage.feature IS 'AI feature used: resume_summary, resume_experience, resume_project, resume_analysis, ats_score, cover_letter_generation, cover_letter_improvement, resume_rewrite, job_match_analysis, interview_prep';
COMMENT ON COLUMN public.ai_credits_usage.credits_used IS 'Positive for usage, negative for credits added (purchases, bonuses)';

-- ============================================================================
-- DONE! Your database is now aligned with the ApexResume application.
-- ============================================================================
