import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Star, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface BodyPart {
  id: string;
  nameFr: string;
  nameAr: string;
  emoji: string;
  descriptionFr: string;
  descriptionAr: string;
  funFactFr: string;
  funFactAr: string;
  position: { x: number; y: number };
}

interface BodyExplorerGameProps {
  onBack: () => void;
}

const BODY_PARTS: BodyPart[] = [
  {
    id: 'kidneys',
    nameFr: 'Les Reins',
    nameAr: 'الكليتان',
    emoji: '🫘',
    descriptionFr: 'Les reins sont comme des filtres magiques qui nettoient ton sang !',
    descriptionAr: 'الكليتان مثل مرشحات سحرية تنظف دمك!',
    funFactFr: 'Tes reins filtrent environ 180 litres de sang par jour !',
    funFactAr: 'تقوم كليتاك بتنقية حوالي 180 لتر من الدم يومياً!',
    position: { x: 50, y: 45 },
  },
  {
    id: 'heart',
    nameFr: 'Le Cœur',
    nameAr: 'القلب',
    emoji: '❤️',
    descriptionFr: 'Le cœur pompe le sang dans tout ton corps, comme une super pompe !',
    descriptionAr: 'القلب يضخ الدم في جميع أنحاء جسمك، مثل مضخة خارقة!',
    funFactFr: 'Ton cœur bat environ 100 000 fois par jour !',
    funFactAr: 'قلبك ينبض حوالي 100,000 مرة في اليوم!',
    position: { x: 50, y: 28 },
  },
  {
    id: 'lungs',
    nameFr: 'Les Poumons',
    nameAr: 'الرئتان',
    emoji: '🫁',
    descriptionFr: 'Les poumons te permettent de respirer et d\'avoir de l\'énergie !',
    descriptionAr: 'الرئتان تسمحان لك بالتنفس والحصول على الطاقة!',
    funFactFr: 'Tu respires environ 20 000 fois par jour !',
    funFactAr: 'أنت تتنفس حوالي 20,000 مرة في اليوم!',
    position: { x: 50, y: 32 },
  },
  {
    id: 'brain',
    nameFr: 'Le Cerveau',
    nameAr: 'الدماغ',
    emoji: '🧠',
    descriptionFr: 'Le cerveau est le chef de ton corps, il contrôle tout !',
    descriptionAr: 'الدماغ هو رئيس جسمك، يتحكم في كل شيء!',
    funFactFr: 'Ton cerveau utilise 20% de l\'énergie de ton corps !',
    funFactAr: 'دماغك يستخدم 20% من طاقة جسمك!',
    position: { x: 50, y: 8 },
  },
  {
    id: 'stomach',
    nameFr: 'L\'Estomac',
    nameAr: 'المعدة',
    emoji: '🫃',
    descriptionFr: 'L\'estomac transforme la nourriture en énergie pour toi !',
    descriptionAr: 'المعدة تحول الطعام إلى طاقة من أجلك!',
    funFactFr: 'Ton estomac produit un nouvel acide tous les 3 jours !',
    funFactAr: 'معدتك تنتج حمضاً جديداً كل 3 أيام!',
    position: { x: 50, y: 42 },
  },
  {
    id: 'bladder',
    nameFr: 'La Vessie',
    nameAr: 'المثانة',
    emoji: '💧',
    descriptionFr: 'La vessie garde l\'eau que les reins ont filtrée jusqu\'à ce que tu ailles aux toilettes !',
    descriptionAr: 'المثانة تحتفظ بالماء الذي رشحته الكليتان حتى تذهب إلى الحمام!',
    funFactFr: 'Ta vessie peut contenir environ 400ml d\'eau !',
    funFactAr: 'مثانتك يمكن أن تحتوي على حوالي 400 مل من الماء!',
    position: { x: 50, y: 58 },
  },
];

const BodyExplorerGame: React.FC<BodyExplorerGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [exploredParts, setExploredParts] = useState<Set<string>>(new Set());
  const [showFunFact, setShowFunFact] = useState(false);

  const currentPart = BODY_PARTS[currentPartIndex];
  const progress = (exploredParts.size / BODY_PARTS.length) * 100;

  const handleExplore = () => {
    setExploredParts(prev => new Set([...prev, currentPart.id]));
    setShowFunFact(true);
  };

  const handleNext = () => {
    if (currentPartIndex < BODY_PARTS.length - 1) {
      setCurrentPartIndex(prev => prev + 1);
      setShowFunFact(false);
    }
  };

  const handlePrev = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(prev => prev - 1);
      setShowFunFact(false);
    }
  };

  const handlePartClick = (index: number) => {
    setCurrentPartIndex(index);
    setShowFunFact(false);
  };

  const texts = {
    title: language === 'ar' ? 'مستكشف الجسم' : 'Explorateur du Corps',
    explore: language === 'ar' ? 'اكتشف!' : 'Explore !',
    funFact: language === 'ar' ? 'هل تعلم؟' : 'Le savais-tu ?',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    restart: language === 'ar' ? 'إعادة' : 'Recommencer',
    explored: language === 'ar' ? 'مستكشف' : 'exploré',
    complete: language === 'ar' ? 'أحسنت! اكتشفت كل الأعضاء!' : 'Bravo ! Tu as exploré tous les organes !',
  };

  const isComplete = exploredParts.size === BODY_PARTS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-playful-green/10 via-background to-playful-purple/10 p-4 md:p-8">
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
            onClick={() => {
              setExploredParts(new Set());
              setCurrentPartIndex(0);
              setShowFunFact(false);
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </Button>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            🔬 {texts.title}
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{exploredParts.size}/{BODY_PARTS.length} {texts.explored}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Body Diagram */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="relative aspect-[3/4] bg-gradient-to-b from-playful-purple/10 to-playful-green/10 rounded-xl overflow-hidden">
              {/* Simple body outline */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[120px] opacity-20">🧍</div>
              </div>
              
              {/* Interactive body parts */}
              {BODY_PARTS.map((part, index) => (
                <button
                  key={part.id}
                  onClick={() => handlePartClick(index)}
                  className={cn(
                    'absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl transition-all duration-300',
                    'hover:scale-125 cursor-pointer',
                    currentPartIndex === index && 'scale-125 animate-pulse-soft',
                    exploredParts.has(part.id) && 'ring-2 ring-playful-green rounded-full'
                  )}
                  style={{ left: `${part.position.x}%`, top: `${part.position.y}%` }}
                >
                  {part.emoji}
                </button>
              ))}
            </div>

            {/* Part Navigation */}
            <div className="flex justify-center gap-2 mt-4">
              {BODY_PARTS.map((part, index) => (
                <button
                  key={part.id}
                  onClick={() => handlePartClick(index)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all',
                    currentPartIndex === index 
                      ? 'bg-primary text-primary-foreground scale-110'
                      : exploredParts.has(part.id)
                        ? 'bg-playful-green/20'
                        : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {part.emoji}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card className={cn(
            'card-shadow transition-all duration-300',
            'bg-gradient-to-br from-playful-purple/10 to-playful-green/10'
          )}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <span className="text-6xl animate-bounce-gentle">{currentPart.emoji}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground text-center mb-4">
                {language === 'ar' ? currentPart.nameAr : currentPart.nameFr}
              </h2>
              
              <p className="text-muted-foreground text-center mb-6">
                {language === 'ar' ? currentPart.descriptionAr : currentPart.descriptionFr}
              </p>

              {!showFunFact ? (
                <Button 
                  onClick={handleExplore}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  {texts.explore}
                </Button>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-playful-yellow/20 rounded-xl p-4 border border-playful-yellow/30">
                    <p className="font-bold text-foreground flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-playful-yellow" />
                      {texts.funFact}
                    </p>
                    <p className="text-muted-foreground">
                      {language === 'ar' ? currentPart.funFactAr : currentPart.funFactFr}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentPartIndex === 0}
              className="flex-1 gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'ar' ? 'السابق' : 'Précédent'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentPartIndex === BODY_PARTS.length - 1}
              className="flex-1 gap-2"
            >
              {language === 'ar' ? 'التالي' : 'Suivant'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Completion Message */}
          {isComplete && (
            <Card className="bg-gradient-to-r from-playful-yellow/20 to-playful-orange/20 border-none animate-scale-in">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center gap-1 mb-2">
                  {[1,2,3].map(i => (
                    <Star key={i} className="h-6 w-6 text-playful-yellow fill-playful-yellow" />
                  ))}
                </div>
                <p className="font-bold text-foreground">{texts.complete}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyExplorerGame;
