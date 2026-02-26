
-- =============================================
-- 1. CREATE ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE public.dialysis_type AS ENUM ('HD', 'PD');
CREATE TYPE public.patient_status AS ENUM ('active', 'recovering', 'critical');
CREATE TYPE public.session_status AS ENUM ('completed', 'scheduled', 'missed');
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE public.message_sender AS ENUM ('patient', 'doctor');

CREATE TYPE public.game_type AS ENUM ('educational', 'relaxation');
CREATE TYPE public.game_difficulty AS ENUM ('easy', 'medium', 'hard');

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name_ar TEXT NOT NULL DEFAULT '',
  name_fr TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles (separate table per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Doctors
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  specialization TEXT NOT NULL DEFAULT '',
  patient_count INT NOT NULL DEFAULT 0,
  active_sessions INT NOT NULL DEFAULT 0,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  age INT NOT NULL,
  dialysis_type public.dialysis_type NOT NULL DEFAULT 'HD',
  status public.patient_status NOT NULL DEFAULT 'active',
  assigned_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_session DATE,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  sender public.message_sender NOT NULL,
  message TEXT NOT NULL,
  status public.message_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dialysis Sessions
CREATE TABLE public.dialysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  duration INT NOT NULL DEFAULT 0,
  weight_before NUMERIC(5,2) DEFAULT 0,
  weight_after NUMERIC(5,2) DEFAULT 0,
  blood_pressure TEXT DEFAULT '',
  complications TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status public.session_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Health Forms
CREATE TABLE public.health_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  mood INT NOT NULL DEFAULT 3,
  pain_level INT NOT NULL DEFAULT 0,
  symptoms TEXT[] DEFAULT '{}',
  session_date DATE,
  session_duration INT,
  infused_quantity TEXT DEFAULT '',
  drained_quantity TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- Games
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- Added for component mapping
  title_fr TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  game_type public.game_type NOT NULL DEFAULT 'educational',
  difficulty public.game_difficulty NOT NULL DEFAULT 'easy',
  duration INT NOT NULL DEFAULT 5,
  icon TEXT DEFAULT '🎮',
  color TEXT DEFAULT 'playful-purple',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Videos
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  duration TEXT NOT NULL DEFAULT '0:00',
  category TEXT CHECK (category IN ('dialysis', 'hygiene', 'treatment')) NOT NULL DEFAULT 'dialysis',
  thumbnail_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Video Progress
CREATE TABLE public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Game Scores
CREATE TABLE public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  score INT NOT NULL DEFAULT 0,
  stars INT NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Summary
CREATE TABLE public.analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_patients INT NOT NULL DEFAULT 0,
  total_doctors INT NOT NULL DEFAULT 0,
  active_sessions INT NOT NULL DEFAULT 0,
  satisfaction_rate INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weekly Stats
CREATE TABLE public.weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_label TEXT NOT NULL,
  sessions_count INT NOT NULL DEFAULT 0
);

-- =============================================
-- 3. ENABLE RLS
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_stats ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. HELPER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =============================================
-- 5. RLS POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can view patient profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor'));

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Doctors
CREATE POLICY "Anyone authenticated can view doctors" ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors can update own profile" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can insert own profile" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Patients
CREATE POLICY "Patients can view own record" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Patients can update own record" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Patients can insert own record" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors can view assigned patients" ON public.patients FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins can manage patients" ON public.patients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Chat Messages
CREATE POLICY "Patients can view own messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));
CREATE POLICY "Patients can send messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can view their messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can send messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Dialysis Sessions
CREATE POLICY "Patients can view own sessions" ON public.dialysis_sessions FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can manage sessions" ON public.dialysis_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins can manage sessions" ON public.dialysis_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Health Forms
CREATE POLICY "Patients can view own forms" ON public.health_forms FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));
CREATE POLICY "Patients can submit forms" ON public.health_forms FOR INSERT TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));
CREATE POLICY "Doctors can view only their patients' forms" ON public.health_forms FOR SELECT TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE assigned_doctor_id IN (
        SELECT id FROM public.doctors 
        WHERE user_id = auth.uid()
      )
    )
  );
CREATE POLICY "Admins can view all forms" ON public.health_forms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Videos (public read for authenticated)
CREATE POLICY "Authenticated can view videos" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Games (public read for authenticated)
CREATE POLICY "Authenticated can view games" ON public.games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage games" ON public.games FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Video Progress
CREATE POLICY "Users can view own progress" ON public.video_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.video_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own progress" ON public.video_progress FOR UPDATE USING (auth.uid() = user_id);

-- Game Scores
CREATE POLICY "Users can view own scores" ON public.game_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics (admin only + authenticated read for summary)
CREATE POLICY "Authenticated can view analytics" ON public.analytics_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage analytics" ON public.analytics_summary FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view weekly stats" ON public.weekly_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage weekly stats" ON public.weekly_stats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name_fr, name_ar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
