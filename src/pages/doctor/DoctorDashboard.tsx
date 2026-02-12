import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, MessageCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockPatients, mockDialysisSessions } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import DialysisTypeBadge from '@/components/DialysisTypeBadge';

const DoctorDashboard: React.FC = () => {
  const { language, t } = useLanguage();

  const criticalPatients = mockPatients.filter(p => p.status === 'critical');
  const todaySessions = mockDialysisSessions.filter(s => s.status === 'scheduled');
  const activePatients = mockPatients.filter(p => p.status === 'active').length;

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('doctor.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'مرحباً د. كريم! إليك ملخص اليوم.'
              : 'Bonjour Dr. Karim ! Voici votre résumé du jour.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard
            title={language === 'ar' ? 'المرضى' : 'Patients'}
            value={mockPatients.length}
            subtitle={language === 'ar' ? 'إجمالي المرضى' : 'Total'}
            icon={Users}
            color="primary"
          />
          <DashboardCard
            title={language === 'ar' ? 'نشط' : 'Actifs'}
            value={activePatients}
            subtitle={language === 'ar' ? 'مرضى نشطين' : 'Patients actifs'}
            icon={Activity}
            color="success"
          />
          <DashboardCard
            title={language === 'ar' ? 'اليوم' : 'Aujourd\'hui'}
            value={todaySessions.length}
            subtitle={language === 'ar' ? 'جلسات مجدولة' : 'Séances prévues'}
            icon={Calendar}
            color="accent"
          />
          <DashboardCard
            title={language === 'ar' ? 'رسائل' : 'Messages'}
            value="3"
            subtitle={language === 'ar' ? 'غير مقروءة' : 'Non lus'}
            icon={MessageCircle}
            color="warning"
          />
        </div>

        {/* Critical Alerts */}
        {criticalPatients.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5 card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {language === 'ar' ? 'تنبيهات عاجلة' : 'Alertes urgentes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                        <span className="font-bold text-destructive">
                          {(language === 'ar' ? patient.name : patient.nameFr).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {language === 'ar' ? patient.name : patient.nameFr}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} {language === 'ar' ? 'سنة' : 'ans'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'المرضى الأخيرين' : 'Patients récents'}
              </CardTitle>
              <Link to="/doctor/patients" className="text-sm text-primary hover:underline">
                {language === 'ar' ? 'عرض الكل' : 'Voir tout'}
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPatients.slice(0, 4).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="font-semibold text-secondary-foreground">
                          {(language === 'ar' ? patient.name : patient.nameFr).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {language === 'ar' ? patient.name : patient.nameFr}
                        </p>
                        <div className="flex items-center gap-2">
                          <DialysisTypeBadge type={patient.dialysisType} />
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={patient.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {language === 'ar' ? 'جدول اليوم' : 'Planning du jour'}
              </CardTitle>
              <Link to="/doctor/tracking" className="text-sm text-primary hover:underline">
                {language === 'ar' ? 'عرض الكل' : 'Voir tout'}
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDialysisSessions.slice(0, 3).map((session) => {
                  const patient = mockPatients.find(p => p.id === session.patientId);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {patient ? (language === 'ar' ? patient.name : patient.nameFr) : 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
