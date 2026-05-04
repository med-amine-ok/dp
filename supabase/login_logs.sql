-- Create login_logs table to track user logins
CREATE TABLE public.login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all login logs
CREATE POLICY "Admins can view all login logs"
ON public.login_logs
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Allow system to insert login logs (authenticated users)
CREATE POLICY "Users can insert their own login logs"
ON public.login_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a view to easily get login counts per user
CREATE OR REPLACE VIEW public.user_login_counts AS
SELECT 
    l.user_id,
    p.name_fr,
    p.name_ar,
    p.email,
    p.avatar_url,
    COUNT(l.id) as login_count,
    MAX(l.login_time) as last_login
FROM 
    public.login_logs l
JOIN 
    public.profiles p ON l.user_id = p.user_id
GROUP BY 
    l.user_id, p.name_fr, p.name_ar, p.email, p.avatar_url;
