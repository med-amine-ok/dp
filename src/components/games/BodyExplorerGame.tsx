import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-violet-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-4xl mx-auto mb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {texts.back}
          </button>
          <button
            onClick={() => { setExploredParts(new Set()); setCurrentPartIndex(0); setShowFunFact(false); }}
            className="flex items-center gap-2 text-sm font-bold text-teal-600 bg-teal-100 hover:bg-teal-200 px-4 py-2 rounded-full transition-all"
          >
            <RotateCcw className="h-4 w-4" /> {texts.restart}
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-5xl mb-1">🔬</div>
          <h1 className="text-3xl font-extrabold text-slate-800">{texts.title}</h1>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border-2 border-teal-100 p-3 shadow-sm">
          <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
            <span>🔍 {exploredParts.size}/{BODY_PARTS.length} {texts.explored}</span>
            <span className="text-teal-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-teal-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
        {/* Body Diagram */}
        <div className="bg-white rounded-3xl border-4 border-teal-200 shadow-lg p-5">
          <div className="relative aspect-[3/4] bg-gradient-to-b from-teal-50 to-emerald-50 rounded-2xl overflow-hidden border-2 border-teal-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[120px] opacity-10 select-none">🧍</span>
            </div>
            {BODY_PARTS.map((part, index) => (
              <button
                key={part.id}
                onClick={() => handlePartClick(index)}
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 rounded-full p-1',
                  'hover:scale-125 cursor-pointer',
                  currentPartIndex === index && 'scale-[1.35] ring-4 ring-violet-400 ring-offset-2 bg-violet-100',
                  exploredParts.has(part.id) && currentPartIndex !== index && 'bg-emerald-100 ring-2 ring-emerald-400 ring-offset-1'
                )}
                style={{ left: `${part.position.x}%`, top: `${part.position.y}%`, fontSize: currentPartIndex === index ? '2.5rem' : '2rem' }}
              >
                {part.emoji}
              </button>
            ))}
          </div>

          {/* Organ nav dots */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {BODY_PARTS.map((part, index) => (
              <button
                key={part.id}
                onClick={() => handlePartClick(index)}
                className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all border-2 shadow-sm',
                  currentPartIndex === index
                    ? 'bg-gradient-to-br from-violet-500 to-teal-500 border-violet-400 scale-110 shadow-md'
                    : exploredParts.has(part.id)
                      ? 'bg-emerald-100 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-teal-300 hover:scale-105'
                )}
              >
                {part.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border-4 border-violet-200 shadow-lg p-6">
            <div className="text-center mb-4">
              <span className="text-7xl animate-bounce-gentle">{currentPart.emoji}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-800 text-center mb-3">
              {language === 'ar' ? currentPart.nameAr : currentPart.nameFr}
            </h2>

            <p className="text-slate-600 text-center mb-5 leading-relaxed">
              {language === 'ar' ? currentPart.descriptionAr : currentPart.descriptionFr}
            </p>

            {!showFunFact ? (
              <button
                onClick={handleExplore}
                className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-violet-500 to-teal-500 hover:from-violet-600 hover:to-teal-600 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ✨ {texts.explore}
              </button>
            ) : (
              <div className="bg-amber-50 border-4 border-amber-300 rounded-2xl p-4">
                <p className="font-extrabold text-amber-700 flex items-center gap-2 mb-2">
                  ⭐ {texts.funFact}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {language === 'ar' ? currentPart.funFactAr : currentPart.funFactFr}
                </p>
              </div>
            )}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentPartIndex === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold border-4 border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'ar' ? 'السابق' : 'Préc.'}
            </button>
            <button
              onClick={handleNext}
              disabled={currentPartIndex === BODY_PARTS.length - 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold border-4 border-teal-300 bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {language === 'ar' ? 'التالي' : 'Suivant'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Completion celebration */}
          {isComplete && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-4 border-amber-300 rounded-3xl p-5 text-center shadow-md">
              <div className="text-4xl mb-2">🏆</div>
              <div className="flex justify-center gap-1 mb-2">
                {[1,2,3].map(i => <span key={i} className="text-3xl">⭐</span>)}
              </div>
              <p className="font-extrabold text-slate-800">{texts.complete}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyExplorerGame;
