import React from 'react';
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
  RefreshCw
} from 'lucide-react';

const MonitoringPage: React.FC = () => {
  const { language, t } = useLanguage();

  const systemStatus = [
    {
      name: language === 'ar' ? 'الخادم الرئيسي' : 'Serveur principal',
      status: 'online',
      uptime: '99.9%',
      icon: Server
    },
    {
      name: language === 'ar' ? 'قاعدة البيانات' : 'Base de données',
      status: 'online',
      uptime: '99.8%',
      icon: Database
    },
    {
      name: language === 'ar' ? 'خدمة المصادقة' : 'Service d\'authentification',
      status: 'online',
      uptime: '100%',
      icon: Wifi
    },
    {
      name: language === 'ar' ? 'نظام النسخ الاحتياطي' : 'Système de backup',
      status: 'warning',
      uptime: '95.2%',
      icon: RefreshCw
    },
  ];

  const activeUsers = [
    {
      name: language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed',
      role: language === 'ar' ? 'مريض' : 'Patient',
      lastSeen: '2 min',
      status: 'online'
    },
    {
      name: language === 'ar' ? 'د. كريم' : 'Dr. Karim',
      role: language === 'ar' ? 'طبيب' : 'Médecin',
      lastSeen: '5 min',
      status: 'online'
    },
    {
      name: language === 'ar' ? 'سارة علي' : 'Sara Ali',
      role: language === 'ar' ? 'مريضة' : 'Patiente',
      lastSeen: '8 min',
      status: 'online'
    },
  ];

  const alerts = [
    {
      type: 'warning',
      message: language === 'ar' ? 'تأخير في النسخ الاحتياطي الأخير' : 'Retard dans la dernière sauvegarde',
      time: '10:30',
    },
    {
      type: 'info',
      message: language === 'ar' ? 'تحديث النظام مجدول للغد' : 'Mise à jour système prévue demain',
      time: '09:15',
    },
    {
      type: 'success',
      message: language === 'ar' ? 'اكتمال صيانة قاعدة البيانات' : 'Maintenance base de données terminée',
      time: '08:00',
    },
  ];

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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'info':
        return <Activity className="h-5 w-5 text-primary" />;
      default:
        return null;
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
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
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
                  className="p-4 rounded-xl bg-muted/50 flex items-center gap-4"
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
                {activeUsers.map((u, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {language === 'ar' ? 'التنبيهات الأخيرة' : 'Alertes récentes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/50 flex items-start gap-3"
                  >
                    {getAlertIcon(alert.type)}
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
