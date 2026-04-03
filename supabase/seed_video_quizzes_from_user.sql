-- Seed quizzes provided by user for first and second video
-- Prerequisite: tables public.video_quiz_questions and public.video_quiz_options already exist
-- This script replaces quiz questions for the first 2 videos (ordered by created_at)

do $$
declare
  v1 uuid;
  v2 uuid;
  qid uuid;
begin
  select id into v1 from public.videos order by created_at asc limit 1;
  select id into v2 from public.videos order by created_at asc offset 1 limit 1;

  if v1 is null or v2 is null then
    raise exception 'Need at least 2 videos in public.videos before seeding quizzes.';
  end if;

  -- Clean existing quizzes for first two videos
  delete from public.video_quiz_options
  where question_id in (
    select id from public.video_quiz_questions where video_id in (v1, v2)
  );

  delete from public.video_quiz_questions
  where video_id in (v1, v2);

  -- =========================================================
  -- VIDEO 1 QUIZZES
  -- =========================================================

  -- Quiz 1 - Q1
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Que faut-il utiliser pour desinfecter les mains sans eau ?',
    'وش نستعملو لتعقيم اليدين بلا ماء؟',
    'La friction hydroalcoolique est la bonne methode.',
    'الجل الكحولي هو الطريقة الصحيحة للتعقيم بدون ماء.',
    1
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Eau seulement', 'الماء فقط', false, 1),
    (qid, 'Gel hydroalcoolique', 'الجل الكحولي (friction hydroalcoolique)', true, 2),
    (qid, 'Lingettes seulement', 'المناديل فقط', false, 3);

  -- Quiz 1 - Q2
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Quelle quantite de gel faut-il mettre ?',
    'شحال نحطو من الجل؟',
    'Il faut une quantite suffisante pour couvrir toutes les surfaces de la main.',
    'لازم كمية كافية باش تغطي كامل اليد.',
    2
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Une toute petite goutte', 'نقطة صغيرة بزاف', false, 1),
    (qid, 'Quantite suffisante (taille pois ou plus)', 'كمية كافية (قد حبة حمص ولا أكثر)', true, 2),
    (qid, 'Tres peu de gel', 'ما نحطوش بزاف', false, 3);

  -- Quiz 1 - Q3
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Que faire juste apres avoir mis le gel ?',
    'واش نديرو بعد ما نحطو الجل؟',
    'Il faut bien frotter les mains.',
    'لازم نفركو اليدين مليح.',
    3
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Laver avec de l eau', 'نغسلو بالماء', false, 1),
    (qid, 'Bien frotter les mains', 'نفركو اليدين مليح', true, 2),
    (qid, 'Le laisser sans frotter', 'نخليوه بلا فرك', false, 3);

  -- Quiz 1 - Q4
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Combien de temps dure la desinfection ?',
    'شحال تدوم عملية التعقيم؟',
    'Le temps recommande est 20 a 30 secondes.',
    'المدة الصحيحة هي 20 إلى 30 ثانية.',
    4
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, '5 secondes', '5 ثواني', false, 1),
    (qid, '10 secondes', '10 ثواني', false, 2),
    (qid, '20 a 30 secondes', '20 إلى 30 ثانية', true, 3);

  -- Quiz 1 - Q5
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Quand le gel seche, que faut-il faire ?',
    'كي ينشف الجل، واش نديرو؟',
    'On le laisse secher tout seul.',
    'نخليوه ينشف وحدو.',
    5
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Laver avec de l eau', 'نغسلو بالماء', false, 1),
    (qid, 'Le laisser secher tout seul', 'نخليوه ينشف وحدو', true, 2),
    (qid, 'Secher avec serviette', 'ننشفوه بالمنشفة', false, 3);

  -- Quiz 2 (Vrai/Faux) - Q6
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Il faut bien frotter les pouces pendant la desinfection.',
    'لازم نفركو الإبهام مليح.',
    'C est vrai, toutes les zones doivent etre frottees.',
    'صحيح، لازم نفركو كل أجزاء اليد.',
    6
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Vrai', 'صح', true, 1),
    (qid, 'Faux', 'خطأ', false, 2);

  -- Quiz 2 - Q7
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Il faut laver les mains juste apres le gel.',
    'نغسلو يدينا بعد الجل مباشرة.',
    'C est faux, on laisse le gel secher sans eau.',
    'خطأ، ما نغسلوش بالماء بعد الجل.',
    7
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Vrai', 'صح', false, 1),
    (qid, 'Faux', 'خطأ', true, 2);

  -- Quiz 2 - Q8
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Les microbes peuvent se cacher sous les ongles.',
    'الميكروبات يقدرو يكونو تحت الأظافر.',
    'C est vrai, il faut bien frotter autour des ongles.',
    'صحيح، لازم تنظيف منطقة الأظافر مليح.',
    8
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Vrai', 'صح', true, 1),
    (qid, 'Faux', 'خطأ', false, 2);

  -- Quiz 2 - Q9
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Il n est pas important de frotter entre les doigts.',
    'ماشي لازم نفركو بين الصوابع.',
    'C est faux, il faut frotter entre les doigts.',
    'خطأ، الفرك بين الصوابع مهم جدا.',
    9
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Vrai', 'صح', false, 1),
    (qid, 'Faux', 'خطأ', true, 2);

  -- Quiz 2 - Q10
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'La desinfection dure seulement quelques secondes.',
    'التعقيم يدوم غير ثواني قليلة.',
    'C est faux, la duree correcte est 20 a 30 secondes.',
    'خطأ، المدة الصحيحة 20 إلى 30 ثانية.',
    10
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Vrai', 'صح', false, 1),
    (qid, 'Faux', 'خطأ', true, 2);

  -- Quiz 3 (Complete la phrase) - Q11
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Complete: On met ______ dans les mains.',
    'كمل الجملة: نحطو ______ في يدينا.',
    'La bonne reponse est le gel hydroalcoolique.',
    'الإجابة الصحيحة: الجل الكحولي.',
    11
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Gel hydroalcoolique', 'الجل الكحولي', true, 1),
    (qid, 'Eau froide', 'الماء البارد', false, 2),
    (qid, 'Savon uniquement', 'الصابون فقط', false, 3);

  -- Quiz 3 - Q12
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Complete: On frotte entre les ______.',
    'كمل الجملة: نفركو بين ______ الصوابع.',
    'La bonne reponse est entre les doigts.',
    'الإجابة الصحيحة: بين الصوابع.',
    12
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Doigts', 'الصوابع', true, 1),
    (qid, 'Coudes', 'الأكواع', false, 2),
    (qid, 'Epaules', 'الأكتاف', false, 3);

  -- Quiz 3 - Q13
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Complete: On ne lave pas les mains avec ______ apres le gel.',
    'كمل الجملة: ما نغسلوش يدينا بـ ______ بعد الجل.',
    'La bonne reponse est eau.',
    'الإجابة الصحيحة: الماء.',
    13
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Eau', 'الماء', true, 1),
    (qid, 'Gel', 'الجل', false, 2),
    (qid, 'Air', 'الهواء', false, 3);

  -- Quiz 3 - Q14
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Complete: On laisse le gel ______ tout seul.',
    'كمل الجملة: نخلو الجل ______ وحدو.',
    'La bonne reponse est secher.',
    'الإجابة الصحيحة: ينشف.',
    14
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Secher', 'ينشف', true, 1),
    (qid, 'Bouillir', 'يغلي', false, 2),
    (qid, 'Geler', 'يتجمد', false, 3);

  -- Quiz 3 - Q15
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Complete: La duree est ______ secondes.',
    'كمل الجملة: المدة تكون ______ ثانية.',
    'La bonne reponse est 20 a 30 secondes.',
    'الإجابة الصحيحة: 20 إلى 30 ثانية.',
    15
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, '20 a 30', '20 إلى 30', true, 1),
    (qid, '5', '5', false, 2),
    (qid, '10', '10', false, 3);

  -- Quiz 4 (Order steps) - Q16
  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v1,
    'Quel est le bon ordre ? Mettre le gel, frotter les mains, laisser secher.',
    'شنو الترتيب الصحيح؟ نحطو الجل، نفركو اليدين، نخلوه ينشف.',
    'On met le gel, puis on frotte, puis on laisse secher.',
    'الترتيب: نحطو الجل ثم نفركو ثم نخلوه ينشف.',
    16
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Frotter -> Mettre gel -> Secher', 'نفركو -> نحطو الجل -> ينشف', false, 1),
    (qid, 'Mettre gel -> Frotter -> Secher', 'نحطو الجل -> نفركو -> نخلوه ينشف', true, 2),
    (qid, 'Secher -> Mettre gel -> Frotter', 'ينشف -> نحطو الجل -> نفركو', false, 3);

  -- =========================================================
  -- VIDEO 2 QUIZ (from user content)
  -- =========================================================

  insert into public.video_quiz_questions (
    video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order
  ) values (
    v2,
    'Pourquoi faut-il laver les mains ?',
    'علاش لازم نغسلو يدينا؟',
    'Le lavage des mains aide a prevenir les microbes et les maladies.',
    'غسل اليدين يمنع الميكروبات والأمراض.',
    1
  ) returning id into qid;

  insert into public.video_quiz_options (question_id, option_fr, option_ar, is_correct, sort_order) values
    (qid, 'Pour refroidir les mains', 'باش نبردو يدينا', false, 1),
    (qid, 'Pour prevenir microbes et maladies', 'باش نمنعوا الميكروبات والأمراض', true, 2),
    (qid, 'Seulement quand elles sont sales', 'غير كي يكونو وسخين', false, 3);

end $$;

-- Verify seeded data
select v.title_fr, q.sort_order, q.question_ar
from public.video_quiz_questions q
join public.videos v on v.id = q.video_id
where q.video_id in (
  select id from public.videos order by created_at asc limit 2
)
order by v.created_at asc, q.sort_order asc;
