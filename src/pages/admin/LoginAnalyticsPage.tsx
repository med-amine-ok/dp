import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, LogIn, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, parseISO, subDays } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LoginStats {
  date: string;
  count: number;
}

interface UserLoginCount {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string;
  login_count: number;
  last_login: string;
}

interface LoginAnalyticsData {
  dailyLogins: LoginStats[];
  userLoginCounts: UserLoginCount[];
  recentLogins: UserLoginCount[];
}

const LoginAnalyticsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [data, setData] = useState<LoginAnalyticsData>({
    dailyLogins: [],
    userLoginCounts: [],
    recentLogins: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Calculate past 7 days array
        const past7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = subDays(new Date(), i);
          return format(d, 'yyyy-MM-dd');
        }).reverse();
        
        let dailyLogins: LoginStats[] = past7Days.map(date => ({ date, count: 0 }));
        let userLoginCounts: UserLoginCount[] = [];
        let recentLogins: UserLoginCount[] = [];

        try {
          // 1. Fetch recent logins by date for bar chart
          const startDate = subDays(new Date(), 7).toISOString();
          const { data: logsData } = await supabase
            .from('login_logs')
            .select('login_time')
            .gte('login_time', startDate);
            
          if (logsData) {
            logsData.forEach(log => {
              const day = log.login_time.split('T')[0];
              const index = dailyLogins.findIndex(d => d.date === day);
              if (index !== -1) dailyLogins[index].count++;
            });
          }

          // 2. Fetch Top Users
          const { data: countsData } = await supabase
            .from('user_login_counts')
            .select('*')
            .order('login_count', { ascending: false })
            .limit(10);
            
          if (countsData) {
            userLoginCounts = countsData.map((c: any) => ({
              user_id: c.user_id,
              name: language === 'ar' ? (c.name_ar || c.name_fr) : (c.name_fr || c.name_ar) || c.email?.split('@')[0],
              email: c.email || '',
              avatar_url: c.avatar_url || '',
              login_count: Number(c.login_count),
              last_login: c.last_login
            }));
          }

          // 3. Fetch Recent Logins
          const { data: recentData } = await supabase
            .from('user_login_counts')
            .select('*')
            .order('last_login', { ascending: false })
            .limit(10);

          if (recentData) {
            recentLogins = recentData.map((c: any) => ({
              user_id: c.user_id,
              name: language === 'ar' ? (c.name_ar || c.name_fr) : (c.name_fr || c.name_ar) || c.email?.split('@')[0],
              email: c.email || '',
              avatar_url: c.avatar_url || '',
              login_count: Number(c.login_count),
              last_login: c.last_login
            }));
          }
        } catch (logError) {
          console.error("Error fetching login logs (may not exist yet):", logError);
        }

        setData({
          dailyLogins,
          userLoginCounts,
          recentLogins,
        });
      } catch (error) {
        console.error('Error fetching login analytics:', error);
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
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center shadow-[0_12px_20px_-16px_rgba(99,102,241,0.9)]">
            <LogIn className="h-7 w-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'تحليلات تسجيل الدخول' : 'Analyses de Connexion'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'تتبع نشاط المستخدمين وتاريخ دخولهم' : 'Suivre l\'activité des utilisateurs et leur historique de connexion'}
            </p>
          </div>
        </div>

        {/* Daily Logins Chart */}
        <Card className="card-shadow rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              {language === 'ar' ? 'تسجيلات الدخول اليومية (آخر 7 أيام)' : 'Connexions Quotidiennes (7 derniers jours)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyLogins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => format(parseISO(val), 'MMM d')} 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12}
                  />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    labelFormatter={(val) => format(parseISO(val), 'PPP', { locale: language === 'ar' ? ar : fr })}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name={language === 'ar' ? 'تسجيلات الدخول' : 'Connexions'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Login Activity Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Active Users */}
          <Card className="card-shadow rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                {language === 'ar' ? 'المستخدمين الأكثر نشاطاً' : 'Utilisateurs les plus actifs'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.userLoginCounts.length > 0 ? (
                <div className="space-y-4">
                  {data.userLoginCounts.map((user, i) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 overflow-hidden flex items-center justify-center font-bold text-indigo-500">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{user.login_count}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {language === 'ar' ? 'مسجل' : 'fois'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                  <LogIn className="w-8 h-8 mb-2 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد بيانات تسجيل دخول' : 'Aucune donnée de connexion'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Logins */}
          <Card className="card-shadow rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-warning" />
                {language === 'ar' ? 'تسجيلات الدخول الأخيرة' : 'Connexions récentes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentLogins.length > 0 ? (
                <div className="space-y-4">
                  {data.recentLogins.map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/20 overflow-hidden flex items-center justify-center font-bold text-warning">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(user.last_login), "dd MMM yyyy, HH:mm", { locale: language === 'ar' ? ar : fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                  <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد بيانات تسجيل دخول' : 'Aucune donnée de connexion'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoginAnalyticsPage;