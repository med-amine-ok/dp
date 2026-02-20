import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity, Settings } from 'lucide-react';

interface Analytics {
  totalPatients: number;
  totalDoctors: number;
  satisfactionRate: number;
  dialysisTypes: { type: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPatients: 0,
    totalDoctors: 0,
    satisfactionRate: 0,
    dialysisTypes: [],
  });
  const [loading, setLoading] = useState(true);

  const COLORS = ['hsl(213, 56%, 24%)', 'hsl(187, 70%, 60%)'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 1. Total Patients
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        // 2. Total Doctors
        const { count: doctorsCount } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true });

        // 3. Satisfaction Rate from health_forms mood
        const { data: healthForms } = await supabase
          .from('health_forms')
          .select('mood');

        let satisfactionRate = 85;
        if (healthForms && healthForms.length > 0) {
          const avgMood = healthForms.reduce((sum, form) => sum + (form.mood || 3), 0) / healthForms.length;
          satisfactionRate = Math.round((avgMood / 5) * 100);
        }

        // 4. Dialysis Types Distribution
        const { data: patients } = await supabase
          .from('patients')
          .select('dialysis_type');

        const dialysisTypes = [
          { type: 'HD', count: patients?.filter(p => p.dialysis_type === 'HD').length || 0 },
          { type: 'PD', count: patients?.filter(p => p.dialysis_type === 'PD').length || 0 },
        ];

        setAnalytics({
          totalPatients: patientsCount || 0,
          totalDoctors: doctorsCount || 0,
          satisfactionRate,
          dialysisTypes,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'نظرة عامة على النظام' : "Vue d'ensemble du système"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title={t('admin.totalPatients')}
            value={analytics.totalPatients.toString()}
            icon={Users}
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title={t('admin.totalDoctors')}
            value={analytics.totalDoctors.toString()}
            icon={Stethoscope}
            color="accent"
          />
          <DashboardCard
            title={t('admin.satisfaction')}
            value={`${analytics.satisfactionRate}%`}
            icon={ThumbsUp}
            color="warning"
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Dialysis Types Distribution */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {language === 'ar' ? 'أنواع غسيل الكلى' : 'Types de dialyse'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.dialysisTypes}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {analytics.dialysisTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-4 shrink-0">
                {analytics.dialysisTypes.map((type, index) => (
                  <div key={type.type} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {type.type === 'HD'
                          ? (language === 'ar' ? 'غسيل الدم' : 'Hémodialyse')
                          : (language === 'ar' ? 'غسيل بريتوني' : 'Dialyse péritonéale')}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {type.count} {language === 'ar' ? 'مريض' : 'patients'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/admin/users">
            <Card className="card-shadow hover:card-shadow-hover transition-all hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t('nav.userManagement')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'إدارة المستخدمين' : 'Gérer les utilisateurs'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/statistics">
            <Card className="card-shadow hover:card-shadow-hover transition-all hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t('nav.statistics')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'عرض الإحصائيات' : 'Voir les statistiques'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/monitoring">
            <Card className="card-shadow hover:card-shadow-hover transition-all hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t('nav.monitoring')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'مراقبة النظام' : 'Surveillance système'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
