import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import KidneyMascot from '@/components/KidneyMascot';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, MessageCircle, Gamepad2, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { t, language } = useLanguage();

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
              {t('patient.welcome')}, Ahmed! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('patient.howAreYou')}
            </p>
            <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
              <span className="text-2xl">🌟</span>
              <span className="text-sm font-medium text-foreground">
                {language === 'ar' ? '5 نجوم هذا الأسبوع!' : '5 étoiles cette semaine !'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard
            title={language === 'ar' ? 'الجلسات' : 'Séances'}
            value="12"
            subtitle={language === 'ar' ? 'هذا الشهر' : 'Ce mois'}
            icon={Heart}
            color="success"
          />
          <DashboardCard
            title={language === 'ar' ? 'الفيديوهات' : 'Vidéos'}
            value="3"
            subtitle={language === 'ar' ? 'شاهدتها' : 'Regardées'}
            icon={BookOpen}
            color="accent"
          />
          <DashboardCard
            title={language === 'ar' ? 'الألعاب' : 'Jeux'}
            value="8"
            subtitle={language === 'ar' ? 'لعبتها' : 'Joués'}
            icon={Gamepad2}
            color="warning"
          />
          <DashboardCard
            title={language === 'ar' ? 'النجوم' : 'Étoiles'}
            value="42"
            subtitle={language === 'ar' ? 'المجموع' : 'Total'}
            icon={Star}
            color="primary"
          />
        </div>

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
                : 'Bois de l\'eau régulièrement ! L\'eau aide tes reins à bien fonctionner. 💧'}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
