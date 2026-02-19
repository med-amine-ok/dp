import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { FileText, Heart, AlertCircle, Calendar, Clock } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';

interface HealthForm {
  id: string;
  patient_id: string;
  mood: number;
  pain_level: number;
  symptoms: string[];
  session_date: string | null;
  session_duration: number | null;
  infused_quantity: string;
  drained_quantity: string;
  notes: string;
  created_at: string;
  patient_name_ar?: string;
  patient_name_fr?: string;
}

interface Patient {
  id: string;
  name_ar: string;
  name_fr: string;
  age: number;
  status: 'active' | 'recovering' | 'critical';
}

const DoctorHealthFormsPage: React.FC = () => {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [healthForms, setHealthForms] = useState<HealthForm[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Fetch doctor ID and patients
  useEffect(() => {
    if (!user) return;
    const fetchDoctorData = async () => {
      try {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorData) {
          setDoctorId(doctorData.id);

          const { data: patientsData } = await supabase
            .from('patients')
            .select('*')
            .eq('assigned_doctor_id', doctorData.id);

          if (patientsData) {
            setPatients(patientsData);
            if (patientsData.length > 0) {
              setSelectedPatientId(patientsData[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };
    fetchDoctorData();
  }, [user]);

  // Fetch health forms for selected patient
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchHealthForms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('health_forms')
          .select('*')
          .eq('patient_id', selectedPatientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHealthForms(data || []);
      } catch (error) {
        console.error('Error fetching health forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthForms();
  }, [selectedPatientId]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return 'Unknown';
    return language === 'ar' ? patient.name_ar : patient.name_fr;
  };

  const getPatientStatus = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.status || 'active';
  };

  const getMoodEmoji = (mood: number) => {
    const moodMap: { [key: number]: string } = {
      1: '😞',
      2: '😟',
      3: '😐',
      4: '🙂',
      5: '😄',
    };
    return moodMap[mood] || '😐';
  };

  const getSymptomLabel = (symptom: string) => {
    const symptomMap: { [key: string]: { ar: string; fr: string } } = {
      fatigue: { ar: 'إرهاق', fr: 'Fatigue' },
      nausea: { ar: 'غثيان', fr: 'Nausée' },
      headache: { ar: 'صداع', fr: 'Mal de tête' },
      muscle_pain: { ar: 'ألم عضلي', fr: 'Douleur musculaire' },
      itching: { ar: 'حكة', fr: 'Démangeaisons' },
      swelling: { ar: 'تورم', fr: 'Gonflement' },
    };
    return symptomMap[symptom]?.[language] || symptom;
  };

  const currentPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'نماذج الصحة' : 'Formulaires de santé'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patients List */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'مرضاي' : 'Mes patients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {patients.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === 'ar' ? 'لا يوجد مرضى' : 'Aucun patient'}
                    </p>
                  ) : (
                    patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                          selectedPatientId === patient.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {language === 'ar' ? patient.name_ar : patient.name_fr}
                          </p>
                          
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Health Forms */}
          <div className="lg:col-span-3 space-y-4">
            {currentPatient && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {(language === 'ar' ? currentPatient.name_ar : currentPatient.name_fr).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {language === 'ar' ? currentPatient.name_ar : currentPatient.name_fr}
                        </p>
                       
                      </div>
                    </div>
                    <StatusBadge status={currentPatient.status} />
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {language === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
                </CardContent>
              </Card>
            ) : healthForms.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {language === 'ar' ? 'لا توجد نماذج صحة' : 'Aucun formulaire de santé'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? `${healthForms.length} نموذج` : `${healthForms.length} formulaires`}
                  </p>
                </div>

                {healthForms.map((form) => (
                  <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 space-y-4">
                      {/* Header with Date and Mood */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(form.created_at).toLocaleDateString(
                                language === 'ar' ? 'ar-EG' : 'fr-FR',
                                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(form.created_at).toLocaleTimeString(
                                language === 'ar' ? 'ar-EG' : 'fr-FR',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-4xl">{getMoodEmoji(form.mood)}</div>
                      </div>

                      {/* Mood and Pain Level */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === 'ar' ? 'المزاج' : 'Humeur'}
                          </p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  'h-2 flex-1 rounded-full transition-colors',
                                  i <= form.mood ? 'bg-primary' : 'bg-muted'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-destructive" />
                            <p className="text-sm font-medium text-muted-foreground">
                              {language === 'ar' ? 'مستوى الألم' : 'Niveau de douleur'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  'h-2 flex-1 rounded-full transition-colors',
                                  i <= form.pain_level ? 'bg-destructive' : 'bg-muted'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Symptoms */}
                      {form.symptoms && form.symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            {language === 'ar' ? 'الأعراض' : 'Symptômes'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {form.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="outline">
                                {getSymptomLabel(symptom)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Session Info */}
                      {(form.session_date || form.session_duration) && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                          {form.session_date && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'تاريخ الجلسة' : 'Date de la séance'}
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {new Date(form.session_date).toLocaleDateString(
                                  language === 'ar' ? 'ar-EG' : 'fr-FR'
                                )}
                              </p>
                            </div>
                          )}
                          {form.session_duration && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'المدة' : 'Durée'}
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {form.session_duration} {language === 'ar' ? 'دقيقة' : 'min'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quantities */}
                      {(form.infused_quantity || form.drained_quantity) && (
                        <div className="grid grid-cols-2 gap-4">
                          {form.infused_quantity && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'الكمية المالية' : 'Quantité infusée'}
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {form.infused_quantity}
                              </p>
                            </div>
                          )}
                          {form.drained_quantity && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? 'الكمية المستنزفة' : 'Quantité drainée'}
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {form.drained_quantity}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {form.notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            {language === 'ar' ? 'ملاحظات' : 'Notes'}
                          </p>
                          <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                            {form.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorHealthFormsPage;
