import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Shuffle } from 'lucide-react';

interface PuzzlePiece {
  id: number;
  currentPos: number;
  correctPos: number;
}

interface PuzzleGardenGameProps {
  onBack: () => void;
}

const PUZZLE_EMOJIS = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🌿', '🍀'];

const PuzzleGardenGame: React.FC<PuzzleGardenGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const gridSize = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const totalPieces = gridSize * gridSize;

  const initializeGame = () => {
    const newPieces: PuzzlePiece[] = [];
    const positions = Array.from({ length: totalPieces }, (_, i) => i);
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        currentPos: positions[i],
        correctPos: i,
      });
    }

    setPieces(newPieces);
    setMoves(0);
    setSelectedPiece(null);
    setGameComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const handlePieceClick = (pieceId: number) => {
    if (gameComplete) return;

    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      // Swap pieces
      setPieces(prev => {
        const newPieces = [...prev];
        const piece1 = newPieces.find(p => p.id === selectedPiece)!;
        const piece2 = newPieces.find(p => p.id === pieceId)!;
        
        const tempPos = piece1.currentPos;
        piece1.currentPos = piece2.currentPos;
        piece2.currentPos = tempPos;
        
        return newPieces;
      });
      
      setMoves(prev => prev + 1);
      setSelectedPiece(null);

      // Check if puzzle is complete
      setTimeout(() => {
        const isComplete = pieces.every(p => {
          const updated = pieces.find(up => up.id === p.id);
          return updated && updated.currentPos === updated.correctPos;
        });
        // Re-check after state update
      }, 100);
    }
  };

  // Check completion after pieces update
  useEffect(() => {
    if (pieces.length > 0 && moves > 0) {
      const isComplete = pieces.every(p => p.currentPos === p.correctPos);
      if (isComplete) {
        setGameComplete(true);
      }
    }
  }, [pieces, moves]);

  const getStars = () => {
    const optimalMoves = totalPieces * 2;
    if (moves <= optimalMoves) return 3;
    if (moves <= optimalMoves * 1.5) return 2;
    return 1;
  };

  const getPieceEmoji = (pieceId: number) => {
    return PUZZLE_EMOJIS[pieceId % PUZZLE_EMOJIS.length];
  };

  const getPieceByPosition = (position: number) => {
    return pieces.find(p => p.currentPos === position);
  };

  const texts = {
    title: language === 'ar' ? 'حديقة الألغاز' : 'Jardin Puzzle',
    moves: language === 'ar' ? 'الحركات' : 'Coups',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    restart: language === 'ar' ? 'إعادة' : 'Recommencer',
    shuffle: language === 'ar' ? 'خلط' : 'Mélanger',
    easy: language === 'ar' ? 'سهل' : 'Facile',
    medium: language === 'ar' ? 'متوسط' : 'Moyen',
    hard: language === 'ar' ? 'صعب' : 'Difficile',
    congratulations: language === 'ar' ? 'مبروك! 🎉' : 'Félicitations ! 🎉',
    puzzleComplete: language === 'ar' ? 'أكملت اللغز!' : 'Tu as complété le puzzle !',
    hint: language === 'ar' ? 'اضغط على قطعتين لتبديلهما' : 'Clique sur deux pièces pour les échanger',
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-emerald-300 shadow-2xl p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce-gentle">🧩</div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-1">{texts.congratulations}</h2>
          <p className="text-slate-500 font-semibold mb-4">{texts.puzzleComplete}</p>
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={cn('text-4xl', i < getStars() ? 'opacity-100' : 'opacity-20 grayscale')}>⭐</span>
            ))}
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 mb-5">
            <p className="text-slate-600 font-semibold">{texts.moves}: <span className="font-extrabold text-emerald-600">{moves}</span></p>
          </div>
          <div className="flex gap-3">
            <Button onClick={initializeGame} className="flex-1 rounded-2xl gap-2 font-bold bg-emerald-500 hover:bg-emerald-600">
              <RotateCcw className="h-4 w-4" /> {texts.restart}
            </Button>
            <Button variant="outline" onClick={onBack} className="flex-1 rounded-2xl font-bold border-2">{texts.back}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-lg mx-auto mb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {texts.back}
          </button>
          <button onClick={initializeGame} className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-full transition-all">
            <Shuffle className="h-4 w-4" /> {texts.shuffle}
          </button>
        </div>

        <div className="text-center mb-3">
          <div className="text-5xl mb-1">🧩</div>
          <h1 className="text-3xl font-extrabold text-slate-800">{texts.title}</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">{texts.hint}</p>
        </div>

        {/* Difficulty pills */}
        <div className="flex justify-center gap-2 mb-3">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                'px-4 py-2 rounded-full font-extrabold text-sm border-2 transition-all',
                difficulty === d
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md scale-105'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
              )}
            >
              {d === 'easy' ? `🟢 ${texts.easy}` : d === 'medium' ? `🟡 ${texts.medium}` : `🔴 ${texts.hard}`}
            </button>
          ))}
        </div>

        {/* Moves */}
        <div className="flex justify-center">
          <div className="bg-white border-2 border-emerald-200 rounded-2xl px-5 py-2 shadow-sm">
            <span className="font-extrabold text-slate-600">✏️ {texts.moves}: </span>
            <span className="font-extrabold text-emerald-600 text-lg">{moves}</span>
          </div>
        </div>
      </div>

      {/* ── Puzzle Grid ── */}
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-3xl border-4 border-emerald-200 shadow-lg p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: totalPieces }).map((_, position) => {
              const piece = getPieceByPosition(position);
              if (!piece) return null;
              const isCorrect = piece.currentPos === piece.correctPos;
              const isSelected = selectedPiece === piece.id;
              return (
                <button
                  key={position}
                  onClick={() => handlePieceClick(piece.id)}
                  className={cn(
                    'aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 border-4 shadow-sm relative',
                    isSelected
                      ? 'bg-gradient-to-br from-violet-400 to-pink-400 border-violet-500 scale-110 shadow-xl ring-4 ring-violet-300 ring-offset-1'
                      : isCorrect
                        ? 'bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:scale-105 active:scale-95',
                    difficulty === 'easy' && 'text-4xl',
                    difficulty === 'medium' && 'text-3xl',
                    difficulty === 'hard' && 'text-2xl'
                  )}
                >
                  {getPieceEmoji(piece.id)}
                  {isCorrect && !isSelected && (
                    <span className="absolute top-0.5 right-0.5 text-xs">✅</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target preview */}
        <div className="mt-4 bg-white rounded-2xl border-2 border-slate-200 p-3 text-center shadow-sm">
          <p className="text-xs font-extrabold text-slate-400 mb-2">
            {language === 'ar' ? '🎯 الترتيب الصحيح:' : '🎯 Ordre correct :'}
          </p>
          <div className="flex justify-center gap-1 flex-wrap">
            {Array.from({ length: totalPieces }).map((_, i) => (
              <span key={i} className={cn(difficulty === 'hard' ? 'text-lg' : 'text-xl')}>{getPieceEmoji(i)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGardenGame;
