-- Add missing RLS policies to allow users to insert and update their own roles and profiles
-- Run this script in your Supabase SQL Editor

-- 1. User Roles Policies
-- Allow users to insert their own role (needed during registration/first login)
CREATE POLICY "Users can insert own roles" ON public.user_roles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Patients Policies
-- Allow patients to insert and update their own data
CREATE POLICY "Patients can insert own record" ON public.patients 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update own record" ON public.patients 
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Doctors Policies
-- Allow doctors to insert and update their own data
CREATE POLICY "Doctors can insert own profile" ON public.doctors 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile" ON public.doctors 
  FOR UPDATE USING (auth.uid() = user_id);
