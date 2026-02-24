import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingBuddyGameProps {
  onBack: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathingPattern {
  id: string;
  nameFr: string;
  nameAr: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  cycles: number;
  emoji: string;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'calm',
    nameFr: 'Respiration Calme',
    nameAr: 'التنفس الهادئ',
    inhale: 4,
    hold: 2,
    exhale: 4,
    rest: 1,
    cycles: 5,
    emoji: '🌊',
  },
  {
    id: 'relaxed',
    nameFr: 'Relaxation Profonde',
    nameAr: 'الاسترخاء العميق',
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 2,
    cycles: 4,
    emoji: '🌙',
  },
  {
    id: 'energize',
    nameFr: 'Énergie Positive',
    nameAr: 'طاقة إيجابية',
    inhale: 3,
    hold: 0,
    exhale: 3,
    rest: 0,
    cycles: 8,
    emoji: '☀️',
  },
];

const BreathingBuddyGame: React.FC<BreathingBuddyGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [timer, setTimer] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [scale, setScale] = useState(1);

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return language === 'ar' ? 'استنشق...' : 'Inspire...';
      case 'hold':
        return language === 'ar' ? 'احبس...' : 'Retiens...';
      case 'exhale':
        return language === 'ar' ? 'ازفر...' : 'Expire...';
      case 'rest':
        return language === 'ar' ? 'استرح...' : 'Repos...';
    }
  };

  const getPhaseEmoji = () => {
    switch (currentPhase) {
      case 'inhale':
        return '🌬️';
      case 'hold':
        return '💫';
      case 'exhale':
        return '🍃';
      case 'rest':
        return '✨';
    }
  };

  const getPhaseDuration = useCallback((phase: BreathingPhase) => {
    switch (phase) {
      case 'inhale':
        return selectedPattern.inhale;
      case 'hold':
        return selectedPattern.hold;
      case 'exhale':
        return selectedPattern.exhale;
      case 'rest':
        return selectedPattern.rest;
    }
  }, [selectedPattern]);

  const getNextPhase = useCallback((phase: BreathingPhase): BreathingPhase => {
    switch (phase) {
      case 'inhale':
        return selectedPattern.hold > 0 ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        return selectedPattern.rest > 0 ? 'rest' : 'inhale';
      case 'rest':
        return 'inhale';
    }
  }, [selectedPattern]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && !sessionComplete) {
      interval = setInterval(() => {
        setTimer(prev => {
          const phaseDuration = getPhaseDuration(currentPhase);
          
          if (prev >= phaseDuration - 1) {
            const nextPhase = getNextPhase(currentPhase);
            
            // Check if we're completing a cycle
            if (nextPhase === 'inhale') {
              if (currentCycle >= selectedPattern.cycles - 1) {
                setSessionComplete(true);
                setIsPlaying(false);
                return 0;
              }
              setCurrentCycle(c => c + 1);
            }
            
            setCurrentPhase(nextPhase);
            return 0;
          }
          
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentPhase, currentCycle, selectedPattern, sessionComplete, getPhaseDuration, getNextPhase]);

  // Animate the breathing circle
  useEffect(() => {
    if (currentPhase === 'inhale') {
      setScale(1 + (timer / getPhaseDuration('inhale')) * 0.5);
    } else if (currentPhase === 'exhale') {
      setScale(1.5 - (timer / getPhaseDuration('exhale')) * 0.5);
    } else if (currentPhase === 'hold') {
      setScale(1.5);
    } else {
      setScale(1);
    }
  }, [currentPhase, timer, getPhaseDuration]);

  const startSession = () => {
    setIsPlaying(true);
    setCurrentPhase('inhale');
    setTimer(0);
    setCurrentCycle(0);
    setSessionComplete(false);
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setCurrentPhase('inhale');
    setTimer(0);
    setCurrentCycle(0);
    setSessionComplete(false);
    setScale(1);
  };

  const texts = {
    title: language === 'ar' ? 'صديق التنفس' : 'Ami Respiration',
    selectPattern: language === 'ar' ? 'اختر نمط التنفس' : 'Choisis un exercice',
    start: language === 'ar' ? 'ابدأ' : 'Commencer',
    pause: language === 'ar' ? 'إيقاف' : 'Pause',
    restart: language === 'ar' ? 'إعادة' : 'Recommencer',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    cycle: language === 'ar' ? 'الدورة' : 'Cycle',
    of: language === 'ar' ? 'من' : 'sur',
    wellDone: language === 'ar' ? 'أحسنت! 🌟' : 'Bien joué ! 🌟',
    feelBetter: language === 'ar' ? 'هل تشعر بالهدوء الآن؟' : 'Tu te sens plus calme ?',
  };

  const phaseColors = {
    inhale: { bg: 'from-sky-400 to-blue-500', ring: 'ring-sky-300', text: 'text-sky-700', label: 'bg-sky-100 border-sky-300' },
    hold: { bg: 'from-violet-400 to-purple-500', ring: 'ring-violet-300', text: 'text-violet-700', label: 'bg-violet-100 border-violet-300' },
    exhale: { bg: 'from-teal-400 to-emerald-500', ring: 'ring-teal-300', text: 'text-teal-700', label: 'bg-teal-100 border-teal-300' },
    rest: { bg: 'from-rose-300 to-pink-400', ring: 'ring-rose-200', text: 'text-rose-700', label: 'bg-rose-100 border-rose-300' },
  };
  const pc = phaseColors[currentPhase];

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-violet-300 shadow-2xl p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce-gentle">🧘</div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-1">{texts.wellDone}</h2>
          <p className="text-slate-500 font-semibold mb-5">{texts.feelBetter}</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3].map(i => <span key={i} className="text-4xl">⭐</span>)}
          </div>
          <div className="flex gap-3">
            <Button onClick={startSession} className="flex-1 rounded-2xl gap-2 font-bold bg-violet-500 hover:bg-violet-600">
              <RotateCcw className="h-4 w-4" /> {texts.restart}
            </Button>
            <Button variant="outline" onClick={onBack} className="flex-1 rounded-2xl font-bold border-2">{texts.back}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-lg mx-auto mb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {texts.back}
          </button>
          <button onClick={resetSession} className="flex items-center gap-2 text-sm font-bold text-violet-600 bg-violet-100 hover:bg-violet-200 px-4 py-2 rounded-full transition-all">
            <RotateCcw className="h-4 w-4" /> {texts.restart}
          </button>
        </div>
        <div className="text-center mb-3">
          <div className="text-5xl mb-1">🌬️</div>
          <h1 className="text-3xl font-extrabold text-slate-800">{texts.title}</h1>
        </div>
      </div>

      {/* ── Pattern Selector ── */}
      {!isPlaying && (
        <div className="max-w-lg mx-auto mb-6">
          <p className="text-center font-bold text-slate-500 mb-3">{texts.selectPattern}</p>
          <div className="grid grid-cols-3 gap-3">
            {BREATHING_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={cn(
                  'p-4 rounded-3xl transition-all duration-300 border-4 text-center shadow-sm',
                  selectedPattern.id === pattern.id
                    ? 'bg-gradient-to-br from-violet-100 to-pink-100 border-violet-400 scale-105 shadow-md'
                    : 'bg-white border-slate-200 hover:border-violet-300 hover:scale-102'
                )}
              >
                <span className="text-3xl block mb-1.5">{pattern.emoji}</span>
                <span className="text-xs font-extrabold text-slate-700 leading-tight">
                  {language === 'ar' ? pattern.nameAr : pattern.nameFr}
                </span>
                <div className="mt-2 text-xs text-slate-400 font-semibold">
                  {pattern.cycles} {language === 'ar' ? 'دورات' : 'cycles'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Breathing Circle ── */}
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-3xl border-4 border-violet-100 shadow-lg p-8">
          {/* Circle */}
          <div className="relative flex items-center justify-center mb-6" style={{ height: '240px' }}>
            {/* Outer pulse rings */}
            {isPlaying && (
              <>
                <div className={cn('absolute rounded-full border-4 transition-all duration-1000 opacity-30', pc.ring, 'border-current')} style={{ width: `${200 * scale * 1.3}px`, height: `${200 * scale * 1.3}px` }} />
                <div className={cn('absolute rounded-full border-4 transition-all duration-1000 opacity-20', pc.ring, 'border-current')} style={{ width: `${200 * scale * 1.6}px`, height: `${200 * scale * 1.6}px` }} />
              </>
            )}
            {/* Main circle */}
            <div
              className={cn('rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out shadow-xl bg-gradient-to-br', pc.bg)}
              style={{ width: `${200 * Math.min(scale, 1.5)}px`, height: `${200 * Math.min(scale, 1.5)}px` }}
            >
              <div className="text-center">
                <span className="text-5xl block mb-1">{getPhaseEmoji()}</span>
                <span className="text-base font-extrabold text-white drop-shadow">
                  {isPlaying ? getPhaseText() : selectedPattern.emoji}
                </span>
                {isPlaying && (
                  <span className="block text-4xl font-black text-white mt-1 drop-shadow-md">
                    {getPhaseDuration(currentPhase) - timer}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Phase label */}
          {isPlaying && (
            <div className={cn('text-center mb-4 py-2 px-4 rounded-2xl border-2 mx-auto w-fit font-extrabold text-sm', pc.label, pc.text)}>
              {getPhaseText()} — {texts.cycle} {currentCycle + 1}/{selectedPattern.cycles}
            </div>
          )}

          {/* Cycle dots */}
          {isPlaying && (
            <div className="flex justify-center gap-2 mb-5">
              {Array.from({ length: selectedPattern.cycles }).map((_, i) => (
                <div key={i} className={cn('w-3 h-3 rounded-full transition-all duration-300', i < currentCycle ? 'bg-emerald-400 scale-110' : i === currentCycle ? 'bg-violet-500 scale-125' : 'bg-slate-200')} />
              ))}
            </div>
          )}

          {/* Control */}
          <div className="flex justify-center">
            <button
              onClick={isPlaying ? pauseSession : startSession}
              className={cn(
                'flex items-center gap-3 px-8 py-4 rounded-full font-extrabold text-lg shadow-lg transition-all hover:scale-105 active:scale-95',
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-500 text-white'
                  : 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white'
              )}
            >
              {isPlaying ? <><Pause className="h-5 w-5" /> {texts.pause}</> : <><Play className="h-5 w-5" /> {texts.start}</>}
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-indigo-600">
            💡 {language === 'ar' ? 'اجلس في وضع مريح وأغمض عينيك 😌' : 'Assieds-toi confortablement et ferme les yeux 😌'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreathingBuddyGame;
