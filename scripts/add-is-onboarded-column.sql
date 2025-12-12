-- Add is_onboarded column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Update existing users to be onboarded (optional, depending on requirements, but safer to assume existing users are onboarded or let them go through it)
-- For this implementation, we'll leave them as false so they see the onboarding screen, or we could set them to true if we assume they are legacy users.
-- Let's set existing users to true to avoid disrupting them.
UPDATE public.user_profiles SET is_onboarded = TRUE WHERE is_onboarded IS FALSE;
