-- Create the resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_id TEXT DEFAULT 'classic',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);

-- Create an index on updated_at for sorting
CREATE INDEX IF NOT EXISTS resumes_updated_at_idx ON public.resumes(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own resumes
CREATE POLICY "Users can only access their own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER handle_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
