import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { Activity, Calendar as CalendarIcon, Clock, Weight, Heart, AlertCircle, ChevronRight } from 'lucide-react';
import { fr, ar } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  status: 'active' | 'recovering' | 'critical';
  weight_target?: number;
}

interface DialysisSession {
  id: string;
  patient_id: string;
  session_date: string;
  duration: number;
  status: 'completed' | 'scheduled' | 'missed';
  weight_before?: number;
  weight_after?: number;
  blood_pressure?: string;
  complications?: string;
}

const DialysisTrackingPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [sessions, setSessions] = useState<DialysisSession[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // 1. Fetch Patients assigned to Doctor
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorError) throw doctorError;

        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .eq('assigned_doctor_id', doctorData.id);

        if (patientsError) throw patientsError;

        if (patientsData && patientsData.length > 0) {
          setPatients(patientsData);
          setSelectedPatientId(patientsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching patients for tracking:', error);
      }
    };

    fetchPatients();
  }, [user]);

  // 2. Fetch Sessions for Selected Patient
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('dialysis_sessions')
          .select('*')
          .eq('patient_id', selectedPatientId)
          .order('session_date', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [selectedPatientId]);

  const currentPatient = patients.find(p => p.id === selectedPatientId);

  // Stats Calculations
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const thisMonthSessions = completedSessions.filter(s => {
    const d = new Date(s.session_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const attendanceRate = sessions.length > 0
    ? Math.round((completedSessions.length / sessions.length) * 100)
    : 0;

  // Weight goal simplified logic
  const lastSession = completedSessions.length > 0 ? completedSessions[0] : null;
  const weightProgress = (lastSession?.weight_after && currentPatient?.weight_target)
    ? Math.min(100, Math.round((lastSession.weight_after / currentPatient.weight_target) * 100))
    : 0;

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('tracking.title')}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'متابعة جلسات المرضى' : 'Suivi des séances des patients'}
              </p>
            </div>
          </div>

          {/* Patient Selector */}
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={language === 'ar' ? 'اختر مريضاً' : 'Sélectionner un patient'} />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {language === 'ar' ? patient.name_ar : patient.name_fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {t('tracking.calendar')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={language === 'ar' ? ar : fr}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Session History */}
          <Card className="lg:col-span-2 card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('tracking.history')} - {currentPatient && (language === 'ar' ? currentPatient.name_ar : currentPatient.name_fr)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          session.status === 'completed' && 'bg-success/20',
                          session.status === 'scheduled' && 'bg-primary/20',
                          session.status === 'missed' && 'bg-destructive/20'
                        )}>
                          <CalendarIcon className={cn(
                            'h-5 w-5',
                            session.status === 'completed' && 'text-success',
                            session.status === 'scheduled' && 'text-primary',
                            session.status === 'missed' && 'text-destructive'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{session.session_date}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={session.status} />
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>

                    {session.status === 'completed' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{t('tracking.weight')}</p>
                            <p className="text-sm font-medium">
                              {session.weight_before || '-'} → {session.weight_after || '-'} kg
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">{t('tracking.vitals')}</p>
                            <p className="text-sm font-medium">{session.blood_pressure || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          {session.complications ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-warning" />
                              <div>
                                <p className="text-xs text-muted-foreground">{t('tracking.complications')}</p>
                                <p className="text-sm font-medium text-warning">{session.complications}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-success" />
                              <div>
                                <p className="text-xs text-muted-foreground">{t('tracking.complications')}</p>
                                <p className="text-sm font-medium text-success">
                                  {language === 'ar' ? 'لا توجد' : 'Aucune'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد جلسات مسجلة' : 'Aucune séance enregistrée'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treatment Progress */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'تقدم العلاج' : 'Progression du traitement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'جلسات هذا الشهر' : 'Séances ce mois'}
                  </span>
                  <span className="font-medium">{thisMonthSessions.length}/12</span>
                </div>
                <Progress value={(thisMonthSessions.length / 12) * 100} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'نسبة الحضور' : 'Taux de présence'}
                  </span>
                  <span className="font-medium text-success">{attendanceRate}%</span>
                </div>
                <Progress value={attendanceRate} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'هدف الوزن' : 'Objectif poids'}
                  </span>
                  <span className="font-medium">{weightProgress}%</span>
                </div>
                <Progress value={weightProgress} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DialysisTrackingPage;
