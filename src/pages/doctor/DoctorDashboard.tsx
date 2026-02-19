import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, MessageCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import DialysisTypeBadge from '@/components/DialysisTypeBadge';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  dialysis_type: 'HD' | 'PD';
  status: 'active' | 'recovering' | 'critical';
  last_session?: string;
}

interface DialysisSession {
  id: string;
  patient_id: string;
  session_date: string;
  duration: number;
  status: 'completed' | 'scheduled' | 'missed';
  patient?: Patient;
}

const DoctorDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [todaySessions, setTodaySessions] = useState<DialysisSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Get Doctor ID using user.id
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorError) {
          console.error('Error fetching doctor profile:', doctorError);
          // Check if it's because no rows (maybe new doctor?)
          // If so, we might want to handle it gracefully or redirect
          setLoading(false);
          return;
        }

        const doctorId = doctorData.id;

        // 2. Fetch Patients assigned to this doctor
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('assigned_doctor_id', doctorId);

        if (patientsError) throw patientsError;

        setPatients(patientsData || []);

        // 3. Fetch Today's Sessions for these patients
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // We only want sessions for patients assigned to this doctor.
        // If we have patients, we can filter by patient_id IN (patientIds) or just query all sessions for today and filter manually (since we might not have many sessions).
        // A better approach is to rely on RLS if set up correctly, but let's be explicit.

        if (patientsData && patientsData.length > 0) {
          const patientIds = patientsData.map(p => p.id);
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('dialysis_sessions')
            .select('*')
            .eq('session_date', today)
            .in('patient_id', patientIds);

          if (sessionsError) throw sessionsError;

          // Map patients to sessions for easy display
          const sessionsWithPatients = sessionsData?.map(session => ({
            ...session,
            patient: patientsData.find(p => p.id === session.patient_id)
          })) || [];

          setTodaySessions(sessionsWithPatients);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const criticalPatients = patients.filter(p => p.status === 'critical');
  const activePatientsCount = patients.filter(p => p.status === 'active').length;

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
              ? `مرحباً د. ${user?.name?.split(' ')[0] || ''}! إليك ملخص اليوم.`
              : `Bonjour Dr. ${user?.name?.split(' ')[0] || ''} ! Voici votre résumé du jour.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard
            title={language === 'ar' ? 'المرضى' : 'Patients'}
            value={patients.length.toString()}
            subtitle={language === 'ar' ? 'إجمالي المرضى' : 'Total'}
            icon={Users}
            color="primary"
          />
          <DashboardCard
            title={language === 'ar' ? 'نشط' : 'Actifs'}
            value={activePatientsCount.toString()}
            subtitle={language === 'ar' ? 'مرضى نشطين' : 'Patients actifs'}
            icon={Activity}
            color="success"
          />
          <DashboardCard
            title={language === 'ar' ? 'اليوم' : 'Aujourd\'hui'}
            value={todaySessions.length.toString()}
            subtitle={language === 'ar' ? 'جلسات مجدولة' : 'Séances prévues'}
            icon={Calendar}
            color="accent"
          />
          <DashboardCard
            title={language === 'ar' ? 'رسائل' : 'Messages'}
            value="0" // Placeholder for now
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
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {language === 'ar' ? patient.name_ar : patient.name_fr}
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
                {patients.slice(0, 4).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="font-semibold text-secondary-foreground">
                          {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {language === 'ar' ? patient.name_ar : patient.name_fr}
                        </p>
                        <div className="flex items-center gap-2">
                          <DialysisTypeBadge type={patient.dialysis_type} />
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
                {todaySessions.slice(0, 3).map((session) => {
                  const patient = session.patient;
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {patient ? (language === 'ar' ? patient.name_ar : patient.name_fr) : 'Unknown'}
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
