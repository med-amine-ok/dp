import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, TrendingDown, Users, Calendar, Heart, Scale } from 'lucide-react';
import { mockAnalytics } from '@/data/mockData';

const StatisticsPage: React.FC = () => {
  const { language, t } = useLanguage();

  const stats = [
    {
      title: language === 'ar' ? 'نسبة نجاح العلاج' : 'Taux de réussite du traitement',
      value: 92,
      icon: Heart,
      color: 'text-success',
      bgColor: 'bg-success/20',
      trend: { value: 5, isPositive: true },
    },
    {
      title: language === 'ar' ? 'معدل الحضور' : 'Taux de présence',
      value: 88,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      trend: { value: 2, isPositive: true },
    },
    {
      title: language === 'ar' ? 'استقرار الوزن' : 'Stabilité du poids',
      value: 78,
      icon: Scale,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      trend: { value: 3, isPositive: false },
    },
    {
      title: language === 'ar' ? 'رضا المرضى' : 'Satisfaction patients',
      value: 94,
      icon: Users,
      color: 'text-playful-purple',
      bgColor: 'bg-playful-purple/20',
      trend: { value: 8, isPositive: true },
    },
  ];

  const treatmentStats = [
    { label: language === 'ar' ? 'مرضى جدد' : 'Nouveaux patients', value: 18, change: '+22%' },
    { label: language === 'ar' ? 'نماذج صحية مرسلة' : 'Formulaires de santé envoyés', value: 342, change: '+15%' },
    { label: language === 'ar' ? 'فيديوهات شوهدت' : 'Vidéos regardées', value: 519, change: '+30%' },
    { label: language === 'ar' ? 'ألعاب تعليمية' : 'Jeux joués', value: 207, change: '+18%' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
            <Activity className="h-7 w-7 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('nav.statistics')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'إحصائيات العلاج والأداء' : 'Statistiques de traitement et performance'}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{stat.trend.value}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-foreground">{stat.value}%</span>
                  <Progress value={stat.value} className="flex-1 h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Treatment Statistics */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'إحصائيات العلاج' : 'Statistiques de traitement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {treatmentStats.map((item, index) => (
                <div key={index} className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-3xl font-bold text-foreground mb-1">{item.value}</p>
                  <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.change.startsWith('+') ? 'bg-success/20 text-success' :
                      item.change.startsWith('-') ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                    }`}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'توزيع الأعمار' : 'Répartition par âge'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.ageGroups.map((group, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{group.group} {language === 'ar' ? 'سنة' : 'ans'}</span>
                      <span className="font-medium">{group.count} {language === 'ar' ? 'مريض' : 'patients'}</span>
                    </div>
                    <Progress value={(group.count / 60) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'أنواع العلاج' : 'Types de traitement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.dialysisTypes.map((type, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {type.type === 'HD'
                          ? (language === 'ar' ? 'غسيل الدم' : 'Hémodialyse')
                          : (language === 'ar' ? 'غسيل بريتوني' : 'Dialyse péritonéale')}
                      </span>
                      <span className="font-medium">{type.count} {language === 'ar' ? 'مريض' : 'patients'}</span>
                    </div>
                    <Progress value={(type.count / 127) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StatisticsPage;
