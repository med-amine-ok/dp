import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-lg mx-auto mb-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {texts.back}
          </button>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-4 py-2 rounded-full transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">🎴</div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{texts.title}</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <div className="bg-white rounded-2xl border-2 border-violet-200 shadow-sm p-3 text-center">
            <div className="text-xl mb-0.5">✨</div>
            <div className="font-extrabold text-violet-600 text-xl">{moves}</div>
            <div className="text-xs font-semibold text-slate-400">{texts.moves}</div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-3 text-center">
            <div className="text-xl mb-0.5">⭐</div>
            <div className="font-extrabold text-amber-500 text-xl">{matches}<span className="text-base text-slate-400">/{CARD_EMOJIS.length}</span></div>
            <div className="text-xs font-semibold text-slate-400">{texts.matches}</div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-3 text-center">
            <div className="text-xl mb-0.5">⏱️</div>
            <div className="font-extrabold text-emerald-600 text-xl">{formatTime(timer)}</div>
            <div className="text-xs font-semibold text-slate-400">{texts.time}</div>
          </div>
        </div>
      </div>

      {/* ── Game Board ── */}
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2}
              className={cn(
                'aspect-square rounded-2xl text-4xl flex items-center justify-center',
                'transition-all duration-300 border-4 shadow-md select-none',
                !card.isFlipped && !card.isMatched && [
                  'bg-gradient-to-br from-violet-500 to-pink-500 border-violet-400',
                  'hover:scale-105 hover:shadow-xl hover:from-violet-400 hover:to-pink-400 cursor-pointer active:scale-95',
                ],
                (card.isFlipped || card.isMatched) && 'bg-white border-slate-200 scale-100',
                card.isMatched && 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400 ring-4 ring-emerald-300 ring-offset-2',
              )}
            >
              {card.isFlipped || card.isMatched ? (
                <span className={cn('transition-all duration-300', card.isMatched && 'animate-bounce-gentle')}>{card.emoji}</span>
              ) : (
                <span className="text-white/80 text-3xl font-black">?</span>
              )}
            </button>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: CARD_EMOJIS.length }).map((_, i) => (
            <div key={i} className={cn('w-2.5 h-2.5 rounded-full transition-all duration-300', i < matches ? 'bg-emerald-400 scale-125' : 'bg-slate-200')} />
          ))}
        </div>
      </div>

      {/* ── Win Celebration Modal ── */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-8 text-center">
            <div className="text-7xl mb-3 animate-bounce-gentle">🏆</div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-1">{texts.congratulations}</h2>
            <p className="text-slate-500 font-semibold mb-4">{texts.youWon}</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-5">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={cn('text-4xl transition-all', i < getStars() ? 'opacity-100' : 'opacity-20 grayscale')}>⭐</span>
              ))}
            </div>

            {/* Score details */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold text-sm">✨ {texts.moves}</span>
                <span className="font-extrabold text-slate-700">{moves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold text-sm">⏱️ {texts.time}</span>
                <span className="font-extrabold text-slate-700">{formatTime(timer)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={initializeGame} className="flex-1 rounded-2xl gap-2 font-bold bg-violet-500 hover:bg-violet-600 text-white">
                <RotateCcw className="h-4 w-4" />
                {texts.restart}
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1 rounded-2xl font-bold border-2">
                {texts.back}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
