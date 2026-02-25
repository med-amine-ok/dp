import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Server,
  Database,
  Wifi,
  Clock,
  RefreshCw,
  MessageCircle,
  Stethoscope,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ActiveUser {
  name: string;
  role: string;
  lastSeen: string;
  status: 'online' | 'away';
}

interface SystemStatus {
  name: string;
  status: 'online' | 'warning' | 'offline';
  uptime: string;
  icon: React.ElementType;
}

interface SystemAlert {
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
}

const MonitoringPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);

  const checkSystemStatus = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

    const measure = async (fn: () => Promise<unknown>): Promise<{ ok: boolean; ms: number }> => {
      const start = Date.now();
      try {
        await fn();
        return { ok: true, ms: Date.now() - start };
      } catch {
        return { ok: false, ms: Date.now() - start };
      }
    };

    const [serverResult, dbResult, authResult, storageResult] = await Promise.all([
      // 1. Supabase REST health endpoint
      measure(() => fetch(`${supabaseUrl}/rest/v1/`, { method: 'HEAD' })),
      // 2. Database – lightweight query
      measure(async () => {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
      }),
      // 3. Auth service
      measure(async () => {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
      }),
      // 4. Storage service
      measure(async () => {
        const { error } = await supabase.storage.listBuckets();
        if (error) throw error;
      }),
    ]);

    const toStatus = (ok: boolean, ms: number): 'online' | 'warning' | 'offline' =>
      !ok ? 'offline' : ms > 1500 ? 'warning' : 'online';

    const toUptime = (ok: boolean, ms: number) =>
      ok ? `${ms} ms` : (language === 'ar' ? 'غير متاح' : 'Indisponible');

    setSystemStatus([
      {
        name: language === 'ar' ? 'الخادم الرئيسي' : 'Serveur principal',
        status: toStatus(serverResult.ok, serverResult.ms),
        uptime: toUptime(serverResult.ok, serverResult.ms),
        icon: Server,
      },
      {
        name: language === 'ar' ? 'قاعدة البيانات' : 'Base de données',
        status: toStatus(dbResult.ok, dbResult.ms),
        uptime: toUptime(dbResult.ok, dbResult.ms),
        icon: Database,
      },
      {
        name: language === 'ar' ? 'خدمة المصادقة' : "Service d'authentification",
        status: toStatus(authResult.ok, authResult.ms),
        uptime: toUptime(authResult.ok, authResult.ms),
        icon: Wifi,
      },
      {
        name: language === 'ar' ? 'نظام التخزين' : 'Système de stockage',
        status: toStatus(storageResult.ok, storageResult.ms),
        uptime: toUptime(storageResult.ok, storageResult.ms),
        icon: RefreshCw,
      },
    ]);
  };

  const fetchActiveUsers = async () => {
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('name_fr, name_ar, updated_at, user_id')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (recentProfiles) {
      const mappedUsers: ActiveUser[] = recentProfiles.map(p => {
        const lastSeenDate = new Date(p.updated_at);
        const diffMins = Math.floor((Date.now() - lastSeenDate.getTime()) / 60000);
        return {
          name: language === 'ar' ? p.name_ar : p.name_fr,
          role: 'User',
          lastSeen: diffMins < 1 ? (language === 'ar' ? 'الآن' : 'À l\'instant') : `${diffMins}m`,
          status: diffMins < 15 ? 'online' : 'away',
        };
      });
      setActiveUsers(mappedUsers);
    }
  };

  const fetchAlerts = async () => {
    const { data: criticalForms } = await supabase
      .from('health_forms')
      .select('mood, pain_level, created_at, patients(name_fr, name_ar)')
      .or('mood.lte.2,pain_level.gte.3')
      .order('created_at', { ascending: false })
      .limit(5);

    const systemAlerts: SystemAlert[] = [];

    criticalForms?.forEach(f => {
      const patientName = language === 'ar' ? (f.patients as any).name_ar : (f.patients as any).name_fr;
      if (f.mood <= 2) {
        systemAlerts.push({
          type: 'warning',
          message: language === 'ar'
            ? `مزاج منخفض للمريض: ${patientName}`
            : `Humeur basse pour le patient: ${patientName}`,
          time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
      if (f.pain_level >= 3) {
        systemAlerts.push({
          type: 'error',
          message: language === 'ar'
            ? `ألم شديد للمريض: ${patientName}`
            : `Douleur intense pour le patient: ${patientName}`,
          time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    if (systemAlerts.length === 0) {
      systemAlerts.push({
        type: 'success',
        message: language === 'ar' ? 'جميع الأنظمة تعمل بشكل جيد' : 'Tous les systèmes fonctionnent normalement',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    setAlerts(systemAlerts);
  };

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      await Promise.all([checkSystemStatus(), fetchActiveUsers(), fetchAlerts()]);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();

    // Poll system latency every 10 seconds
    const statusInterval = setInterval(checkSystemStatus, 1_000);

    // Refresh "last seen" timestamps every 30 seconds
    const usersInterval = setInterval(fetchActiveUsers, 30_000);

    // Real-time subscription: new health_form row → refresh alerts instantly
    const channel = supabase
      .channel('monitoring-health-forms')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'health_forms' },
        () => fetchAlerts()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => fetchActiveUsers()
      )
      .subscribe();

    return () => {
      clearInterval(statusInterval);
      clearInterval(usersInterval);
      supabase.removeChannel(channel);
    };
  }, [language]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'offline':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-warning/20 flex items-center justify-center">
              <Settings className="h-7 w-7 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('nav.monitoring')}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'مراقبة حالة النظام' : 'Surveillance de l\'état du système'}
              </p>
            </div>
          </div>
          <Button onClick={fetchMonitoringData} disabled={loading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            {language === 'ar' ? 'تحديث' : 'Actualiser'}
          </Button>
        </div>

        {/* System Status */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" />
              {language === 'ar' ? 'حالة النظام' : 'État du système'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemStatus.map((system, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 flex items-center gap-4 border border-transparent hover:border-primary/20 transition-all"
                >
                  <div className={cn(
                    'p-3 rounded-lg',
                    system.status === 'online' ? 'bg-success/20' : 'bg-warning/20'
                  )}>
                    <system.icon className={cn(
                      'h-6 w-6',
                      system.status === 'online' ? 'text-success' : 'text-warning'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{system.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(system.status)}
                      <Badge variant="outline" className={getStatusColor(system.status)}>
                        {system.uptime}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Users */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'ar' ? 'المستخدمون النشطون' : 'Utilisateurs actifs'}
                <Badge className="ml-2 bg-success/20 text-success border-success/30">
                  {activeUsers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">No active users found.</p>
                ) : (
                  activeUsers.map((u, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", u.status === 'online' ? "bg-success" : "bg-warning")} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{u.lastSeen}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {language === 'ar' ? 'التنبيهات والنشاط' : 'Alertes et Activité'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg flex items-start gap-3 border",
                      alert.type === 'error' ? "bg-destructive/5 border-destructive/20" :
                        alert.type === 'warning' ? "bg-warning/5 border-warning/20" : "bg-muted/50 border-transparent"
                    )}
                  >
                    {alert.type === 'error' ? <XCircle className="h-5 w-5 text-destructive" /> :
                      alert.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-warning" /> :
                        <CheckCircle className="h-5 w-5 text-success" />}
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
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

export default MonitoringPage;
