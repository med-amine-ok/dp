import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import AssignDoctorCard from '@/components/AssignDoctorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Droplet, Activity, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DialysisSession {
  id: string;
  date: string;
  duration_minutes?: number;
  weight_before?: number;
  weight_after?: number;
  blood_pressure?: string;
  complications?: string;
  notes?: string;
  status: 'completed' | 'scheduled' | 'missed';
}

interface DoctorInfo {
  id: string;
  name_ar: string;
  name_fr: string;
  avatar_url: string;
  specialization?: string;
}

const PatientSessionsPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DialysisSession[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [assignedDoctorId, setAssignedDoctorId] = useState<string | null>(null);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newSessionData, setNewSessionData] = useState({
    date: '',
    duration_minutes: '',
    weight_before: '',
    weight_after: '',
    blood_pressure: '',
    notes: '',
  });

  // Fetch patient and assigned doctor
  useEffect(() => {
    if (!user) return;

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('id, assigned_doctor_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (patientData) {
          setPatientId(patientData.id);
          setAssignedDoctorId(patientData.assigned_doctor_id);

          // Fetch doctor details
          if (patientData.assigned_doctor_id) {
            // Try fetching from doctors table first
            let { data: doctor, error: doctorError } = await supabase
              .from('doctors')
              .select('*')
              .eq('id', patientData.assigned_doctor_id)
              .single();

            console.log('Doctor from doctors table:', { doctor, doctorError });

            // If not found in doctors table, try profiles table
            if (!doctor && doctorError) {
              const { data: profileDoctor, error: profileError } = await supabase
                .from('profiles')
                .select('id, name_ar, name_fr, avatar_url, user_id')
                .eq('user_id', patientData.assigned_doctor_id)
                .single();

              console.log('Doctor from profiles table:', { profileDoctor, profileError });

              if (profileError) throw profileError;
              if (profileDoctor) {
                setDoctorInfo({
                  id: profileDoctor.user_id || profileDoctor.id,
                  name_ar: profileDoctor.name_ar || '',
                  name_fr: profileDoctor.name_fr || '',
                  avatar_url: profileDoctor.avatar_url || '', // Google avatar from profiles
                  specialization: '',
                });
              }
            } else {
              if (doctorError) throw doctorError;
              if (doctor) {
                setDoctorInfo(doctor);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user]);

  // Fetch sessions
  useEffect(() => {
    if (!patientId) return;

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('dialysis_sessions')
          .select('*')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [patientId]);

  const handleCreateSession = async () => {
    if (!patientId || !newSessionData.date) {
      alert(language === 'ar' ? 'الرجاء ملء التاريخ' : 'Veuillez remplir la date');
      return;
    }

    try {
      const sessionData: any = {
        patient_id: patientId,
        date: newSessionData.date,
        status: 'scheduled',
      };

      if (newSessionData.duration_minutes) {
        sessionData.duration_minutes = parseInt(newSessionData.duration_minutes);
      }
      if (newSessionData.weight_before) {
        sessionData.weight_before = parseFloat(newSessionData.weight_before);
      }
      if (newSessionData.weight_after) {
        sessionData.weight_after = parseFloat(newSessionData.weight_after);
      }
      if (newSessionData.blood_pressure) {
        sessionData.blood_pressure = newSessionData.blood_pressure;
      }
      if (newSessionData.notes) {
        sessionData.notes = newSessionData.notes;
      }

      const { error } = await supabase
        .from('dialysis_sessions')
        .insert([sessionData]);

      if (error) throw error;

      // Refresh sessions
      const { data: updatedSessions } = await supabase
        .from('dialysis_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      setSessions(updatedSessions || []);
      setShowNewSessionDialog(false);
      setNewSessionData({
        date: '',
        duration_minutes: '',
        weight_before: '',
        weight_after: '',
        blood_pressure: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating session:', error);
      alert(language === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            {language === 'ar' ? 'مكتملة' : 'Complétée'}
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-blue-500/20 text-blue-700 border-blue-300">
            <Calendar className="w-3 h-3 mr-1" />
            {language === 'ar' ? 'مجدولة' : 'Programmée'}
          </Badge>
        );
      case 'missed':
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            {language === 'ar' ? 'ملغاة' : 'Manquée'}
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const doctorName = doctorInfo
    ? language === 'ar'
      ? doctorInfo.name_ar
      : doctorInfo.name_fr
    : '';

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ar' ? 'جلسات غسيل الكلى' : 'Séances de dialyse'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar'
                ? 'إدارة جلسات غسيل الكلى مع طبيبك'
                : 'Gérez vos séances de dialyse avec votre médecin'}
            </p>
          </div>
          {assignedDoctorId && (
            <Button onClick={() => setShowNewSessionDialog(true)} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'جلسة جديدة' : 'Nouvelle séance'}
            </Button>
          )}
        </div>

        {!assignedDoctorId ? (
          // No Doctor Assigned
          <Card className="border-2 border-dashed border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning">
                {language === 'ar' ? 'ليس لديك طبيب معين' : 'Pas de médecin assigné'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {language === 'ar'
                  ? 'الرجاء تعيين طبيب أولاً لإدارة جلسات غسيل الكلى معاً.'
                  : 'Veuillez d\'abord assigner un médecin pour gérer vos séances ensemble.'}
              </p>
              <div className="max-w-md">
                <AssignDoctorCard />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Doctor Info Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {language === 'ar' ? 'مراقبة مع طبيبك' : 'Suivi avec votre médecin'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    {doctorInfo?.avatar_url ? (
                      <img src={doctorInfo.avatar_url} alt={doctorName} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback>{doctorName.charAt(0).toUpperCase() || 'D'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{doctorName}</h3>
                    {doctorInfo?.specialization && (
                      <p className="text-sm text-muted-foreground">
                        {doctorInfo.specialization}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'ar'
                        ? 'يمكنك إضافة جلسات جديدة ومراقبة تقدمك مع طبيبك'
                        : 'Vous pouvez ajouter de nouvelles séances et suivre votre progression'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                {language === 'ar' ? 'الجلسات السابقة' : 'Séances enregistrées'}
              </h2>

              {sessions.length === 0 ? (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar'
                        ? 'لا توجد جلسات مسجلة حتى الآن'
                        : 'Aucune séance enregistrée pour le moment'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-muted-foreground" />
                              <span className="font-semibold text-lg text-foreground">
                                {formatDate(session.date)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {session.duration_minutes && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {session.duration_minutes} {language === 'ar' ? 'دقيقة' : 'min'}
                                  </span>
                                </div>
                              )}
                              {session.weight_before && (
                                <div className="flex items-center gap-2">
                                  <Droplet className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {language === 'ar' ? 'الوزن قبل: ' : 'Poids avant: '}
                                    {session.weight_before} kg
                                  </span>
                                </div>
                              )}
                              {session.weight_after && (
                                <div className="flex items-center gap-2">
                                  <Droplet className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {language === 'ar' ? 'الوزن بعد: ' : 'Poids après: '}
                                    {session.weight_after} kg
                                  </span>
                                </div>
                              )}
                              {session.blood_pressure && (
                                <div className="col-span-2 text-muted-foreground">
                                  {language === 'ar' ? 'ضغط الدم: ' : 'TA: '}
                                  {session.blood_pressure}
                                </div>
                              )}
                            </div>

                            {session.notes && (
                              <div className="pt-2 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">
                                    {language === 'ar' ? 'ملاحظات: ' : 'Notes: '}
                                  </span>
                                  {session.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {getStatusBadge(session.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* New Session Dialog */}
        <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'ar' ? 'إضافة جلسة جديدة' : 'Ajouter une nouvelle séance'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="date">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newSessionData.date}
                  onChange={(e) =>
                    setNewSessionData({ ...newSessionData, date: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration">
                  {language === 'ar' ? 'المدة (دقيقة)' : 'Durée (minutes)'}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="240"
                  value={newSessionData.duration_minutes}
                  onChange={(e) =>
                    setNewSessionData({
                      ...newSessionData,
                      duration_minutes: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight_before">
                    {language === 'ar' ? 'الوزن قبل (كجم)' : 'Poids avant (kg)'}
                  </Label>
                  <Input
                    id="weight_before"
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={newSessionData.weight_before}
                    onChange={(e) =>
                      setNewSessionData({
                        ...newSessionData,
                        weight_before: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight_after">
                    {language === 'ar' ? 'الوزن بعد (كجم)' : 'Poids après (kg)'}
                  </Label>
                  <Input
                    id="weight_after"
                    type="number"
                    step="0.1"
                    placeholder="68.5"
                    value={newSessionData.weight_after}
                    onChange={(e) =>
                      setNewSessionData({
                        ...newSessionData,
                        weight_after: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="blood_pressure">
                  {language === 'ar' ? 'ضغط الدم' : 'Tension artérielle'}
                </Label>
                <Input
                  id="blood_pressure"
                  type="text"
                  placeholder="120/80"
                  value={newSessionData.blood_pressure}
                  onChange={(e) =>
                    setNewSessionData({
                      ...newSessionData,
                      blood_pressure: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">
                  {language === 'ar' ? 'ملاحظات' : 'Remarques'}
                </Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder={language === 'ar' ? 'أي ملاحظات أخرى...' : 'Autres remarques...'}
                  value={newSessionData.notes}
                  onChange={(e) =>
                    setNewSessionData({ ...newSessionData, notes: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewSessionDialog(false)}
                >
                  {language === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                <Button onClick={handleCreateSession}>
                  {language === 'ar' ? 'حفظ' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PatientSessionsPage;
