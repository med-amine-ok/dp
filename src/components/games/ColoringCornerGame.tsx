import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Palette, Eraser, Download, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-playful-yellow/10 via-background to-playful-pink/10 p-4 md:p-8">
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
            onClick={resetCurrentPage}
            className="gap-2"
          >
            <Eraser className="h-4 w-4" />
            {texts.clear}
          </Button>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            🎨 {texts.title}
          </h1>
          <p className="text-muted-foreground">{texts.clickToColor}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-6">
        {/* Canvas Area */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            {/* Page Title */}
            <h2 className="text-xl font-bold text-center text-foreground mb-4">
              {language === 'ar' ? currentPage.nameAr : currentPage.nameFr}
            </h2>

            {/* SVG Canvas */}
            <div className="aspect-square bg-white rounded-xl shadow-inner flex items-center justify-center p-8">
              <svg
                viewBox="0 0 160 200"
                className="w-full h-full max-w-xs"
              >
                {currentPage.shapes.map((shape) => (
                  <path
                    key={shape.id}
                    d={shape.path}
                    fill={getShapeColor(shape.id)}
                    stroke="#333"
                    strokeWidth="2"
                    onClick={() => handleShapeClick(shape.id)}
                    className={cn(
                      'transition-colors duration-200',
                      !shape.id.includes('eye') && !shape.id.includes('smile') && 'cursor-pointer hover:opacity-80'
                    )}
                  />
                ))}
              </svg>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={currentPageIndex === 0}
                size="sm"
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {language === 'ar' ? 'السابق' : 'Précédent'}
              </Button>
              
              <div className="flex gap-2">
                {COLORING_PAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPageIndex(index)}
                    className={cn(
                      'w-3 h-3 rounded-full transition-all',
                      currentPageIndex === index
                        ? 'bg-primary scale-125'
                        : 'bg-muted hover:bg-muted-foreground/30'
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={nextPage}
                disabled={currentPageIndex === COLORING_PAGES.length - 1}
                size="sm"
                className="gap-1"
              >
                {language === 'ar' ? 'التالي' : 'Suivant'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="card-shadow h-fit">
          <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {texts.colors}
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-all duration-200 border-2',
                    selectedColor === color.hex
                      ? 'scale-110 ring-2 ring-primary ring-offset-2'
                      : 'hover:scale-105',
                    color.hex === '#ffffff' ? 'border-gray-300' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Selected Color Preview */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'اللون المحدد' : 'Couleur sélectionnée'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ColoringCornerGame;
