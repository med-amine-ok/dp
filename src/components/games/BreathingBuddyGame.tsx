import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, Play, Pause, RotateCcw, Wind, Heart, Star } from 'lucide-react';

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

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-playful-purple/10 via-background to-playful-pink/10 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md mx-auto animate-scale-in bg-gradient-to-br from-playful-purple/10 to-playful-pink/10">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce-gentle">🧘</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {texts.wellDone}
            </h2>
            <p className="text-muted-foreground mb-4">{texts.feelBetter}</p>
            
            <div className="flex justify-center gap-1 mb-6">
              {[1,2,3].map(i => (
                <Star key={i} className="h-8 w-8 text-playful-yellow fill-playful-yellow animate-pulse-soft" />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={startSession} className="gap-2">
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
    <div className="min-h-screen bg-gradient-to-br from-playful-purple/10 via-background to-playful-pink/10 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
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
            onClick={resetSession}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </Button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            🌬️ {texts.title}
          </h1>
        </div>
      </div>

      {/* Pattern Selector */}
      {!isPlaying && (
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-center text-muted-foreground mb-4">{texts.selectPattern}</p>
          <div className="grid grid-cols-3 gap-4">
            {BREATHING_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={cn(
                  'p-4 rounded-xl transition-all duration-300 border-2 text-center',
                  selectedPattern.id === pattern.id
                    ? 'bg-playful-purple/20 border-playful-purple scale-105'
                    : 'bg-card border-border hover:border-playful-purple/50'
                )}
              >
                <span className="text-3xl block mb-2">{pattern.emoji}</span>
                <span className="text-sm font-medium text-foreground">
                  {language === 'ar' ? pattern.nameAr : pattern.nameFr}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breathing Circle */}
      <div className="max-w-md mx-auto">
        <Card className="card-shadow overflow-hidden">
          <CardContent className="p-8">
            {/* Circle Animation */}
            <div className="relative aspect-square flex items-center justify-center mb-6">
              {/* Background rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 rounded-full border-4 border-playful-purple/10" />
                <div className="absolute w-1/2 h-1/2 rounded-full border-4 border-playful-purple/20" />
              </div>

              {/* Main breathing circle */}
              <div
                className={cn(
                  'w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out',
                  'bg-gradient-to-br from-playful-purple/40 to-playful-pink/40',
                  'shadow-lg'
                )}
                style={{ transform: `scale(${scale})` }}
              >
                <div className="text-center">
                  <span className="text-5xl block mb-2">{getPhaseEmoji()}</span>
                  <span className="text-lg font-bold text-foreground">
                    {isPlaying ? getPhaseText() : selectedPattern.emoji}
                  </span>
                  {isPlaying && (
                    <span className="block text-3xl font-bold text-foreground mt-2">
                      {getPhaseDuration(currentPhase) - timer}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cycle Counter */}
            {isPlaying && (
              <div className="text-center mb-6 animate-fade-in">
                <span className="text-muted-foreground">
                  {texts.cycle} {currentCycle + 1} {texts.of} {selectedPattern.cycles}
                </span>
                <div className="flex justify-center gap-2 mt-2">
                  {Array.from({ length: selectedPattern.cycles }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-full transition-all',
                        i <= currentCycle
                          ? 'bg-playful-purple'
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Control Button */}
            <div className="flex justify-center">
              <Button
                onClick={isPlaying ? pauseSession : startSession}
                size="lg"
                className={cn(
                  'gap-2 px-8 rounded-full',
                  isPlaying ? 'bg-warning hover:bg-warning/90' : ''
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    {texts.pause}
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    {texts.start}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? '💡 اجلس في وضع مريح وأغمض عينيك'
              : '💡 Assieds-toi confortablement et ferme les yeux'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreathingBuddyGame;
