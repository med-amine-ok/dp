import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Activity, PieChart as PieIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
  Legend,
} from 'recharts';

interface AnalyticsData {
  growth: { month: string; patients: number }[];
  satisfactionTrend: { month: string; score: number }[];
  ageDist: { group: string; count: number }[];
  moodDist: { name: string; value: number }[];
}

const COLORS = ['hsl(213, 56%, 24%)', 'hsl(187, 70%, 60%)', 'hsl(152, 60%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

const AnalyticsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [data, setData] = useState<AnalyticsData>({
    growth: [],
    satisfactionTrend: [],
    ageDist: [],
    moodDist: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // 1. Fetch Patients for Growth and Age Distribution
        const { data: patients } = await supabase
          .from('patients')
          .select('created_at, age');

        // 2. Fetch Health Forms for Satisfaction Trend and Mood Distribution
        const { data: healthForms } = await supabase
          .from('health_forms')
          .select('mood, created_at');

        // Process Growth Data (Last 6 months)
        const growthMap: Record<string, number> = {};
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthKey = d.toLocaleString(language === 'ar' ? 'ar-EG' : 'fr-FR', { month: 'short' });
          months.push(monthKey);
          growthMap[monthKey] = 0;
        }

        patients?.forEach(p => {
          const m = new Date(p.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'fr-FR', { month: 'short' });
          if (growthMap[m] !== undefined) growthMap[m]++;
        });

        // Cumulative growth
        let cumulative = patients?.filter(p => {
          const date = new Date(p.created_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
          sixMonthsAgo.setDate(1);
          return date < sixMonthsAgo;
        }).length || 0;

        const growthData = months.map(m => {
          cumulative += growthMap[m];
          return { month: m, patients: cumulative };
        });

        // Process Satisfaction Trend (Avg mood per month)
        const satisfMap: Record<string, { total: number; count: number }> = {};
        months.forEach(m => (satisfMap[m] = { total: 0, count: 0 }));

        healthForms?.forEach(f => {
          const m = new Date(f.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'fr-FR', { month: 'short' });
          if (satisfMap[m] !== undefined) {
            satisfMap[m].total += f.mood;
            satisfMap[m].count++;
          }
        });

        const satisfactionTrend = months.map(m => ({
          month: m,
          score: satisfMap[m].count > 0 ? Number(((satisfMap[m].total / satisfMap[m].count) / 5 * 100).toFixed(0)) : 80,
        }));

        // Process Age Distribution
        const ageGroups = [
          { group: '0-5', count: 0 },
          { group: '6-10', count: 0 },
          { group: '11-15', count: 0 },
          { group: '16-20', count: 0 },
          { group: '21+', count: 0 },
        ];

        patients?.forEach(p => {
          if (p.age <= 5) ageGroups[0].count++;
          else if (p.age <= 10) ageGroups[1].count++;
          else if (p.age <= 15) ageGroups[2].count++;
          else if (p.age <= 20) ageGroups[3].count++;
          else ageGroups[4].count++;
        });

        // Process Mood Distribution
        const moodLabels = [
          language === 'ar' ? 'ممتاز' : 'Excellent',
          language === 'ar' ? 'جيد جداً' : 'Très bien',
          language === 'ar' ? 'جيد' : 'Bien',
          language === 'ar' ? 'بسيط' : 'Moyen',
          language === 'ar' ? 'سيئ' : 'Mauvais'
        ];
        const moodDist = [5, 4, 3, 2, 1].map((m, i) => ({
          name: moodLabels[i],
          value: healthForms?.filter(f => f.mood === m).length || 0,
        }));

        setData({
          growth: growthData,
          satisfactionTrend: satisfactionTrend,
          ageDist: ageGroups,
          moodDist: moodDist.filter(m => m.value > 0),
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

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
                <AreaChart data={data.growth}>
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
                <LineChart data={data.satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
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
                <BarChart data={data.ageDist}>
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

          {/* Patient Satisfaction Pie */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieIcon className="h-5 w-5" />
                {language === 'ar' ? 'رضا المرضى' : 'Satisfaction des patients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={data.moodDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.moodDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
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
