-- Video quiz schema + seed data
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- 1) Quiz questions per video
create table if not exists public.video_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  question_fr text not null,
  question_ar text not null,
  explanation_fr text,
  explanation_ar text,
  sort_order int not null default 1,
  created_at timestamptz not null default now(),
  unique (video_id, sort_order)
);

-- 2) Quiz options per question
create table if not exists public.video_quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.video_quiz_questions(id) on delete cascade,
  option_fr text not null,
  option_ar text not null,
  is_correct boolean not null default false,
  sort_order int not null default 1,
  unique (question_id, sort_order)
);

-- 3) User attempts (saved results)
create table if not exists public.video_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  score int not null,
  total_questions int not null,
  percentage int not null,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_video_quiz_questions_video_id on public.video_quiz_questions(video_id);
create index if not exists idx_video_quiz_options_question_id on public.video_quiz_options(question_id);
create index if not exists idx_video_quiz_attempts_user_id on public.video_quiz_attempts(user_id);
create index if not exists idx_video_quiz_attempts_video_id on public.video_quiz_attempts(video_id);

-- 4) RLS
alter table public.video_quiz_questions enable row level security;
alter table public.video_quiz_options enable row level security;
alter table public.video_quiz_attempts enable row level security;

-- Read policies for authenticated users

drop policy if exists "Authenticated can view video quiz questions" on public.video_quiz_questions;
create policy "Authenticated can view video quiz questions"
on public.video_quiz_questions
for select
to authenticated
using (true);

drop policy if exists "Authenticated can view video quiz options" on public.video_quiz_options;
create policy "Authenticated can view video quiz options"
on public.video_quiz_options
for select
to authenticated
using (true);

-- Attempt policies (users can only access their own attempts)

drop policy if exists "Users can view own video quiz attempts" on public.video_quiz_attempts;
create policy "Users can view own video quiz attempts"
on public.video_quiz_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own video quiz attempts" on public.video_quiz_attempts;
create policy "Users can insert own video quiz attempts"
on public.video_quiz_attempts
for insert
to authenticated
with check (auth.uid() = user_id);

-- 5) Seed example quizzes for first two videos in your table
-- If you already have custom quizzes, skip this section.

do $$
declare
  v1 uuid;
  v2 uuid;
  q1 uuid;
  q2 uuid;
begin
  select id into v1 from public.videos order by created_at asc limit 1;
  select id into v2 from public.videos order by created_at asc offset 1 limit 1;

  if v1 is not null then
    insert into public.video_quiz_questions (
      video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
    ) values (
      v1,
      'Quel est le role principal de la dialyse ?',
      'ما هو الدور الرئيسي لغسيل الكلى؟',
      'La dialyse aide a nettoyer le sang quand les reins ne filtrent pas bien.',
      'يساعد غسيل الكلى على تنظيف الدم عندما لا تعمل الكلى بشكل جيد.',
      1
    )
    on conflict (video_id, sort_order) do update set
      question_fr = excluded.question_fr,
      question_ar = excluded.question_ar,
      explanation_fr = excluded.explanation_fr,
      explanation_ar = excluded.explanation_ar
    returning id into q1;

    if q1 is null then
      select id into q1 from public.video_quiz_questions where video_id = v1 and sort_order = 1;
    end if;

    insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order)
    values
      (q1, 'Nettoyer le sang', 'تنظيف الدم', true, 1),
      (q1, 'Colorer le sang', 'تلوين الدم', false, 2),
      (q1, 'Changer la couleur des reins', 'تغيير لون الكلى', false, 3)
    on conflict (question_id, sort_order) do update set
      option_fr = excluded.option_fr,
      option_ar = excluded.option_ar,
      is_correct = excluded.is_correct;
  end if;

  if v2 is not null then
    insert into public.video_quiz_questions (
      video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
    ) values (
      v2,
      'Combien de reins avons-nous normalement ?',
      'كم عدد الكلى التي نملكها عادة؟',
      'En general, nous avons deux reins.',
      'عادة نملك كليتين.',
      1
    )
    on conflict (video_id, sort_order) do update set
      question_fr = excluded.question_fr,
      question_ar = excluded.question_ar,
      explanation_fr = excluded.explanation_fr,
      explanation_ar = excluded.explanation_ar
    returning id into q2;

    if q2 is null then
      select id into q2 from public.video_quiz_questions where video_id = v2 and sort_order = 1;
    end if;

    insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order)
    values
      (q2, 'Un seul rein', 'كلية واحدة', false, 1),
      (q2, 'Deux reins', 'كليتان', true, 2),
      (q2, 'Quatre reins', 'أربع كلى', false, 3)
    on conflict (question_id, sort_order) do update set
      option_fr = excluded.option_fr,
      option_ar = excluded.option_ar,
      is_correct = excluded.is_correct;
  end if;
end $$;

-- 6) Verify
select id, video_id, question_fr, sort_order from public.video_quiz_questions order by created_at asc;
select id, question_id, option_fr, is_correct, sort_order from public.video_quiz_options order by question_id, sort_order;
