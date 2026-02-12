import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { CalendarIcon, FileText, Send, PartyPopper, Mic } from 'lucide-react';
import KidneyMascot from '@/components/KidneyMascot';

const HealthFormPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [date, setDate] = useState<Date>();
  const [mood, setMood] = useState<number | null>(null);
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const moodEmojis = [
    { value: 5, emoji: '😄', label: t('health.moodGreat') },
    { value: 4, emoji: '🙂', label: t('health.moodGood') },
    { value: 3, emoji: '😐', label: t('health.moodOkay') },
    { value: 2, emoji: '😕', label: t('health.moodNotGood') },
    { value: 1, emoji: '😢', label: t('health.moodBad') },
  ];

  const painEmojis = [
    { value: 0, emoji: '😊', label: language === 'ar' ? 'لا ألم' : 'Pas de douleur' },
    { value: 1, emoji: '🙂', label: language === 'ar' ? 'قليل' : 'Un peu' },
    { value: 2, emoji: '😐', label: language === 'ar' ? 'متوسط' : 'Moyen' },
    { value: 3, emoji: '😣', label: language === 'ar' ? 'مؤلم' : 'Douloureux' },
    { value: 4, emoji: '😭', label: language === 'ar' ? 'مؤلم جداً' : 'Très douloureux' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (submitted) {
    return (
      <DashboardLayout role="patient">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center animate-slide-up">
          <div className="animate-celebration">
            <KidneyMascot size="lg" mood="happy" />
          </div>
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
              {language === 'ar' ? 'أخبرنا كيف تشعر اليوم' : 'Dis-nous comment tu te sens aujourd\'hui'}
            </p>
          </div>
        </div>

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
              <CardTitle className="text-lg">{t('health.sessionDate')} 📅</CardTitle>
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
                    placeholder={language === 'ar' ? '3 ساعات' : '3 heures'}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
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
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                {painEmojis.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPainLevel(p.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
                      painLevel === p.value
                        ? 'bg-playful-orange text-white scale-110'
                        : 'bg-secondary hover:bg-secondary/80'
                    )}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <span className="text-xs font-medium">{p.label}</span>
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
                    <Checkbox
                      checked={symptoms.includes(symptom.id)}
                      onCheckedChange={() => toggleSymptom(symptom.id)}
                    />
                    <Label className="cursor-pointer">
                      {language === 'ar' ? symptom.labelAr : symptom.labelFr}
                    </Label>
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
          <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-xl gap-2">
            <Send className="h-5 w-5" />
            {t('health.submit')}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default HealthFormPage;
