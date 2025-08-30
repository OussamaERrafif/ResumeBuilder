/**
 * Database Setup Utility
 * 
 * This utility helps set up the cover_letters table in Supabase.
 * Run this script to check if the table exists and get setup instructions.
 */

import { supabase } from './supabase'

export async function checkCoverLettersTable() {
  try {
    // Try to query the cover_letters table
    const { error } = await supabase
      .from('cover_letters')
      .select('id')
      .limit(1)

    if (error) {
      if (error.message?.includes('does not exist') || error.code === 'PGRST106') {
        return {
          exists: false,
          message: 'Cover letters table does not exist. Please create it using the SQL script.',
          sqlScript: `
-- Create the cover_letters table in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_title TEXT,
    company_name TEXT,
    job_description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON public.cover_letters(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_resume_id_idx ON public.cover_letters(resume_id);
CREATE INDEX IF NOT EXISTS cover_letters_updated_at_idx ON public.cover_letters(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own cover letters
CREATE POLICY "Users can only access their own cover letters" ON public.cover_letters
    FOR ALL USING (auth.uid() = user_id);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER handle_cover_letters_updated_at
    BEFORE UPDATE ON public.cover_letters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
          `
        }
      }
      throw error
    }

    return {
      exists: true,
      message: 'Cover letters table exists and is ready to use!'
    }
  } catch (error) {
    return {
      exists: false,
      message: 'Error checking table status',
      error: error
    }
  }
}

// Function to test the connection and provide setup guidance
export async function setupGuidance() {
  const result = await checkCoverLettersTable()
  
  if (result.exists) {
    return true
  } else {
    return false
  }
}
