import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, CheckCircle, BookOpen, Sparkles, Heart } from 'lucide-react';
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
  thumbnail_url: string;
  video_url: string;
  progress?: number;
}

const EducationPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch all videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*');

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
          const formattedVideos = videosData.map((v: any) => ({
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
      emoji: '🫘',
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
                <Card key={video.id} className="overflow-hidden card-shadow hover:card-shadow-hover transition-all group cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
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
                  <span className="text-2xl">🫘</span>
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
