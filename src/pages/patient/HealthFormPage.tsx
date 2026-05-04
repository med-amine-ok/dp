import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { CalendarIcon, FileText, Send, PartyPopper, Mic, Clock, Droplets, Activity } from 'lucide-react';
import KidneyMascot from '@/components/KidneyMascot';
import { supabase } from '@/lib/supabase';

const HealthFormPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mood, setMood] = useState<number | null>(null);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [infusedQuantity, setInfusedQuantity] = useState('');
  const [drainedQuantity, setDrainedQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('new');

  // Fetch Patient ID
  useEffect(() => {
    if (!user) return;
    const fetchPatientId = async () => {
      const { data } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) setPatientId(data.id);
    };
    fetchPatientId();
  }, [user]);

  // Fetch History
  useEffect(() => {
    if (!patientId) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('health_forms')
        .select('*')
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });
        
      if (!error && data) {
        setHistory(data);
      }
    };
    fetchHistory();
  }, [patientId, submitted]);

  const moodEmojis = [
    { value: 5, emoji: '😄', label: t('health.moodGreat') },
    { value: 4, emoji: '🙂', label: t('health.moodGood') },
    { value: 3, emoji: '😐', label: t('health.moodOkay') },
    { value: 2, emoji: '😕', label: t('health.moodNotGood') },
    { value: 1, emoji: '😢', label: t('health.moodBad') },
  ];

  const painEmojis = [
    { value: 0, emoji: '😊', label: language === 'ar' ? 'لا ألم' : 'Pas de douleur' },
    { value: 1, emoji: '🙂', label: language === 'ar' ? 'قليل جداً' : 'Très peu' },
    { value: 2, emoji: '😐', label: language === 'ar' ? 'قليل' : 'Un peu' },
    { value: 3, emoji: '😕', label: language === 'ar' ? 'متوسط' : 'Moyen' },
    { value: 4, emoji: '😣', label: language === 'ar' ? 'مؤلم' : 'Douloureux' },
    { value: 5, emoji: '😭', label: language === 'ar' ? 'مؤلم جداً' : 'Très douloureux' },
  ];

  const symptomOptions = [
    { id: 'fatigue', labelFr: 'Fatigue', labelAr: 'تعب' },
    { id: 'nausea', labelFr: 'Nausée', labelAr: 'غثيان' },
    { id: 'headache', labelFr: 'Mal de tête', labelAr: 'صداع' },
    { id: 'dizziness', labelFr: 'Vertiges', labelAr: 'دوخة' },
    { id: 'muscle_cramps', labelFr: 'Crampes musculaires', labelAr: 'تشنجات عضلية' },
    { id: 'itching', labelFr: 'Démangeaisons', labelAr: 'حكة' },
  ];

  const toggleSymptom = (symptomId: string) => {
    setSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !date) return;

    setIsSubmitting(true);
    try {
      // Parse duration to int (assuming minutes or hours). DB expects INT.
      // If user types '3h', parseInt might handle it if it starts with number.
      // If just text, we might need a workaround. For now, try parseInt.
      const durationInt = parseInt(duration) || 0;

      const { error } = await supabase.from('health_forms').insert({
        patient_id: patientId,
        mood: mood || 3, // Default normal
        pain_level: painLevel || 0,
        symptoms: symptoms,
        session_date: format(date, 'yyyy-MM-dd'),
        session_duration: durationInt,
        infused_quantity: infusedQuantity,
        drained_quantity: drainedQuantity,
        notes: notes,
      });

      if (error) throw error;

      setSubmitted(true);
      // Reset form
      setMood(null);
      setPainLevel(null);
      setSymptoms([]);
      setDuration('');
      setNotes('');
      setInfusedQuantity('');
      setDrainedQuantity('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting health form:', error);
      // Optional: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout role="patient">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center animate-slide-up">
          <PartyPopper className="h-16 w-16 text-playful-yellow mt-6 animate-bounce-gentle" />
          <h1 className="text-3xl font-bold text-foreground mt-4">
            {t('health.submitted')} 🎉
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar'
              ? 'شكراً لك! طبيبك سيراجع المعلومات.'
              : 'Merci ! Ton médecin va regarder les informations.'}
          </p>
          <Button
            className="mt-6"
            onClick={() => setSubmitted(false)}
          >
            {language === 'ar' ? 'ملء نموذج جديد' : 'Remplir un nouveau formulaire'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-playful-green/20 flex items-center justify-center">
            <FileText className="h-7 w-7 text-playful-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('health.title')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'أخبرنا كيف تشعر اليوم أو تحقق من سجلك' : 'Dis-nous comment tu te sens aujourd\'hui ou consulte ton historique'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 mb-6 rounded-xl bg-secondary/50">
            <TabsTrigger value="new" className="text-base rounded-lg h-11 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              ✨ {language === 'ar' ? 'نموذج جديد' : 'Nouveau Formulaire'}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base rounded-lg h-11 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              📚 {language === 'ar' ? 'سجلي  ' : 'Mon Historique'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6 mt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Selection */}
              <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{t('health.mood')} 😊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                {moodEmojis.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
                      mood === m.value
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Session Date & Duration */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{t('health.sessionDetails')} 📅</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('health.sessionDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP', { locale: language === 'ar' ? ar : fr }) : (
                          language === 'ar' ? 'اختر تاريخاً' : 'Choisis une date'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={language === 'ar' ? ar : fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{t('health.duration')}</Label>
                  <Input
                    type="text"
                    placeholder={language === 'ar' ? '30' : '30'}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'دقائق' : 'minutes'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('health.infusedQuantity')}</Label>
                  <Input
                    type="text"
                    placeholder={language === 'ar' ? '1500 مل' : '1500 ml'}
                    value={infusedQuantity}
                    onChange={(e) => setInfusedQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('health.drainedQuantity')}</Label>
                  <Input
                    type="text"
                    placeholder={language === 'ar' ? '1600 مل' : '1600 ml'}
                    value={drainedQuantity}
                    onChange={(e) => setDrainedQuantity(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pain Level */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{t('health.painLevel')} 💪</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-5xl font-bold text-playful-orange mb-2">
                    {painLevel !== null ? painLevel : 0}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {painLevel !== null ? painEmojis[painLevel].label : (language === 'ar' ? 'اختر مستوى الألم' : 'Sélectionner')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Slider
                  value={[painLevel !== null ? painLevel : 0]}
                  onValueChange={(value) => setPainLevel(value[0])}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full cursor-pointer"
                />

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>{language === 'ar' ? 'بلا ألم' : 'Sans douleur'}</span>
                  <span>{language === 'ar' ? 'ألم شديد جداً' : 'Très douloureux'}</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {painEmojis.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPainLevel(p.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border-2',
                      painLevel === p.value
                        ? 'bg-playful-orange text-white border-playful-orange scale-105'
                        : 'bg-secondary hover:bg-secondary/80 border-transparent'
                    )}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{t('health.symptoms')} 📋</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {symptomOptions.map((symptom) => (
                  <div
                    key={symptom.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                      symptoms.includes(symptom.id)
                        ? 'bg-playful-pink/20 border-2 border-playful-pink'
                        : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
                    )}
                    onClick={() => toggleSymptom(symptom.id)}
                  >
                    {/* Custom Checkbox Visual */}
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                      symptoms.includes(symptom.id)
                        ? "bg-playful-pink border-playful-pink"
                        : "bg-background border-input"
                    )}>
                      {symptoms.includes(symptom.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="cursor-pointer flex-1">
                      {language === 'ar' ? symptom.labelAr : symptom.labelFr}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {t('health.notes')} ✍️
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Mic className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={language === 'ar' ? 'اكتب ملاحظاتك هنا...' : 'Écris tes notes ici...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold rounded-xl gap-2"
                disabled={isSubmitting || !patientId}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {t('health.submit')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-0">
            {history.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {language === 'ar' ? 'لا يوجد سجل بعد' : 'Aucun historique pour le moment'}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  {language === 'ar' 
                    ? 'لم تقم بملء أي نموذج صحي بعد. ابدأ الآن!' 
                    : 'Tu n\'as pas encore rempli de formulaire de santé. Commence maintenant !'}
                </p>
                <Button onClick={() => setActiveTab('new')} className="rounded-full px-8">
                  {language === 'ar' ? 'نموذج جديد' : 'Nouveau Formulaire'}
                </Button>
              </div>
            ) : (
              history.map((record) => {
                const moodObj = moodEmojis.find((m) => m.value === record.mood) || moodEmojis[2];
                const painObj = painEmojis.find((p) => p.value === record.pain_level) || painEmojis[0];
                const displayDate = record.session_date ? format(parseISO(record.session_date), 'PPP', { locale: language === 'ar' ? ar : fr }) : '';
                
                return (
                  <Card key={record.id} className="overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="bg-primary/5 px-4 py-3 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2 font-medium text-primary">
                        <CalendarIcon className="h-4 w-4" />
                        {displayDate}
                      </div>
                      <div className="flex bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {record.session_duration ? `${record.session_duration} ${language === 'ar' ? 'دقيقة' : 'min'}` : '-'}
                      </div>
                    </div>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl">
                          <div className="text-4xl bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm">
                            {moodObj.emoji}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                              {t('health.mood')}
                            </p>
                            <p className="font-bold text-foreground">
                              {moodObj.label}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl">
                          <div className="text-4xl bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm">
                            {painObj.emoji}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                              {t('health.painLevel')}
                            </p>
                            <p className="font-bold text-foreground">
                              {painObj.label} ({record.pain_level}/5)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-secondary/30 p-4 rounded-2xl h-full">
                          <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <Activity className="h-4 w-4 text-playful-blue" />
                            {language === 'ar' ? 'التفاصيل الطبية' : 'Détails Médicaux'}
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Droplets className="h-3.5 w-3.5 text-playful-blue" />
                                {t('health.infusedQuantity')}
                              </span>
                              <span className="font-semibold">{record.infused_quantity || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Droplets className="h-3.5 w-3.5 text-playful-pink" />
                                {t('health.drainedQuantity')}
                              </span>
                              <span className="font-semibold">{record.drained_quantity || '-'}</span>
                            </div>
                          </div>

                          {record.symptoms && record.symptoms.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-1.5">{t('health.symptoms')}:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {record.symptoms.map((sym: string) => {
                                  const option = symptomOptions.find(o => o.id === sym);
                                  return (
                                    <span key={sym} className="bg-white border text-xs px-2 py-0.5 rounded-full">
                                      {option ? (language === 'ar' ? option.labelAr : option.labelFr) : sym}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HealthFormPage;
