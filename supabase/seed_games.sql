-- Seed games data into public.games table
-- Also creates all tables required by StatisticsPage
-- Run this in your Supabase SQL Editor

-- Step 1: Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE public.game_type AS ENUM ('educational', 'relaxation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.game_difficulty AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Create the games table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
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

-- Step 3: Enable Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'games' AND policyname = 'Games are public'
  ) THEN
    EXECUTE 'CREATE POLICY "Games are public" ON public.games FOR SELECT USING (true)';
  END IF;
END $$;

-- Step 3b: Create game_scores table (used by StatisticsPage)
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  score INT NOT NULL DEFAULT 0,
  stars INT NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'game_scores' AND policyname = 'Users manage own scores'
  ) THEN
    EXECUTE 'CREATE POLICY "Users manage own scores" ON public.game_scores FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Step 3c: Create video_progress table (used by StatisticsPage)
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID NOT NULL,
  progress_percentage INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'video_progress' AND policyname = 'Users manage own progress'
  ) THEN
    EXECUTE 'CREATE POLICY "Users manage own progress" ON public.video_progress FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Step 4: Insert game data
INSERT INTO public.games (slug, title_fr, title_ar, description_fr, description_ar, game_type, difficulty, duration, icon, color)
VALUES
  (
    'health-quiz',
    'Quiz Santé',
    'اختبار الصحة',
    'Teste tes connaissances sur les reins',
    'اختبر معلوماتك عن الكلى',
    'educational',
    'easy',
    10,
    '🧠',
    'playful-purple'
  ),
  (
    'medicine-match',
    'Association Médicaments',
    'مطابقة الأدوية',
    'Associe les traitements aux symptômes',
    'طابق العلاجات بالأعراض',
    'educational',
    'hard',
    12,
    '💊',
    'playful-pink'
  ),
  (
    'memory-match',
    'Jeu de Mémoire',
    'لعبة الذاكرة',
    'Retourne les cartes pour trouver les paires',
    'اقلب البطاقات لتجد الأزواج',
    'relaxation',
    'easy',
    5,
    '🎴',
    'playful-orange'
  ),
  (
    'puzzle-garden',
    'Jardin Puzzle',
    'حديقة الألغاز',
    'Puzzles relaxants avec de jolies images',
    'ألغاز مريحة مع صور جميلة',
    'relaxation',
    'medium',
    8,
    '🧩',
    'playful-green'
  ),
  (
    'breathing-buddy',
    'Ami Respiration',
    'صديق التنفس',
    'Exercices de relaxation guidés',
    'تمارين استرخاء موجهة',
    'relaxation',
    'easy',
    5,
    '🌬️',
    'playful-purple'
  ),
  (
    'water-balance',
    'Équilibre d''Eau',
    'توازن الماء',
    'Apprends à gérer ton hydratation',
    'تعلم كيف تدير شربك للماء',
    'educational',
    'medium',
    10,
    '💧',
    'playful-orange'
  )
ON CONFLICT (slug) DO NOTHING;
