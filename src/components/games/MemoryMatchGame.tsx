import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Trophy, Star, Clock, Sparkles } from 'lucide-react';

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  onBack: () => void;
}

const CARD_EMOJIS = ['🫀', '💊', '🩺', '🏥', '💧', '🍎', '🥦', '😊'];

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const initializeGame = useCallback(() => {
    const shuffledCards = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setTimer(0);
    setIsPlaying(true);
    setShowCelebration(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  useEffect(() => {
    if (matches === CARD_EMOJIS.length) {
      setGameWon(true);
      setIsPlaying(false);
      setShowCelebration(true);
    }
  }, [matches]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards]);

  const handleCardClick = (cardId: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, cardId]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStars = () => {
    if (moves <= 10) return 3;
    if (moves <= 15) return 2;
    return 1;
  };

  const texts = {
    title: language === 'ar' ? 'لعبة الذاكرة' : 'Jeu de Mémoire',
    moves: language === 'ar' ? 'الحركات' : 'Coups',
    matches: language === 'ar' ? 'التطابقات' : 'Paires',
    time: language === 'ar' ? 'الوقت' : 'Temps',
    restart: language === 'ar' ? 'إعادة اللعب' : 'Rejouer',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    congratulations: language === 'ar' ? 'مبروك! 🎉' : 'Félicitations ! 🎉',
    youWon: language === 'ar' ? 'لقد فزت!' : 'Tu as gagné !',
    yourScore: language === 'ar' ? 'نتيجتك' : 'Ton score',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-playful-orange/10 via-background to-playful-yellow/10 p-4 md:p-8">
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
            onClick={initializeGame}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </Button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            🎴 {texts.title}
          </h1>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-6">
          <Badge variant="secondary" className="px-4 py-2 text-lg gap-2">
            <Sparkles className="h-4 w-4 text-playful-purple" />
            {texts.moves}: {moves}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-lg gap-2">
            <Star className="h-4 w-4 text-playful-yellow" />
            {texts.matches}: {matches}/{CARD_EMOJIS.length}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-lg gap-2">
            <Clock className="h-4 w-4 text-playful-green" />
            {formatTime(timer)}
          </Badge>
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2}
              className={cn(
                'aspect-square rounded-xl text-4xl flex items-center justify-center transition-all duration-300 transform',
                'shadow-lg hover:shadow-xl',
                card.isFlipped || card.isMatched
                  ? 'bg-white rotate-0 scale-100'
                  : 'bg-gradient-to-br from-playful-purple to-playful-pink hover:scale-105 cursor-pointer',
                card.isMatched && 'ring-4 ring-playful-green animate-celebration'
              )}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="animate-scale-in">{card.emoji}</span>
              ) : (
                <span className="text-white text-2xl">?</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Win Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <Card className="max-w-sm mx-4 animate-scale-in bg-gradient-to-br from-playful-yellow/20 to-playful-orange/20">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle">🏆</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {texts.congratulations}
              </h2>
              <p className="text-muted-foreground mb-4">{texts.youWon}</p>
              
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-8 w-8 transition-all',
                      i < getStars()
                        ? 'text-playful-yellow fill-playful-yellow animate-pulse-soft'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-foreground">
                  {texts.moves}: <span className="font-bold">{moves}</span>
                </p>
                <p className="text-foreground">
                  {texts.time}: <span className="font-bold">{formatTime(timer)}</span>
                </p>
              </div>

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
      )}
    </div>
  );
};

export default MemoryMatchGame;
