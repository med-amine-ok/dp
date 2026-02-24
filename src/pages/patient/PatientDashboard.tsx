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
        <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-secondary to-accent rounded-2xl p-8 card-shadow">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('patient.welcome')}, {user?.name?.split(' ')[0] || 'Friend'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('patient.howAreYou')}
            </p>
            <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
              <span className="text-2xl">🌟</span>
              <span className="text-sm font-medium text-foreground">
                {language === 'ar'
                  ? `${stats.stars} نجوم هذا الأسبوع!`
                  : `${stats.stars} étoiles cette semaine !`}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <AssignDoctorCard />
          </div>
        </div>

        {/* Profile Completion Banner */}
        {/* {profileComplete === false && (
          <Link to="/patient/profile">
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-6 py-4 hover:shadow-md transition-all duration-300 hover:scale-[1.005] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-amber-800 text-sm">
                    {language === 'ar' ? '⚠️ أكمل ملفك الشخصي' : '⚠️ Complétez votre profil'}
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    {language === 'ar'
                      ? 'أضف عمرك، نوع الغسيل، وحالتك الصحية'
                      : "Ajoutez votre âge, type de dialyse et état de santé"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm shrink-0">
                {language === 'ar' ? 'أكمل الآن' : 'Compléter'}
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )} */}

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title={language === 'ar' ? 'الفيديوهات' : 'Vidéos'}
            value={stats.videos.toString()}
            subtitle={language === 'ar' ? 'شاهدتها' : 'Regardées'}
            icon={BookOpen}
            color="accent"
          />
          <DashboardCard
            title={language === 'ar' ? 'الألعاب' : 'Jeux'}
            value={stats.games.toString()}
            subtitle={language === 'ar' ? 'لعبتها' : 'Joués'}
            icon={Gamepad2}
            color="warning"
          />
          <DashboardCard
            title={language === 'ar' ? 'النجوم' : 'Étoiles'}
            value={stats.stars.toString()}
            subtitle={language === 'ar' ? 'المجموع' : 'Total'}
            icon={Star}
            color="primary"
          />
        </div> */}

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'روابط سريعة' : 'Accès rapide'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Card className="h-full hover:scale-105 transition-transform duration-200 card-shadow hover:card-shadow-hover cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${link.color} flex items-center justify-center`}>
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
        <Card className="bg-gradient-to-r from-playful-pink/20 to-playful-purple/20 border-none card-shadow">
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
