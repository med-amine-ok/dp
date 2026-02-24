import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-pink-300 shadow-2xl p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce-gentle">💊</div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">{texts.congratulations}</h2>
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={cn('text-4xl transition-all', i < getStars() ? 'opacity-100' : 'opacity-20 grayscale')}>⭐</span>
            ))}
          </div>
          <div className="bg-pink-50 rounded-2xl p-3 mb-5">
            <p className="text-slate-600 font-semibold">{texts.attempts}: <span className="font-extrabold text-pink-600">{attempts}</span></p>
          </div>
          <div className="flex gap-3">
            <Button onClick={resetGame} className="flex-1 rounded-2xl gap-2 font-bold bg-pink-500 hover:bg-pink-600">
              <RotateCcw className="h-4 w-4" /> {texts.restart}
            </Button>
            <Button variant="outline" onClick={onBack} className="flex-1 rounded-2xl font-bold border-2">{texts.back}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-4xl mx-auto mb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {texts.back}
          </button>
          <button onClick={resetGame} className="flex items-center gap-2 text-sm font-bold text-pink-600 bg-pink-100 hover:bg-pink-200 px-4 py-2 rounded-full transition-all">
            <RotateCcw className="h-4 w-4" /> {texts.restart}
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-5xl mb-1">💊</div>
          <h1 className="text-3xl font-extrabold text-slate-800">{texts.title}</h1>
        </div>

        {/* Status banner */}
        <div className={cn(
          'rounded-2xl border-4 p-3 text-center font-extrabold transition-all mb-4',
          selectedSymptom ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-pink-50 border-pink-200 text-pink-600'
        )}>
          {selectedSymptom ? `👆 ${texts.selectTreatment}` : `👉 ${texts.selectSymptom}`}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border-2 border-pink-100 p-3 shadow-sm">
          <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
            <span>✅ {texts.matches}: {Object.keys(matches).length}/{MATCH_ITEMS.length}</span>
            <span>🎯 {texts.attempts}: {attempts}</span>
          </div>
          <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Game Board ── */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
        {/* Symptoms */}
        <div>
          <h3 className="text-base font-extrabold text-slate-700 mb-3 flex items-center gap-2">
            <span className="bg-pink-100 border-2 border-pink-300 rounded-xl px-3 py-1">🤒 {texts.symptoms}</span>
          </h3>
          <div className="space-y-2.5">
            {MATCH_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSymptomClick(item.id)}
                disabled={!!matches[item.id]}
                className={cn(
                  'w-full p-4 rounded-2xl transition-all duration-200 border-4 text-start shadow-sm',
                  matches[item.id]
                    ? 'bg-emerald-50 border-emerald-300 opacity-70'
                    : selectedSymptom === item.id
                      ? 'bg-violet-100 border-violet-400 scale-[1.03] shadow-md'
                      : 'bg-white border-pink-200 hover:border-pink-400 hover:scale-[1.01] hover:shadow-md active:scale-[0.99]'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="font-extrabold text-slate-700">
                    {language === 'ar' ? item.symptomAr : item.symptomFr}
                  </span>
                  {matches[item.id] && <CheckCircle className="h-5 w-5 text-emerald-500 ms-auto flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Treatments */}
        <div>
          <h3 className="text-base font-extrabold text-slate-700 mb-3 flex items-center gap-2">
            <span className="bg-violet-100 border-2 border-violet-300 rounded-xl px-3 py-1">💉 {texts.treatments}</span>
          </h3>
          <div className="space-y-2.5">
            {shuffledTreatments.map((item) => {
              const isMatched = !!matches[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => handleTreatmentClick(item.id)}
                  disabled={!selectedSymptom || isMatched}
                  className={cn(
                    'w-full p-4 rounded-2xl transition-all duration-200 border-4 text-start shadow-sm',
                    isMatched
                      ? 'bg-emerald-50 border-emerald-300 opacity-70'
                      : selectedSymptom && !isMatched
                        ? 'bg-white border-violet-200 hover:border-violet-400 hover:scale-[1.01] hover:shadow-md cursor-pointer active:scale-[0.99]'
                        : 'bg-white border-slate-100 opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🩺</span>
                    <span className="font-extrabold text-slate-700 text-sm leading-snug">
                      {language === 'ar' ? item.treatmentAr : item.treatmentFr}
                    </span>
                    {isMatched && <CheckCircle className="h-5 w-5 text-emerald-500 ms-auto flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Feedback toast ── */}
      {showResult && (
        <div className={cn(
          'fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl border-4 font-extrabold text-lg',
          showResult.correct ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-400 text-red-700'
        )}>
          {showResult.correct ? `✅ ${texts.correct}` : `❌ ${texts.incorrect}`}
        </div>
      )}
    </div>
  );
};

export default MedicineMatchGame;
