import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Star, CheckCircle, XCircle, Pill } from 'lucide-react';

interface MatchItem {
  id: string;
  symptomFr: string;
  symptomAr: string;
  treatmentFr: string;
  treatmentAr: string;
  emoji: string;
}

interface MedicineMatchGameProps {
  onBack: () => void;
}

const MATCH_ITEMS: MatchItem[] = [
  {
    id: '1',
    symptomFr: 'Fièvre',
    symptomAr: 'حمى',
    treatmentFr: 'Repos et hydratation',
    treatmentAr: 'الراحة والترطيب',
    emoji: '🤒',
  },
  {
    id: '2',
    symptomFr: 'Fatigue',
    symptomAr: 'تعب',
    treatmentFr: 'Sommeil et vitamines',
    treatmentAr: 'النوم والفيتامينات',
    emoji: '😴',
  },
  {
    id: '3',
    symptomFr: 'Soif excessive',
    symptomAr: 'عطش شديد',
    treatmentFr: 'Boire de l\'eau régulièrement',
    treatmentAr: 'شرب الماء بانتظام',
    emoji: '💧',
  },
  {
    id: '4',
    symptomFr: 'Douleur musculaire',
    symptomAr: 'ألم عضلي',
    treatmentFr: 'Étirements et repos',
    treatmentAr: 'التمدد والراحة',
    emoji: '💪',
  },
  {
    id: '5',
    symptomFr: 'Nausée',
    symptomAr: 'غثيان',
    treatmentFr: 'Manger léger et gingembre',
    treatmentAr: 'تناول طعام خفيف وزنجبيل',
    emoji: '🤢',
  },
  {
    id: '6',
    symptomFr: 'Mal de tête',
    symptomAr: 'صداع',
    treatmentFr: 'Repos dans le calme',
    treatmentAr: 'الراحة في الهدوء',
    emoji: '🤕',
  },
];

const MedicineMatchGame: React.FC<MedicineMatchGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [shuffledTreatments, setShuffledTreatments] = useState<MatchItem[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState<{ id: string; correct: boolean } | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setShuffledTreatments([...MATCH_ITEMS].sort(() => Math.random() - 0.5));
    setSelectedSymptom(null);
    setMatches({});
    setAttempts(0);
    setShowResult(null);
    setGameComplete(false);
  };

  const handleSymptomClick = (id: string) => {
    if (matches[id]) return;
    setSelectedSymptom(id);
    setShowResult(null);
  };

  const handleTreatmentClick = (treatmentId: string) => {
    if (!selectedSymptom || matches[selectedSymptom]) return;

    setAttempts(prev => prev + 1);
    const isCorrect = selectedSymptom === treatmentId;
    
    setShowResult({ id: selectedSymptom, correct: isCorrect });

    if (isCorrect) {
      setMatches(prev => ({ ...prev, [selectedSymptom]: true }));
      
      // Check if game is complete
      const newMatchCount = Object.keys(matches).length + 1;
      if (newMatchCount === MATCH_ITEMS.length) {
        setTimeout(() => setGameComplete(true), 1000);
      }
    }

    setTimeout(() => {
      setSelectedSymptom(null);
      setShowResult(null);
    }, 1500);
  };

  const progress = (Object.keys(matches).length / MATCH_ITEMS.length) * 100;

  const getStars = () => {
    const accuracy = (Object.keys(matches).length / attempts) * 100;
    if (accuracy >= 80) return 3;
    if (accuracy >= 50) return 2;
    return 1;
  };

  const texts = {
    title: language === 'ar' ? 'مطابقة العلاجات' : 'Association Médicaments',
    symptoms: language === 'ar' ? 'الأعراض' : 'Symptômes',
    treatments: language === 'ar' ? 'العلاجات' : 'Traitements',
    selectSymptom: language === 'ar' ? 'اختر عرضاً' : 'Choisis un symptôme',
    selectTreatment: language === 'ar' ? 'الآن اختر العلاج المناسب' : 'Maintenant choisis le bon traitement',
    correct: language === 'ar' ? 'صحيح!' : 'Correct !',
    incorrect: language === 'ar' ? 'حاول مرة أخرى!' : 'Essaie encore !',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    restart: language === 'ar' ? 'إعادة اللعب' : 'Rejouer',
    congratulations: language === 'ar' ? 'مبروك! 🎉' : 'Félicitations ! 🎉',
    attempts: language === 'ar' ? 'المحاولات' : 'Tentatives',
    matches: language === 'ar' ? 'التطابقات' : 'Correspondances',
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-playful-pink/10 via-background to-playful-purple/10 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md mx-auto animate-scale-in bg-gradient-to-br from-playful-pink/10 to-playful-purple/10">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce-gentle">💊</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {texts.congratulations}
            </h2>
            
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-10 w-10 transition-all',
                    i < getStars()
                      ? 'text-playful-yellow fill-playful-yellow animate-pulse-soft'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>

            <p className="text-muted-foreground mb-6">
              {texts.attempts}: {attempts}
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {texts.restart}
              </Button>
              <Button variant="outline" onClick={onBack}>
                {texts.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-playful-pink/10 via-background to-playful-purple/10 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {texts.back}
          </Button>
          <Button
            variant="outline"
            onClick={resetGame}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </Button>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            💊 {texts.title}
          </h1>
          <p className="text-muted-foreground">
            {selectedSymptom ? texts.selectTreatment : texts.selectSymptom}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{texts.matches}: {Object.keys(matches).length}/{MATCH_ITEMS.length}</span>
            <span>{texts.attempts}: {attempts}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Symptoms Column */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            🤒 {texts.symptoms}
          </h3>
          <div className="space-y-3">
            {MATCH_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSymptomClick(item.id)}
                disabled={matches[item.id]}
                className={cn(
                  'w-full p-4 rounded-xl transition-all duration-300 border-2 text-start',
                  matches[item.id] 
                    ? 'bg-success/20 border-success opacity-60'
                    : selectedSymptom === item.id
                      ? 'bg-playful-purple/20 border-playful-purple scale-[1.02]'
                      : 'bg-card border-border hover:border-playful-purple/50 hover:scale-[1.01]',
                  showResult?.id === item.id && showResult.correct && 'animate-celebration'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="font-medium text-foreground">
                    {language === 'ar' ? item.symptomAr : item.symptomFr}
                  </span>
                  {matches[item.id] && (
                    <CheckCircle className="h-5 w-5 text-success ms-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Treatments Column */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5" /> {texts.treatments}
          </h3>
          <div className="space-y-3">
            {shuffledTreatments.map((item) => {
              const isMatched = matches[item.id];
              const isWrongChoice = showResult?.id && showResult.id !== item.id && !showResult.correct && selectedSymptom === showResult.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTreatmentClick(item.id)}
                  disabled={!selectedSymptom || isMatched}
                  className={cn(
                    'w-full p-4 rounded-xl transition-all duration-300 border-2 text-start',
                    isMatched
                      ? 'bg-success/20 border-success opacity-60'
                      : selectedSymptom && !isMatched
                        ? 'bg-card border-border hover:border-playful-pink/50 hover:scale-[1.01] cursor-pointer'
                        : 'bg-card border-border opacity-50',
                    showResult?.id === item.id && showResult.correct && 'bg-success/20 border-success'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💊</span>
                    <span className="font-medium text-foreground">
                      {language === 'ar' ? item.treatmentAr : item.treatmentFr}
                    </span>
                    {isMatched && (
                      <CheckCircle className="h-5 w-5 text-success ms-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Toast */}
      {showResult && (
        <div className={cn(
          'fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full animate-fade-in',
          showResult.correct 
            ? 'bg-success text-success-foreground'
            : 'bg-destructive text-destructive-foreground'
        )}>
          <div className="flex items-center gap-2">
            {showResult.correct ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="font-medium">
              {showResult.correct ? texts.correct : texts.incorrect}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineMatchGame;
