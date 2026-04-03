import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Clock, CheckCircle, BookOpen, Sparkles, Heart, Trophy, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Video {
  id: string;
  title_fr: string;
  title_ar: string;
  description_fr: string;
  description_ar: string;
  duration: string;
  category: 'dialysis' | 'hygiene' | 'treatment';
  thumbnail_url?: string | null;
  video_url: string;
  progress?: number;
}

interface VideoQuizOption {
  id: string;
  question_id: string;
  option_fr: string;
  option_ar: string;
  is_correct: boolean;
  sort_order: number;
}

interface VideoQuizQuestion {
  id: string;
  video_id: string;
  question_fr: string;
  question_ar: string;
  explanation_fr: string | null;
  explanation_ar: string | null;
  sort_order: number;
  options: VideoQuizOption[];
}

const DEFAULT_VIDEO_THUMBNAIL = '/thumbnail.png';

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.includes('/watch')) {
        const videoId = parsedUrl.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      }

      if (parsedUrl.pathname.includes('/shorts/')) {
        const videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      }

      if (parsedUrl.pathname.includes('/embed/')) {
        return url;
      }
    }
  } catch {
    return '';
  }

  return '';
};

const EducationPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = React.useState(false);
  const [quizLoading, setQuizLoading] = React.useState(false);
  const [quizSubmitting, setQuizSubmitting] = React.useState(false);
  const [quizQuestions, setQuizQuestions] = React.useState<VideoQuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = React.useState<{ score: number; total: number } | null>(null);

  React.useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch all videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('id, title_fr, title_ar, description_fr, description_ar, duration, category, thumbnail_url, video_url');

        if (videosError) throw videosError;

        // Fetch user progress if user is logged in
        let progressMap: Record<string, number> = {};
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('video_progress')
            .select('video_id, progress_percentage')
            .eq('user_id', user.id);

          if (!progressError && progressData) {
            progressData.forEach(p => {
              progressMap[p.video_id] = p.progress_percentage;
            });
          }
        }

        // Combine data
        if (videosData) {
          const formattedVideos = videosData.map((v: Video) => ({
            ...v,
            progress: progressMap[v.id] || 0
          }));
          setVideos(formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user]);

  const funFacts = [
    {
      emoji: '🩸',
      factFr: 'Tes reins filtrent environ 180 litres de sang par jour !',
      factAr: 'كليتاك تنقي حوالي 180 لترًا من الدم يوميًا!',
    },
    {
      emoji: '💪',
      factFr: 'Chaque rein contient environ 1 million de petits filtres appelés néphrons.',
      factAr: 'كل كلية تحتوي على حوالي مليون فلتر صغير يسمى النيفرون.',
    },
    {
      emoji: '🌊',
      factFr: 'Tes reins produisent environ 1 à 2 litres d\'urine par jour.',
      factAr: 'كليتاك تنتجان حوالي 1 إلى 2 لتر من البول يوميًا.',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dialysis':
        return 'bg-primary/20 text-primary';
      case 'hygiene':
        return 'bg-playful-green/20 text-playful-green';
      case 'treatment':
        return 'bg-playful-purple/20 text-playful-purple';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dialysis':
        return language === 'ar' ? 'غسيل الكلى' : 'Dialyse';
      case 'hygiene':
        return language === 'ar' ? 'النظافة' : 'Hygiène';
      case 'treatment':
        return language === 'ar' ? 'العلاج' : 'Traitement';
      default:
        return category;
    }
  };

  const handleOpenVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const fetchQuizForVideo = React.useCallback(async (videoId: string) => {
    setQuizLoading(true);
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('video_quiz_questions')
        .select('id, video_id, question_fr, question_ar, explanation_fr, explanation_ar, sort_order')
        .eq('video_id', videoId)
        .order('sort_order', { ascending: true });

      if (questionsError) throw questionsError;

      const safeQuestions = (questionsData || []) as Omit<VideoQuizQuestion, 'options'>[];
      if (safeQuestions.length === 0) {
        setQuizQuestions([]);
        return;
      }

      const questionIds = safeQuestions.map((question) => question.id);
      const { data: optionsData, error: optionsError } = await supabase
        .from('video_quiz_options')
        .select('id, question_id, option_fr, option_ar, is_correct, sort_order')
        .in('question_id', questionIds)
        .order('sort_order', { ascending: true });

      if (optionsError) throw optionsError;

      const optionsByQuestion = new Map<string, VideoQuizOption[]>();
      (optionsData || []).forEach((option) => {
        const typedOption = option as VideoQuizOption;
        const existing = optionsByQuestion.get(typedOption.question_id) || [];
        existing.push(typedOption);
        optionsByQuestion.set(typedOption.question_id, existing);
      });

      const mergedQuiz = safeQuestions.map((question) => ({
        ...question,
        options: optionsByQuestion.get(question.id) || [],
      }));

      setQuizQuestions(mergedQuiz);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setQuizQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isVideoDialogOpen || !selectedVideo) {
      return;
    }

    fetchQuizForVideo(selectedVideo.id);
  }, [fetchQuizForVideo, isVideoDialogOpen, selectedVideo]);

  const handleVideoDialogChange = (open: boolean) => {
    setIsVideoDialogOpen(open);
    if (!open) {
      setSelectedVideo(null);
      setSelectedAnswers({});
      setQuizResult(null);
      setQuizQuestions([]);
    }
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!user || !selectedVideo || quizQuestions.length === 0) return;

    const allAnswered = quizQuestions.every((question) => !!selectedAnswers[question.id]);
    if (!allAnswered) return;

    const correctOptionByQuestion = new Map<string, string>();
    quizQuestions.forEach((question) => {
      const correctOption = question.options.find((option) => option.is_correct);
      if (correctOption) {
        correctOptionByQuestion.set(question.id, correctOption.id);
      }
    });

    const score = quizQuestions.reduce((sum, question) => {
      return sum + (selectedAnswers[question.id] === correctOptionByQuestion.get(question.id) ? 1 : 0);
    }, 0);

    const total = quizQuestions.length;

    setQuizSubmitting(true);
    try {
      const answerPayload = quizQuestions.map((question) => {
        const selectedOptionId = selectedAnswers[question.id];
        const selectedOption = question.options.find((option) => option.id === selectedOptionId);
        return {
          question_id: question.id,
          selected_option_id: selectedOptionId,
          is_correct: selectedOption?.is_correct || false,
        };
      });

      const { error: attemptError } = await supabase
        .from('video_quiz_attempts')
        .insert({
          user_id: user.id,
          video_id: selectedVideo.id,
          score,
          total_questions: total,
          percentage: Math.round((score / total) * 100),
          answers: answerPayload,
        });

      if (attemptError) throw attemptError;

      setQuizResult({ score, total });
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const selectedVideoEmbedUrl = React.useMemo(
    () => getYouTubeEmbedUrl(selectedVideo?.video_url || ''),
    [selectedVideo]
  );

  const isQuizComplete = quizQuestions.length > 0 && quizQuestions.every((question) => !!selectedAnswers[question.id]);
  const answeredCount = quizQuestions.filter((question) => !!selectedAnswers[question.id]).length;
  const quizProgressPercent = quizQuestions.length > 0 ? Math.round((answeredCount / quizQuestions.length) * 100) : 0;
  const correctOptionByQuestion = React.useMemo(() => {
    const map = new Map<string, string>();
    quizQuestions.forEach((question) => {
      const correctOption = question.options.find((option) => option.is_correct);
      if (correctOption) {
        map.set(question.id, correctOption.id);
      }
    });
    return map;
  }, [quizQuestions]);

  return (
    <DashboardLayout role="patient">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-playful-purple/20 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-playful-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('patient.education.title')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'تعلم واكتشف!' : 'Apprends et découvre !'}
            </p>
          </div>
        </div>

        {/* Video Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t('patient.education.videos')}
          </h2>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden card-shadow hover:card-shadow-hover transition-all group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenVideo(video)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenVideo(video);
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 flex items-center justify-center">
                    <img
                      src={video.thumbnail_url || DEFAULT_VIDEO_THUMBNAIL}
                      alt={language === 'ar' ? video.title_ar : video.title_fr}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-white fill-white" />
                    </div>
                    <Badge className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} ${getCategoryColor(video.category)}`}>
                      {getCategoryLabel(video.category)}
                    </Badge>
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {language === 'ar' ? video.title_ar : video.title_fr}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {language === 'ar' ? video.description_ar : video.description_fr}
                    </p>

                    {(video.progress || 0) > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {language === 'ar' ? 'التقدم' : 'Progression'}
                          </span>
                          <span className="font-medium text-foreground flex items-center gap-1">
                            {video.progress === 100 && <CheckCircle className="h-3 w-3 text-success" />}
                            {video.progress}%
                          </span>
                        </div>
                        <Progress value={video.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isVideoDialogOpen} onOpenChange={handleVideoDialogChange}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                {language === 'ar'
                  ? selectedVideo?.title_ar || ''
                  : selectedVideo?.title_fr || ''}
              </DialogTitle>
            </DialogHeader>

            <div className="w-full overflow-hidden rounded-lg bg-black">
              <div className="relative w-full pt-[56.25%]">
                {selectedVideoEmbedUrl ? (
                  <iframe
                    src={`${selectedVideoEmbedUrl}?autoplay=1&rel=0&modestbranding=1`}
                    title={language === 'ar' ? selectedVideo?.title_ar : selectedVideo?.title_fr}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80 px-4 text-center">
                    {language === 'ar'
                      ? 'رابط الفيديو غير صالح. يرجى التحقق من رابط يوتيوب.'
                      : 'Lien video invalide. Verifie le lien YouTube.'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-playful-yellow/30 bg-gradient-to-br from-playful-yellow/20 via-playful-orange/10 to-playful-pink/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-playful-orange" />
                    {language === 'ar' ? 'اختبار ممتع بعد الفيديو' : 'Mini quiz amusant apres la video'}
                  </h3>
                  {quizQuestions.length > 0 && (
                    <Badge className="bg-white/80 text-foreground border border-playful-orange/30">
                      {language === 'ar'
                        ? `${answeredCount} / ${quizQuestions.length} مجاب`
                        : `${answeredCount} / ${quizQuestions.length} repondu`}
                    </Badge>
                  )}
                </div>

                {quizQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Progress value={quizProgressPercent} className="h-2.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {quizQuestions.map((question, index) => {
                        const isAnswered = !!selectedAnswers[question.id];
                        return (
                          <span
                            key={question.id}
                            className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                              isAnswered
                                ? 'bg-playful-green/25 text-playful-green'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {quizLoading ? (
                <div className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'جار تحميل الاختبار...' : 'Chargement du quiz...'}
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'لا يوجد اختبار لهذا الفيديو حتى الآن.'
                    : 'Aucun quiz disponible pour cette video pour le moment.'}
                </div>
              ) : (
                <>
                  {quizQuestions.map((question, index) => (
                    <div key={question.id} className="rounded-xl border border-primary/15 bg-card/80 p-4 space-y-3 shadow-sm">
                      <p className="font-semibold text-foreground flex items-start gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span>{language === 'ar' ? question.question_ar : question.question_fr}</span>
                      </p>

                      <div className="space-y-2.5">
                        {question.options.map((option) => {
                          const isSelected = selectedAnswers[question.id] === option.id;
                          const isSubmitted = !!quizResult;
                          const isCorrect = correctOptionByQuestion.get(question.id) === option.id;
                          const showCorrect = isSubmitted && isCorrect;
                          const showWrong = isSubmitted && isSelected && !isCorrect;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectAnswer(question.id, option.id)}
                              disabled={isSubmitted}
                              className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all disabled:cursor-not-allowed ${
                                showCorrect
                                  ? 'border-playful-green bg-playful-green/15 text-foreground'
                                  : showWrong
                                    ? 'border-red-400 bg-red-500/10 text-foreground'
                                    : isSelected
                                      ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                                      : 'border-border hover:bg-muted/60 text-muted-foreground'
                              }`}
                            >
                              <span className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2">
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[11px] font-bold text-foreground">
                                    {String.fromCharCode(65 + option.sort_order - 1)}
                                  </span>
                                  <span>{language === 'ar' ? option.option_ar : option.option_fr}</span>
                                </span>
                                {showCorrect && <CheckCircle className="h-4 w-4 text-playful-green" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {quizResult && (language === 'ar' ? question.explanation_ar : question.explanation_fr) && (
                        <div className="rounded-md bg-playful-yellow/15 border border-playful-yellow/30 px-3 py-2 text-xs text-foreground">
                          <span className="font-semibold">
                            {language === 'ar' ? 'معلومة:' : 'Info:'}
                          </span>{' '}
                          {language === 'ar' ? question.explanation_ar : question.explanation_fr}
                        </div>
                      )}
                    </div>
                  ))}

                  {user ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {quizResult ? (
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-playful-orange" />
                            {language === 'ar'
                              ? `نتيجتك: ${quizResult.score} / ${quizResult.total}`
                              : `Ton score: ${quizResult.score} / ${quizResult.total}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ar'
                              ? `النسبة: ${Math.round((quizResult.score / quizResult.total) * 100)}%`
                              : `Pourcentage: ${Math.round((quizResult.score / quizResult.total) * 100)}%`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar'
                            ? 'أجب على كل الأسئلة ثم احفظ النتيجة.'
                            : 'Reponds a toutes les questions puis enregistre le resultat.'}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {quizResult && (
                          <Button type="button" variant="outline" onClick={handleResetQuiz}>
                            <RotateCcw className="h-4 w-4" />
                            {language === 'ar' ? 'إعادة المحاولة' : 'Recommencer'}
                          </Button>
                        )}

                        {!quizResult && (
                          <Button
                            type="button"
                            onClick={handleSubmitQuiz}
                            disabled={!isQuizComplete || quizSubmitting}
                          >
                            {quizSubmitting
                              ? language === 'ar' ? 'جار الحفظ...' : 'Enregistrement...'
                              : language === 'ar' ? 'حفظ النتيجة' : 'Enregistrer le score'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar'
                        ? 'سجل الدخول لحفظ نتيجتك في الاختبار.'
                        : 'Connecte-toi pour enregistrer ton score de quiz.'}
                    </p>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Fun Facts */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-playful-yellow" />
            {t('patient.education.funFacts')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {funFacts.map((fact, index) => (
              <Card key={index} className="bg-gradient-to-br from-playful-yellow/10 to-playful-orange/10 border-playful-yellow/20 card-shadow hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-4 block">{fact.emoji}</span>
                  <p className="text-foreground font-medium">
                    {language === 'ar' ? fact.factAr : fact.factFr}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Cards */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-playful-pink" />
            {language === 'ar' ? 'تعلم المزيد' : 'En savoir plus'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-shadow hover:card-shadow-hover transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🩸</span>
                  {language === 'ar' ? 'ما هي الكلى؟' : 'C\'est quoi les reins ?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {language === 'ar'
                    ? 'الكلى هما عضوان صغيران على شكل حبة الفاصوليا. يقومان بتنظيف دمك من السموم والماء الزائد!'
                    : 'Les reins sont deux petits organes en forme de haricot. Ils nettoient ton sang des toxines et de l\'eau en trop !'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow hover:card-shadow-hover transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  {language === 'ar' ? 'لماذا غسيل الكلى؟' : 'Pourquoi la dialyse ?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {language === 'ar'
                    ? 'عندما لا تستطيع الكلى العمل جيدًا، تساعد آلة غسيل الكلى في تنظيف دمك بدلاً منها!'
                    : 'Quand les reins ne peuvent pas bien travailler, la machine de dialyse aide à nettoyer ton sang à leur place !'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EducationPage;
