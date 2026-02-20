import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, ThumbsUp, Activity, TrendingUp, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Analytics {
  totalPatients: number;
  totalDoctors: number;
  satisfactionRate: number;
  dialysisTypes: { type: string; label: string; count: number }[];
  statusDist: { name: string; value: number }[];
  newPatientsThisMonth: number;
  healthFormsThisWeek: number;
}

const COLORS = ['hsl(213, 56%, 24%)', 'hsl(187, 70%, 60%)', 'hsl(152, 60%, 45%)', 'hsl(38, 92%, 50%)'];

const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPatients: 0,
    totalDoctors: 0,
    satisfactionRate: 0,
    dialysisTypes: [],
    statusDist: [],
    newPatientsThisMonth: 0,
    healthFormsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // All patients
        const { data: patients, count: patientsCount } = await supabase
          .from('patients')
          .select('dialysis_type, status, created_at', { count: 'exact' });

        // All doctors
        const { count: doctorsCount } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true });

        // Satisfaction from health_forms mood (avg mood → %)
        const { data: healthForms } = await supabase
          .from('health_forms')
          .select('mood, created_at');

        let satisfactionRate = 0;
        if (healthForms && healthForms.length > 0) {
          const avgMood = healthForms.reduce((s, f) => s + (f.mood || 3), 0) / healthForms.length;
          satisfactionRate = Math.round((avgMood / 5) * 100);
        }

        // Monthly new patients
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString();
        const newPatientsThisMonth = (patients || []).filter(
          p => new Date(p.created_at) >= monthStart
        ).length;

        // Health forms this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const healthFormsThisWeek = (healthForms || []).filter(
          f => new Date(f.created_at) >= weekStart
        ).length;

        // Dialysis type breakdown
        const hdCount = (patients || []).filter(p => p.dialysis_type === 'HD').length;
        const pdCount = (patients || []).filter(p => p.dialysis_type === 'PD').length;

        // Status distribution
        const active = (patients || []).filter(p => p.status === 'active').length;
        const recovering = (patients || []).filter(p => p.status === 'recovering').length;
        const critical = (patients || []).filter(p => p.status === 'critical').length;

        setAnalytics({
          totalPatients: patientsCount || 0,
          totalDoctors: doctorsCount || 0,
          satisfactionRate,
          dialysisTypes: [
            { type: 'HD', label: language === 'ar' ? 'غسيل الدم' : 'Hémodialyse', count: hdCount },
            { type: 'PD', label: language === 'ar' ? 'غسيل بريتوني' : 'Dialyse péritonéale', count: pdCount },
          ],
          statusDist: [
            { name: language === 'ar' ? 'نشط' : 'Actif', value: active },
            { name: language === 'ar' ? 'تعافي' : 'En rétablissement', value: recovering },
            { name: language === 'ar' ? 'حرج' : 'Critique', value: critical },
          ],
          newPatientsThisMonth,
          healthFormsThisWeek,
        });
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [language]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalForPie = analytics.dialysisTypes.reduce((s, t) => s + t.count, 0) || 1;

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.welcome')}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'نظرة عامة على النظام' : "Vue d'ensemble du système"}
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard
            title={t('admin.totalPatients')}
            value={analytics.totalPatients.toString()}
            icon={Users}
            color="primary"
            trend={{ value: analytics.newPatientsThisMonth, isPositive: true }}
            subtitle={language === 'ar' ? `+${analytics.newPatientsThisMonth} هذا الشهر` : `+${analytics.newPatientsThisMonth} ce mois`}
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
          />
          <DashboardCard
            title={language === 'ar' ? 'نماذج الأسبوع' : 'Formulaires semaine'}
            value={analytics.healthFormsThisWeek.toString()}
            icon={Activity}
            color="success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dialysis Type Pie */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'أنواع غسيل الكلى' : 'Répartition des types de dialyse'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.dialysisTypes}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ label, percent }) =>
                      `${label} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {analytics.dialysisTypes.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} patients`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {analytics.dialysisTypes.map((dt, i) => (
                  <div key={dt.type} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-muted-foreground">
                      {dt.label}: <span className="font-semibold text-foreground">{dt.count}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Status Pie */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'حالة المرضى' : 'État des patients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.statusDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                  >
                    <Cell fill="hsl(152, 60%, 45%)" />
                    <Cell fill="hsl(38, 92%, 50%)" />
                    <Cell fill="hsl(0, 72%, 51%)" />
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} patients`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/admin/users">
            <Card className="card-shadow hover:scale-[1.02] transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('nav.userManagement')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'إدارة المستخدمين' : 'Gérer les utilisateurs'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/statistics">
            <Card className="card-shadow hover:scale-[1.02] transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('nav.statistics')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'عرض الإحصائيات' : 'Voir les statistiques'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/monitoring">
            <Card className="card-shadow hover:scale-[1.02] transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('nav.monitoring')}</h3>
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
