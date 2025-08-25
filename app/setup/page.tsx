"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Copy } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SetupPage() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const SQL_SCRIPT = `-- Create the cover_letters table in your Supabase SQL Editor:

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
    EXECUTE FUNCTION public.handle_updated_at();`

  useEffect(() => {
    checkTableStatus()
  }, [])

  const checkTableStatus = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('cover_letters')
        .select('id')
        .limit(1)

      if (error) {
        if (error.message?.includes('does not exist') || error.code === 'PGRST106') {
          setTableExists(false)
        } else {
          setError(error.message)
        }
      } else {
        setTableExists(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT)
      alert('SQL script copied to clipboard!')
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Checking database status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Database Setup Status</h1>
          <p className="text-muted-foreground">Cover Letters Feature Setup</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tableExists ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Cover Letters Table Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tableExists ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Cover letters table exists and is ready to use! You can now use the cover letters feature.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ Cover letters table does not exist. Please create it using the SQL script below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="font-semibold">Setup Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to your <strong>Supabase project dashboard</strong></li>
                    <li>Navigate to the <strong>SQL Editor</strong> tab</li>
                    <li>Copy the SQL script below</li>
                    <li>Paste it in a new query and click <strong>Run</strong></li>
                    <li>Refresh this page to verify the setup</li>
                  </ol>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">SQL Script:</h4>
                    <Button onClick={copyToClipboard} size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                    {SQL_SCRIPT}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Error: {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={checkTableStatus} variant="outline">
            Recheck Status
          </Button>
          {tableExists && (
            <Button onClick={() => window.location.href = '/cover-letters'}>
              Go to Cover Letters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
