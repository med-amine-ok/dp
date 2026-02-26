import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import AssignDoctorCard from '@/components/AssignDoctorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, MessageCircle, Gamepad2, Heart, Star, UserCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { link } from 'fs/promises';

const PatientDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    videos: 0,
    games: 0,
    stars: 0,
  });

  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // 1. Video Progress
        const { count: videoCount } = await supabase
          .from('video_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 2. Game Scores & Stars
        const { data: gameData } = await supabase
          .from('game_scores')
          .select('stars')
          .eq('user_id', user.id);

        const gameCount = gameData?.length || 0;
        const totalStars = gameData?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;

        setStats({
          videos: videoCount || 0,
          games: gameCount,
          stars: totalStars,
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();

    // Check profile completeness
    const checkProfile = async () => {
      const { data } = await supabase
        .from('patients')
        .select('age, dialysis_type, status')
        .eq('user_id', user.id)
        .single();
      if (data) {
        const complete = data.age > 0 && !!data.dialysis_type && !!data.status;
        setProfileComplete(complete);
      }
    };
    checkProfile();
  }, [user]);

  const quickLinks = [
    {
      title: language === 'ar' ? 'التعليم' : 'Éducation',
      description: language === 'ar' ? 'تعلم عن صحتك' : 'Apprends sur ta santé',
      icon: BookOpen,
      path: '/patient/education',
      color: 'bg-playful-purple/20 text-playful-purple',
    },
    {
      title: language === 'ar' ? 'نموذج الصحة' : 'Formulaire de santé',
      description: language === 'ar' ? 'كيف تشعر اليوم؟' : 'Comment te sens-tu ?',
      icon: FileText,
      path: '/patient/health-form',
      color: 'bg-playful-green/20 text-playful-green',
    },
    {
      title: language === 'ar' ? 'الدردشة' : 'Chat',
      description: language === 'ar' ? 'تحدث مع طبيبك' : 'Parle à ton médecin',
      icon: MessageCircle,
      path: '/patient/chat',
      color: 'bg-primary/20 text-primary',
    },
    {
      title: language === 'ar' ? 'الألعاب' : 'Jeux',
      description: language === 'ar' ? 'العب وتعلم!' : 'Joue et apprends !',
      icon: Gamepad2,
      path: '/patient/games',
      color: 'bg-playful-orange/20 text-playful-orange',
    },
  ];

  return (
    <DashboardLayout role="patient">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-gradient-to-br from-secondary/80 to-accent/70 rounded-3xl p-4 md:p-5 card-shadow border border-border/60">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {t('patient.welcome')}, 
            </h1>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {user?.name?.split('  ') || 'Friend'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('patient.howAreYou')}
            </p>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-medium text-foreground">
                {language === 'ar'
                  ? `${stats.stars} نجمة مكتسبة`
                  : `${stats.stars} étoiles gagnées`}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <AssignDoctorCard />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'روابط سريعة' : 'Accès rapide'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Card className="h-full hover:scale-[1.02] transition-all duration-200 card-shadow hover:card-shadow-hover cursor-pointer rounded-3xl interactive-lift">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${link.color} flex items-center justify-center shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5)]`}>
                      <link.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{link.title}</h3>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Tip */}
        <Card className="bg-gradient-to-r from-playful-pink/20 to-playful-purple/20 border-border/50 card-shadow rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              {language === 'ar' ? 'نصيحة اليوم' : 'Conseil du jour'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              {language === 'ar'
                ? 'اشرب الماء بانتظام! الماء يساعد كليتيك على العمل بشكل أفضل. 💧'
                : "Bois de l'eau régulièrement ! L'eau aide tes reins à bien fonctionner. 💧"}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
