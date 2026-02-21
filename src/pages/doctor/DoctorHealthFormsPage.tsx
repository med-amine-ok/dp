import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  FileText,
  Heart,
  Calendar,
  Clock,
  Droplet,
  Activity,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Search,
  Thermometer,
  CloudLightning,
  Activity as ActivityIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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

  const getMoodEmoji = (mood: number) => {
    const moods = [
      { emoji: '😞', label: { ar: 'حزين جداً', fr: 'Très triste' } },
      { emoji: '😟', label: { ar: 'حزين', fr: 'Triste' } },
      { emoji: '😐', label: { ar: 'متعادل', fr: 'Neutre' } },
      { emoji: '🙂', label: { ar: 'سعيد', fr: 'Joyeux' } },
      { emoji: '😄', label: { ar: 'سعيد جداً', fr: 'Très joyeux' } },
    ];
    return moods[mood - 1] || moods[2];
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

  const [patientSearch, setPatientSearch] = useState('');
  const currentPatient = patients.find(p => p.id === selectedPatientId);
  const filteredPatientsList = patients.filter(p =>
    (language === 'ar' ? p.name_ar : p.name_fr).toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {language === 'ar' ? 'نماذج الصحة' : 'Formulaires de santé'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'متابعة الحالة اليومية لمرضاك' : 'Suivi de l\'état quotidien de vos patients'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Patient Selection */}
        <div className="lg:hidden -mx-6 px-6 overflow-hidden">
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-2xl transition-all flex-shrink-0 border-2',
                    selectedPatientId === patient.id
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                      : 'bg-card border-transparent text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={cn(
                      "font-bold text-xs",
                      selectedPatientId === patient.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                      {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-sm whitespace-nowrap">
                    {language === 'ar' ? patient.name_ar : patient.name_fr}
                  </span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Patient Sidebar Refined */}
          <aside className="hidden lg:flex flex-col gap-4 lg:col-span-1 sticky top-6 max-h-[calc(100vh-6rem)]">
            <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden flex flex-col flex-1">
              <div className="p-5 bg-muted/30 border-b border-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-black text-sm uppercase tracking-wider text-primary">
                      {language === 'ar' ? 'مرضاي' : 'Mes patients'}
                    </span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground rounded-lg px-2 h-6 font-black">
                    {patients.length}
                  </Badge>
                </div>

                <div className="relative group">
                  <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary",
                    isRTL ? "right-3" : "left-3"
                  )} />
                  <Input
                    placeholder={language === 'ar' ? 'بحث...' : 'Chercher...'}
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className={cn(
                      "h-10 bg-background border-muted hover:border-primary/30 transition-all rounded-xl text-sm",
                      isRTL ? "pr-9 pl-3" : "pl-9 pr-3"
                    )}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1.5">
                  {filteredPatientsList.length === 0 ? (
                    <div className="py-12 text-center space-y-2 opacity-40 italic">
                      <Search className="h-8 w-8 mx-auto" />
                      <p className="text-xs">{language === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}</p>
                    </div>
                  ) : (
                    filteredPatientsList.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative overflow-hidden group',
                          selectedPatientId === patient.id
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                            : 'hover:bg-primary/5 text-foreground bg-transparent border border-transparent'
                        )}
                      >
                        {/* Active Indicator Bar */}
                        {selectedPatientId === patient.id && (
                          <div className={cn(
                            "absolute top-0 bottom-0 w-1 bg-white/40",
                            isRTL ? "left-0" : "right-0"
                          )} />
                        )}

                        <Avatar className={cn(
                          "w-10 h-10 border-2 shadow-sm transition-transform group-hover:scale-105 shrink-0",
                          selectedPatientId === patient.id ? "border-white/20" : "border-primary/5"
                        )}>
                          <AvatarFallback className={cn(
                            "font-black text-xs",
                            selectedPatientId === patient.id ? "bg-white/10 text-white" : "bg-primary/5 text-primary"
                          )}>
                            {(language === 'ar' ? patient.name_ar : patient.name_fr).charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-left min-w-0">
                          <p className="font-bold text-sm leading-tight">
                            {language === 'ar' ? patient.name_ar : patient.name_fr}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              patient.status === 'critical' ? 'bg-destructive' :
                                patient.status === 'recovering' ? 'bg-warning' : 'bg-success',
                              selectedPatientId === patient.id && "bg-white"
                            )} />
                            <span className={cn(
                              "text-[10px] uppercase font-heavy tracking-widest",
                              selectedPatientId === patient.id ? "text-white/80" : "text-muted-foreground"
                            )}>
                              {patient.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 bg-muted/10 border-t border-muted/50 text-center">
                <Button variant="ghost" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary p-0 h-auto">
                  {language === 'ar' ? 'إدارة جميع المرضى' : 'Gérer tous les patients'}
                </Button>
              </div>
            </Card>
          </aside>

          {/* Health Forms Detail Section */}
          <div className="lg:col-span-3 space-y-6">
            {currentPatient && (
              <Card className="border-none card-shadow bg-primary text-primary-foreground overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                      <div className="relative hidden sm:block">
                        <Avatar className="w-20 h-20 border-4 border-white/20 shadow-2xl">
                          <AvatarFallback className="bg-white/10 text-white text-3xl font-black">
                            {(language === 'ar' ? currentPatient.name_ar : currentPatient.name_fr).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-primary" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight">
                          {language === 'ar' ? currentPatient.name_ar : currentPatient.name_fr}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <Badge variant="secondary" className="bg-white/10 text-white border-white/10 backdrop-blur-md rounded-lg px-4 py-1">
                            {currentPatient.age} {language === 'ar' ? 'سنة' : 'ans'}
                          </Badge>
                          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                            <StatusBadge status={currentPatient.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">
                  {language === 'ar' ? 'جاري تحميل البيانات...' : 'Chargement des données...'}
                </p>
              </div>
            ) : healthForms.length === 0 ? (
              <Card className="border-dashed border-2 bg-muted/20 py-20 text-center">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                  <CardTitle className="text-xl opacity-50">
                    {language === 'ar' ? 'لا توجد نماذج بعد' : 'Aucun formulaire encore'}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {language === 'ar'
                      ? 'سيظهر التاريخ الصحي للمريض هنا بمجرد إرساله للنماذج'
                      : 'L\'historique de santé apparaîtra ici dès que le patient l\'envoie.'}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">
                    {language === 'ar' ? `تاريخ النماذج (${healthForms.length})` : `Historique des formulaires (${healthForms.length})`}
                  </h3>
                </div>

                {healthForms.map((form) => {
                  const moodInfo = getMoodEmoji(form.mood);
                  return (
                    <Card key={form.id} className="border-none card-shadow group transition-all hover:translate-y-[-1px]">
                      <CardContent className="p-0">
                        {/* Summary Header */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-muted/30">
                          <div className="flex items-center gap-4">
                            <div className="text-5xl bg-secondary/30 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner">
                              {moodInfo.emoji}
                            </div>
                            <div>
                              <span className="font-black text-xl text-foreground block">
                                {moodInfo.label[language]}
                              </span>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(form.created_at).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'fr-FR',
                                    { day: 'numeric', month: 'short', year: 'numeric' }
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  {new Date(form.created_at).toLocaleTimeString(
                                    language === 'ar' ? 'ar-EG' : 'fr-FR',
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Details Content */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Side: Symptoms */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-[0.15em]">
                              <Thermometer className="h-4 w-4 text-primary" />
                              {language === 'ar' ? 'الأعراض والعلامات' : 'Symptômes & Signes'}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {form.symptoms && form.symptoms.length > 0 ? (
                                form.symptoms.map((symptom, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 rounded-xl py-1.5 px-4 font-bold"
                                  >
                                    {getSymptomLabel(symptom)}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground italic">
                                  {language === 'ar' ? 'لا توجد أعراض مبلغ عنها' : 'Aucun symptôme signalé'}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Side: Medical Specs & Pain Level */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-[0.15em]">
                              <Activity className="h-4 w-4 text-primary" />
                              {language === 'ar' ? 'البيانات الطبية' : 'Données Médicales'}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Pain Level Box */}
                              <div className="bg-destructive/5 p-4 rounded-3xl border border-destructive/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                                  <Heart className="h-8 w-8 text-destructive fill-destructive" />
                                </div>
                                <p className="text-[10px] uppercase font-black text-destructive/70 tracking-widest mb-1 relative z-10">
                                  {language === 'ar' ? 'مستوى الألم' : 'Douleur'}
                                </p>
                                <div className="flex items-baseline gap-1 relative z-10">
                                  <span className="font-black text-2xl text-destructive">{form.pain_level}</span>
                                  <span className="text-xs font-bold text-destructive/50">/ 5</span>
                                </div>
                              </div>

                              {/* Duration Box */}
                              <div className="bg-muted/30 p-4 rounded-3xl border border-muted/10">
                                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">
                                  {language === 'ar' ? 'المدة' : 'Durée'}
                                </p>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-black text-2xl text-foreground">{form.session_duration || '-'}</span>
                                  <span className="text-xs font-bold text-muted-foreground">min</span>
                                </div>
                              </div>

                              {/* Fluids Box */}
                              <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 col-span-2">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-primary/70 tracking-widest">
                                      {language === 'ar' ? 'الكميات (مل)' : 'Quantités (ml)'}
                                    </p>
                                    <div className="flex items-center gap-6">
                                      <div className="flex flex-col">
                                        <span className="text-[9px] text-muted-foreground uppercase font-bold">{language === 'ar' ? 'مغذي' : 'Infusion'}</span>
                                        <span className="font-black text-lg text-foreground">{form.infused_quantity || '0'}</span>
                                      </div>
                                      <div className="h-8 w-px bg-primary/10" />
                                      <div className="flex flex-col">
                                        <span className="text-[9px] text-muted-foreground uppercase font-bold">{language === 'ar' ? 'مستخلص' : 'Drainage'}</span>
                                        <span className="font-black text-lg text-foreground">{form.drained_quantity || '0'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Droplet className="h-8 w-8 text-primary opacity-20" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes Section - Full Width */}
                          {form.notes && (
                            <div className="md:col-span-2 space-y-3 pt-2">
                              <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                                <CloudLightning className="h-4 w-4 text-warning" />
                                {language === 'ar' ? 'ملاحظات إضافية' : 'Notes additionnelles'}
                              </div>
                              <div className="p-4 bg-muted/20 rounded-2xl border-l-4 border-warning italic text-foreground text-sm leading-relaxed">
                                "{form.notes}"
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorHealthFormsPage;
