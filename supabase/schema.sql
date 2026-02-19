-- -- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- --- Users & Profiles ---

-- -- Create a table for public profiles (extends auth.users)
-- CREATE TABLE public.profiles (
--   id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
--   email TEXT UNIQUE,
--   full_name TEXT,
--   avatar_url TEXT,
--   role TEXT CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- -- Enable RLS
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -- Policies for profiles
-- CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
--   FOR SELECT USING (true);

-- CREATE POLICY "Users can update their own profile" ON public.profiles
--   FOR UPDATE USING (auth.uid() = id);

-- -- --- Patients & Doctors ---

-- CREATE TABLE public.doctors (
--   id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
--   specialization TEXT,
--   bio_fr TEXT,
--   bio_ar TEXT,
--   available_hours JSONB, -- store availability as JSON
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Doctors are viewable by everyone" ON public.doctors
--   FOR SELECT USING (true); -- Patients need to see doctor details

-- CREATE POLICY "Doctors can update their own details" ON public.doctors
--   FOR UPDATE USING (auth.uid() = id);


-- CREATE TABLE public.patients (
--   id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
--   date_of_birth DATE,
--   dialysis_type TEXT CHECK (dialysis_type IN ('HD', 'PD')),
--   status TEXT CHECK (status IN ('active', 'recovering', 'critical')) DEFAULT 'active',
--   assigned_doctor_id UUID REFERENCES public.doctors(id),
--   registration_date TIMESTAMPTZ DEFAULT NOW(),
--   address TEXT,
--   emergency_contact TEXT,
--   medical_history TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Patients view their own data" ON public.patients
--   FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Doctors view their assigned patients" ON public.patients
--   FOR SELECT USING (auth.uid() IN (
--     SELECT assigned_doctor_id FROM public.patients WHERE id = patients.id
--   ));
  
-- -- --- Dialysis Sessions ---

-- CREATE TABLE public.dialysis_sessions (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
--   date DATE NOT NULL,
--   duration_minutes INTEGER,
--   weight_before NUMERIC(5, 2),
--   weight_after NUMERIC(5, 2),
--   blood_pressure TEXT,
--   complications TEXT,
--   notes TEXT,
--   status TEXT CHECK (status IN ('completed', 'scheduled', 'missed')) DEFAULT 'scheduled',
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.dialysis_sessions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Patients view own sessions" ON public.dialysis_sessions
--   FOR SELECT USING (auth.uid() = patient_id);

-- CREATE POLICY "Doctors view their patients' sessions" ON public.dialysis_sessions
--   FOR SELECT USING (
--     EXISTS (SELECT 1 FROM public.patients WHERE id = dialysis_sessions.patient_id AND assigned_doctor_id = auth.uid())
--   );

-- -- --- Health Reports (Daily Check-ins) ---

-- CREATE TABLE public.health_reports (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
--   report_date DATE DEFAULT CURRENT_DATE,
--   mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
--   pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 4),
--   symptoms TEXT[], -- Array of strings e.g. ['fatigue', 'nausea']
--   duration_hours TEXT, -- from the form input
--   notes TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Patients create reports" ON public.health_reports
--   FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- CREATE POLICY "Patients view own reports" ON public.health_reports
--   FOR SELECT USING (auth.uid() = patient_id);

-- CREATE POLICY "Doctors view patients' reports" ON public.health_reports
--   FOR SELECT USING (
--     EXISTS (SELECT 1 FROM public.patients WHERE id = health_reports.patient_id AND assigned_doctor_id = auth.uid())
--   );

-- -- --- Educational Content (Videos) ---

-- CREATE TABLE public.videos (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   title_fr TEXT NOT NULL,
--   title_ar TEXT NOT NULL,
--   description_fr TEXT,
--   description_ar TEXT,
--   video_url TEXT,
--   thumbnail_url TEXT,
--   duration TEXT, -- formatted string e.g. "5:30"
--   category TEXT CHECK (category IN ('dialysis', 'hygiene', 'treatment')) NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Videos are public" ON public.videos
--   FOR SELECT USING (true);

-- -- Video Progress Tracking
-- CREATE TABLE public.video_progress (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
--   video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
--   progress_percentage INTEGER DEFAULT 0,
--   is_completed BOOLEAN DEFAULT FALSE,
--   last_watched_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(user_id, video_id)
-- );

-- ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users track their own progress" ON public.video_progress
--   FOR ALL USING (auth.uid() = user_id);

-- -- --- Games & Gamification ---

-- CREATE TABLE public.games (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   title_fr TEXT NOT NULL,
--   title_ar TEXT NOT NULL,
--   description_fr TEXT,
--   description_ar TEXT,
--   type TEXT CHECK (type IN ('educational', 'relaxation')),
--   difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
--   duration_minutes INTEGER,
--   icon_url TEXT,
--   color_theme TEXT,
--   game_url TEXT, -- Link to actual game implementation
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Games are public" ON public.games
--   FOR SELECT USING (true);


-- CREATE TABLE public.game_sessions (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
--   game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
--   score INTEGER DEFAULT 0,
--   duration_seconds INTEGER,
--   stars_earned INTEGER DEFAULT 0,
--   played_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users track their own games" ON public.game_sessions
--   FOR ALL USING (auth.uid() = user_id);

-- -- --- Chat Messages ---

-- CREATE TABLE public.chat_messages (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   sender_id UUID REFERENCES public.profiles(id) NOT NULL,
--   receiver_id UUID REFERENCES public.profiles(id) NOT NULL, -- Direct 1-to-1 chat for now
--   content TEXT NOT NULL,
--   status TEXT CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users see their own chats" ON public.chat_messages
--   FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- CREATE POLICY "Users can send messages" ON public.chat_messages
--   FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- -- --- Fun Facts / Educational Extras ---

-- CREATE TABLE public.fun_facts (
--   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--   fact_fr TEXT NOT NULL,
--   fact_ar TEXT NOT NULL,
--   emoji TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE public.fun_facts ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Fun facts are public" ON public.fun_facts
--   FOR SELECT USING (true);


-- -- Functions & Triggers (Optional: for handling complex logic like updating last_session on patient)

-- -- Function to handle new user creation
-- CREATE OR REPLACE FUNCTION public.handle_new_user() 
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, full_name, role)
--   VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'patient'));
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- Trigger for new user
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CREATE TYPE public.video_category AS ENUM ('dialysis', 'hygiene', 'treatment');
-- -- Videos
-- CREATE TABLE public.videos (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   title_fr TEXT NOT NULL,
--   title_ar TEXT NOT NULL,
--   description_fr TEXT DEFAULT '',
--   description_ar TEXT DEFAULT '',
--   duration TEXT NOT NULL DEFAULT '0:00',
--   category public.video_category NOT NULL DEFAULT 'dialysis',
--   thumbnail_url TEXT DEFAULT '',
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );
-- -- Video Progress
-- CREATE TABLE public.video_progress (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
--   progress INT NOT NULL DEFAULT 0,
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   UNIQUE (user_id, video_id)
-- );
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
CREATE POLICY "Doctors can view patient forms" ON public.health_forms FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor'));
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
