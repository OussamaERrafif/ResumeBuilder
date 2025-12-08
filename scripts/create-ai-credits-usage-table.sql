-- AI Credits Usage Table
-- This table tracks all AI credit usage and transactions

-- Create the ai_credits_usage table
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

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS ai_credits_usage_user_id_idx ON public.ai_credits_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_credits_usage_created_at_idx ON public.ai_credits_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_credits_usage_feature_idx ON public.ai_credits_usage(feature);
CREATE INDEX IF NOT EXISTS ai_credits_usage_user_created_idx ON public.ai_credits_usage(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_credits_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own credit usage
CREATE POLICY "Users can view own credit usage" ON public.ai_credits_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credit usage (for client-side tracking)
CREATE POLICY "Users can insert own credit usage" ON public.ai_credits_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON public.ai_credits_usage
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT ON public.ai_credits_usage TO authenticated;
GRANT ALL ON public.ai_credits_usage TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.ai_credits_usage IS 'Tracks AI credit usage and transactions for each user';
COMMENT ON COLUMN public.ai_credits_usage.feature IS 'The AI feature used (e.g., resume_summary, resume_analysis)';
COMMENT ON COLUMN public.ai_credits_usage.credits_used IS 'Positive for usage, negative for credits added (purchases, bonuses)';

-- Ensure user_profiles has ai_credits column with proper defaults
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'ai_credits'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN ai_credits integer DEFAULT 10;
  END IF;
END $$;

-- Update default for new users
ALTER TABLE public.user_profiles ALTER COLUMN ai_credits SET DEFAULT 10;

-- Create a function to get monthly credit usage
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
      feature,
      SUM(CASE WHEN credits_used > 0 THEN credits_used ELSE 0 END) as feature_total
    FROM public.ai_credits_usage
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('month', now())
      AND credits_used > 0
    GROUP BY feature
  ) subq;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_monthly_credit_usage(uuid) TO authenticated;

-- Create a function to safely deduct credits (atomic operation)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, text, integer, text) TO service_role;

-- Create a function to add credits
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

-- Grant execute permission (service role only for adding credits)
GRANT EXECUTE ON FUNCTION add_credits(uuid, integer, text, text) TO service_role;
