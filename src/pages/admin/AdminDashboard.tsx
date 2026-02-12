import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, Activity, ThumbsUp, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockAnalytics, mockPatients, mockDoctors } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();

  const COLORS = ['hsl(213, 56%, 24%)', 'hsl(187, 70%, 60%)'];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('admin.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'نظرة عامة على النظام'
              : 'Vue d\'ensemble du système'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard
            title={t('admin.totalPatients')}
            value={mockAnalytics.totalPatients}
            icon={Users}
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title={t('admin.totalDoctors')}
            value={mockAnalytics.totalDoctors}
            icon={Stethoscope}
            color="accent"
          />
          <DashboardCard
            title={t('admin.activeSessions')}
            value={mockAnalytics.activeSessions}
            icon={Activity}
            color="success"
          />
          <DashboardCard
            title={t('admin.satisfaction')}
            value={`${mockAnalytics.satisfactionRate}%`}
            icon={ThumbsUp}
            color="warning"
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly Sessions Chart */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {language === 'ar' ? 'جلسات الأسبوع' : 'Séances de la semaine'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockAnalytics.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sessions" fill="hsl(213, 56%, 24%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Dialysis Types Distribution */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'ar' ? 'أنواع غسيل الكلى' : 'Types de dialyse'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={mockAnalytics.dialysisTypes}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {mockAnalytics.dialysisTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {mockAnalytics.dialysisTypes.map((type, index) => (
                  <div key={type.type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {type.type === 'HD' ? 'Hémodialyse' : 'Dialyse péritonéale'}: {type.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <Activity className="h-6 w-6 text-warning" />
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
