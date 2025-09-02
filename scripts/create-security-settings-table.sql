-- Create security_settings table
CREATE TABLE security_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  login_sessions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for security_settings
CREATE POLICY "Users can view own security settings" ON security_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" ON security_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security settings" ON security_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own security settings" ON security_settings
  FOR DELETE USING (auth.uid() = user_id);
