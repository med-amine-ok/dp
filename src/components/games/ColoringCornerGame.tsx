import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, Eraser, ChevronLeft, ChevronRight } from 'lucide-react';

interface ColoringCornerGameProps {
  onBack: () => void;
}

interface ColorableShape {
  id: string;
  path: string;
  defaultFill: string;
}

const COLORING_PAGES = [
  {
    id: 'kidney',
    nameFr: 'Le Rein Heureux',
    nameAr: 'الكلية السعيدة',
    shapes: [
      { id: 'kidney-main', path: 'M80,40 Q120,20 140,60 Q160,100 140,140 Q120,180 80,160 Q40,140 20,100 Q0,60 40,40 Q60,20 80,40', defaultFill: '#f0f0f0' },
      { id: 'kidney-face-eye1', path: 'M60,70 A8,8 0 1,1 60,71', defaultFill: '#333' },
      { id: 'kidney-face-eye2', path: 'M100,70 A8,8 0 1,1 100,71', defaultFill: '#333' },
      { id: 'kidney-face-smile', path: 'M60,100 Q80,130 100,100', defaultFill: 'none' },
    ],
  },
  {
    id: 'heart',
    nameFr: 'Le Cœur Joyeux',
    nameAr: 'القلب السعيد',
    shapes: [
      { id: 'heart-main', path: 'M80,180 L20,100 Q0,60 40,40 Q80,20 80,60 Q80,20 120,40 Q160,60 140,100 Z', defaultFill: '#f0f0f0' },
      { id: 'heart-eye1', path: 'M50,80 A6,6 0 1,1 50,81', defaultFill: '#333' },
      { id: 'heart-eye2', path: 'M110,80 A6,6 0 1,1 110,81', defaultFill: '#333' },
    ],
  },
  {
    id: 'drop',
    nameFr: 'La Goutte d\'Eau',
    nameAr: 'قطرة الماء',
    shapes: [
      { id: 'drop-main', path: 'M80,20 Q20,100 40,140 Q60,180 80,180 Q100,180 120,140 Q140,100 80,20', defaultFill: '#f0f0f0' },
      { id: 'drop-eye1', path: 'M60,100 A5,5 0 1,1 60,101', defaultFill: '#333' },
      { id: 'drop-eye2', path: 'M100,100 A5,5 0 1,1 100,101', defaultFill: '#333' },
      { id: 'drop-smile', path: 'M65,130 Q80,145 95,130', defaultFill: 'none' },
    ],
  },
];

const COLOR_PALETTE = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Brown', hex: '#a16207' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#1f2937' },
];

const ColoringCornerGame: React.FC<ColoringCornerGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [coloredShapes, setColoredShapes] = useState<Record<string, Record<string, string>>>({});

  const currentPage = COLORING_PAGES[currentPageIndex];

  const handleShapeClick = (shapeId: string) => {
    if (shapeId.includes('eye') || shapeId.includes('smile')) return; // Don't color face features
    
    setColoredShapes(prev => ({
      ...prev,
      [currentPage.id]: {
        ...prev[currentPage.id],
        [shapeId]: selectedColor,
      },
    }));
  };

  const getShapeColor = (shapeId: string) => {
    return coloredShapes[currentPage.id]?.[shapeId] || currentPage.shapes.find(s => s.id === shapeId)?.defaultFill || '#f0f0f0';
  };

  const resetCurrentPage = () => {
    setColoredShapes(prev => ({
      ...prev,
      [currentPage.id]: {},
    }));
  };

  const nextPage = () => {
    if (currentPageIndex < COLORING_PAGES.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const texts = {
    title: language === 'ar' ? 'ركن التلوين' : 'Coin Coloriage',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    clear: language === 'ar' ? 'مسح' : 'Effacer',
    colors: language === 'ar' ? 'الألوان' : 'Couleurs',
    clickToColor: language === 'ar' ? 'اضغط على الشكل للتلوين!' : 'Clique sur la forme pour colorier !',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-pink-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-4xl mx-auto mb-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {texts.back}
          </button>
          <button onClick={resetCurrentPage} className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition-all">
            <Eraser className="h-4 w-4" /> {texts.clear}
          </button>
        </div>
        <div className="text-center mb-2">
          <div className="text-5xl mb-1">🎨</div>
          <h1 className="text-3xl font-extrabold text-slate-800">{texts.title}</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">{texts.clickToColor}</p>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_160px] gap-5 items-start">
        {/* Canvas */}
        <div className="bg-white rounded-3xl border-4 border-amber-200 shadow-lg p-5">
          <h2 className="text-xl font-extrabold text-center text-slate-800 mb-4">
            {language === 'ar' ? currentPage.nameAr : currentPage.nameFr}
          </h2>

          {/* SVG */}
          <div className="aspect-square bg-gradient-to-br from-slate-50 to-white rounded-2xl border-4 border-dashed border-amber-200 flex items-center justify-center p-6 shadow-inner">
            <svg viewBox="0 0 160 200" className="w-full h-full max-w-xs">
              {currentPage.shapes.map((shape) => (
                <path
                  key={shape.id}
                  d={shape.path}
                  fill={getShapeColor(shape.id)}
                  stroke="#2d2d2d"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  onClick={() => handleShapeClick(shape.id)}
                  className={cn(
                    'transition-all duration-200',
                    !shape.id.includes('eye') && !shape.id.includes('smile')
                      ? 'cursor-pointer hover:opacity-75 hover:drop-shadow-lg'
                      : 'cursor-default'
                  )}
                />
              ))}
            </svg>
          </div>

          {/* Page nav */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="flex items-center gap-1 text-sm font-extrabold text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed bg-white border-2 border-slate-200 hover:border-amber-300 px-3 py-2 rounded-xl transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'ar' ? 'السابق' : 'Préc.'}
            </button>

            <div className="flex gap-2.5">
              {COLORING_PAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPageIndex(index)}
                  className={cn(
                    'w-3.5 h-3.5 rounded-full transition-all border-2',
                    currentPageIndex === index
                      ? 'bg-amber-400 border-amber-500 scale-125'
                      : 'bg-slate-200 border-slate-300 hover:bg-amber-200'
                  )}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPageIndex === COLORING_PAGES.length - 1}
              className="flex items-center gap-1 text-sm font-extrabold text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed bg-white border-2 border-slate-200 hover:border-amber-300 px-3 py-2 rounded-xl transition-all"
            >
              {language === 'ar' ? 'التالي' : 'Suiv.'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Color palette */}
        <div className="bg-white rounded-3xl border-4 border-amber-200 shadow-lg p-4">
          <h3 className="font-extrabold text-slate-700 mb-3 text-sm text-center">
            🎨 {texts.colors}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color.hex)}
                className={cn(
                  'w-full aspect-square rounded-2xl transition-all duration-200 border-4 shadow-sm',
                  selectedColor === color.hex
                    ? 'scale-110 ring-4 ring-offset-2 ring-amber-400 border-white shadow-lg'
                    : 'border-transparent hover:scale-110 hover:border-white hover:shadow-md',
                  color.hex === '#ffffff' && 'border-gray-300'
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Selected preview */}
          <div className="mt-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <p className="text-xs font-extrabold text-amber-700 mb-2 text-center">
              {language === 'ar' ? 'اللون المختار' : 'Couleur choisie'}
            </p>
            <div
              className="w-12 h-12 rounded-2xl border-4 border-white shadow-md mx-auto"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColoringCornerGame;
