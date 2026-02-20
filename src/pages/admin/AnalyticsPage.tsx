import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Activity, PieChart } from 'lucide-react';
import { mockAnalytics } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const { language, t } = useLanguage();

  const COLORS = ['hsl(213, 56%, 24%)', 'hsl(187, 70%, 60%)', 'hsl(152, 60%, 45%)', 'hsl(38, 92%, 50%)'];

  const monthlyData = [
    { month: language === 'ar' ? 'يناير' : 'Jan', patients: 95, satisfaction: 82 },
    { month: language === 'ar' ? 'فبراير' : 'Fév', patients: 102, satisfaction: 84 },
    { month: language === 'ar' ? 'مارس' : 'Mar', patients: 108, satisfaction: 87 },
    { month: language === 'ar' ? 'أبريل' : 'Avr', patients: 115, satisfaction: 85 },
    { month: language === 'ar' ? 'مايو' : 'Mai', patients: 120, satisfaction: 90 },
    { month: language === 'ar' ? 'يونيو' : 'Juin', patients: 127, satisfaction: 92 },
  ];

  const satisfactionData = [
    { name: language === 'ar' ? 'ممتاز' : 'Excellent', value: 45 },
    { name: language === 'ar' ? 'جيد جداً' : 'Très bien', value: 35 },
    { name: language === 'ar' ? 'جيد' : 'Bien', value: 15 },
    { name: language === 'ar' ? 'متوسط' : 'Moyen', value: 5 },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('nav.analytics')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'تحليلات شاملة للنظام' : 'Analyses complètes du système'}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Growth */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {language === 'ar' ? 'نمو المرضى' : 'Croissance des patients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="hsl(213, 56%, 24%)"
                    fill="hsl(213, 56%, 24%, 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Satisfaction Trend */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'ar' ? 'اتجاه الرضا' : 'Tendance de satisfaction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[70, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="hsl(152, 60%, 45%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(152, 60%, 45%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Age Distribution */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {language === 'ar' ? 'توزيع الأعمار' : 'Répartition par âge'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockAnalytics.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="group" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(187, 70%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Patient Satisfaction */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {language === 'ar' ? 'رضا المرضى' : 'Satisfaction des patients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={satisfactionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {satisfactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
