import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import FloatingBubbles from '@/components/FloatingBubbles';
import KidneyMascot from '@/components/KidneyMascot';
import { Logo } from '@/components/Logo';
import { User, Stethoscope, Shield, Activity, MessageCircle, GraduationCap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { login, isAuthenticated, selectRole } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    login();
  };

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'admin') => {
    selectRole(role);
    if (role === 'patient') {

      navigate('/patient');
    } else if (role === 'doctor') {
      navigate('/doctor');
    } else {
      navigate('/admin');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="w-full p-4 flex justify-between items-center">
          <Logo size="sm" />
          <LanguageSwitcher />
        </header>

        <FloatingBubbles count={15} />

        {/* Role Selection */}
        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-4xl animate-slide-up">
            <div className="text-center mb-8">
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('auth.selectRole')}
              </h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Patient Card */}
              <Card
                className="cursor-pointer group hover:scale-105 transition-all duration-300 card-shadow hover:card-shadow-hover border-2 border-transparent hover:border-playful-pink"
                onClick={() => handleRoleSelect('patient')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-playful-pink/20 flex items-center justify-center group-hover:animate-bounce-gentle">
                    <User className="w-10 h-10 text-playful-pink" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t('auth.patient')}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t('auth.patientDesc')}
                  </p>
                </CardContent>
              </Card>

              {/* Doctor Card */}
              <Card
                className="cursor-pointer group hover:scale-105 transition-all duration-300 card-shadow hover:card-shadow-hover border-2 border-transparent hover:border-primary"
                onClick={() => handleRoleSelect('doctor')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:animate-bounce-gentle">
                    <Stethoscope className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t('auth.doctor')}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t('auth.doctorDesc')}
                  </p>
                </CardContent>
              </Card>

              {/* Admin Card */}
              <Card
                className="cursor-pointer group hover:scale-105 transition-all duration-300 card-shadow hover:card-shadow-hover border-2 border-transparent hover:border-playful-purple"
                onClick={() => handleRoleSelect('admin')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-playful-purple/20 flex items-center justify-center group-hover:animate-bounce-gentle">
                    <Shield className="w-10 h-10 text-playful-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t('auth.admin')}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t('auth.adminDesc')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Background Shape */}
      <div className="absolute top-0 right-0 w-2/3 h-full z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-[#D1F4FA]">
          <path d="M50 0 L100 0 L100 100 L40 100 C40 100 10 70 60 50 C90 30 40 10 50 0 Z" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-4 flex flex-col h-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <Logo size="md" />
          </div>

          <nav className="flex items-center gap-8 text-primary/80 font-medium text-sm hidden md:flex">
            <a href="#" className="hover:text-primary transition-colors">{t('nav.home')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('nav.education')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('nav.games')}</a>
            <a href="#" className="text-primary font-bold">{t('auth.loginWithGoogle')}</a>
          </nav>
        </header>

        {/* content */}
        <main className="flex-1 flex flex-col md:flex-row items-center gap-12">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0D4E80] leading-tight">
              {t('auth.welcome')}
            </h1>
            <p className="text-gray-600 text-lg max-w-lg">
              {t('auth.subtitle')}
            </p>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleGoogleLogin}
                className="bg-[#0D4E80] hover:bg-[#0A3D66] text-white px-8 py-6 text-lg rounded-md font-bold w-32"
              >
                {t('games.play')}
              </Button>
            </div>

            {/* Website Info / Features */}
            <div className="grid gap-6 mt-12 bg-white/40 p-6 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0D4E80]">{t('auth.feature1.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('auth.feature1.desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600 shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0D4E80]">{t('auth.feature2.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('auth.feature2.desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#0D4E80]">{t('auth.feature3.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('auth.feature3.desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="flex-1 w-full max-w-md ms-auto me-12 lg:me-24">
            <div className="mb-6">
              <h2 className="text-[#0D4E80] text-xl font-bold uppercase tracking-wider mb-4">
                {t('auth.loginWithGoogle')}
              </h2>
              <div className="space-y-4 bg-white/50 p-6 rounded-xl backdrop-blur-sm border border-white/60">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-16 bg-white hover:bg-gray-50 border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-4 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-gray-700">Google</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
