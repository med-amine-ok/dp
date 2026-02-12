import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Star, Shuffle } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-playful-green/10 via-background to-playful-yellow/10 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md mx-auto animate-scale-in bg-gradient-to-br from-playful-green/10 to-playful-yellow/10">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce-gentle">🧩</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {texts.congratulations}
            </h2>
            <p className="text-muted-foreground mb-4">{texts.puzzleComplete}</p>
            
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
              {texts.moves}: {moves}
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={initializeGame} className="gap-2">
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
    <div className="min-h-screen bg-gradient-to-br from-playful-green/10 via-background to-playful-yellow/10 p-4 md:p-8">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={initializeGame}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              {texts.shuffle}
            </Button>
          </div>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            🧩 {texts.title}
          </h1>
          <p className="text-muted-foreground text-sm">{texts.hint}</p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-4">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty(d)}
            >
              {d === 'easy' ? texts.easy : d === 'medium' ? texts.medium : texts.hard}
            </Button>
          ))}
        </div>

        {/* Moves Counter */}
        <div className="text-center mb-4">
          <span className="text-lg font-medium text-muted-foreground">
            {texts.moves}: <span className="text-foreground font-bold">{moves}</span>
          </span>
        </div>
      </div>

      {/* Puzzle Grid */}
      <div className="max-w-md mx-auto">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
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
                      'aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-200',
                      'bg-gradient-to-br shadow-md hover:shadow-lg',
                      isSelected 
                        ? 'from-playful-purple to-playful-pink scale-105 ring-4 ring-playful-purple'
                        : isCorrect
                          ? 'from-playful-green/30 to-playful-green/10'
                          : 'from-white to-gray-50 hover:scale-102',
                      difficulty === 'easy' && 'text-4xl',
                      difficulty === 'medium' && 'text-3xl',
                      difficulty === 'hard' && 'text-2xl'
                    )}
                  >
                    {getPieceEmoji(piece.id)}
                    <span className="absolute bottom-1 right-1 text-xs text-muted-foreground opacity-50">
                      {piece.id + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Target Pattern (Small Preview) */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'ar' ? 'الترتيب الصحيح:' : 'Ordre correct :'}
          </p>
          <div className="flex justify-center gap-1 flex-wrap">
            {Array.from({ length: totalPieces }).map((_, i) => (
              <span key={i} className="text-lg">
                {getPieceEmoji(i)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGardenGame;
