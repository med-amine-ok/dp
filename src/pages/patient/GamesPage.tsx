import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Gamepad2, Brain, Heart, Clock, Star, Play } from 'lucide-react';
import { mockGames } from '@/data/mockData';
import MemoryMatchGame from '@/components/games/MemoryMatchGame';
import HealthQuizGame from '@/components/games/HealthQuizGame';
import BodyExplorerGame from '@/components/games/BodyExplorerGame';
import MedicineMatchGame from '@/components/games/MedicineMatchGame';
import PuzzleGardenGame from '@/components/games/PuzzleGardenGame';
import ColoringCornerGame from '@/components/games/ColoringCornerGame';
import BreathingBuddyGame from '@/components/games/BreathingBuddyGame';

type ActiveGame = 'none' | 'memory' | 'quiz' | 'body' | 'medicine' | 'puzzle' | 'coloring' | 'breathing';

const GamesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeGame, setActiveGame] = useState<ActiveGame>('none');

  const educationalGames = mockGames.filter(g => g.type === 'educational');
  const relaxationGames = mockGames.filter(g => g.type === 'relaxation');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'hard':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: { fr: 'Facile', ar: 'سهل' },
      medium: { fr: 'Moyen', ar: 'متوسط' },
      hard: { fr: 'Difficile', ar: 'صعب' },
    };
    return labels[difficulty as keyof typeof labels]?.[language === 'ar' ? 'ar' : 'fr'] || difficulty;
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      'playful-purple': 'from-playful-purple/30 to-playful-purple/10 hover:from-playful-purple/40',
      'playful-green': 'from-playful-green/30 to-playful-green/10 hover:from-playful-green/40',
      'playful-pink': 'from-playful-pink/30 to-playful-pink/10 hover:from-playful-pink/40',
      'playful-orange': 'from-playful-orange/30 to-playful-orange/10 hover:from-playful-orange/40',
      'playful-yellow': 'from-playful-yellow/30 to-playful-yellow/10 hover:from-playful-yellow/40',
    };
    return colors[color] || 'from-primary/30 to-primary/10';
  };

  const handleGameClick = (gameId: string) => {
    // Map game IDs to active game types
    const gameMap: Record<string, ActiveGame> = {
      '1': 'quiz',      // Quiz Santé
      '2': 'body',      // Explorateur du Corps
      '3': 'medicine',  // Association Médicaments
      '4': 'memory',    // Jeu de Mémoire
      '5': 'puzzle',    // Jardin Puzzle
      '6': 'coloring',  // Coin Coloriage
      '7': 'breathing', // Ami Respiration
    };
    setActiveGame(gameMap[gameId] || 'none');
  };

  const GameCard = ({ game }: { game: typeof mockGames[0] }) => {
    return (
      <Card className={cn(
        'overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 group cursor-pointer hover:scale-[1.02]',
        'bg-gradient-to-br',
        getColorClass(game.color)
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl group-hover:animate-bounce-gentle">{game.icon}</span>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={cn('rounded-full', getDifficultyColor(game.difficulty))}>
                {getDifficultyLabel(game.difficulty)}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{game.duration} {t('games.minutes')}</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-2">
            {language === 'ar' ? game.titleAr : game.titleFr}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'ar' ? game.descriptionAr : game.descriptionFr}
          </p>
          
          <Button 
            className="w-full gap-2 rounded-xl group-hover:animate-pulse-soft"
            onClick={() => handleGameClick(game.id)}
          >
            <Play className="h-4 w-4" />
            {t('games.play')}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Render active game if one is selected
  if (activeGame === 'memory') {
    return <MemoryMatchGame onBack={() => setActiveGame('none')} />;
  }
  if (activeGame === 'quiz') {
    return <HealthQuizGame onBack={() => setActiveGame('none')} />;
  }
  if (activeGame === 'body') {
    return <BodyExplorerGame onBack={() => setActiveGame('none')} />;
  }
  if (activeGame === 'medicine') {
    return <MedicineMatchGame onBack={() => setActiveGame('none')} />;
  }
  if (activeGame === 'puzzle') {
    return <PuzzleGardenGame onBack={() => setActiveGame('none')} />;
  }
  if (activeGame === 'coloring') {
    return <ColoringCornerGame onBack={() => setActiveGame('none')} />;
  }
  if (activeGame === 'breathing') {
    return <BreathingBuddyGame onBack={() => setActiveGame('none')} />;
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-playful-orange/20 flex items-center justify-center">
            <Gamepad2 className="h-7 w-7 text-playful-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('games.title')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'تعلم والعب!' : 'Apprends en t\'amusant !'}
            </p>
          </div>
        </div>

        {/* Featured Games Banner */}
        <Card className="bg-gradient-to-r from-playful-purple/20 via-playful-pink/20 to-playful-orange/20 border-none card-shadow overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex gap-3 text-5xl">
                <span className="animate-bounce-gentle" style={{ animationDelay: '0s' }}>🧠</span>
                <span className="animate-bounce-gentle" style={{ animationDelay: '0.1s' }}>🎴</span>
                <span className="animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>🌬️</span>
                <span className="animate-bounce-gentle" style={{ animationDelay: '0.3s' }}>🎨</span>
              </div>
              <div className="flex-1 text-center md:text-start">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {language === 'ar' ? '7 ألعاب متاحة!' : '7 jeux disponibles !'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'ar' 
                    ? 'ألعاب تعليمية واسترخاء لتتعلم وتستمتع!'
                    : 'Des jeux éducatifs et relaxants pour apprendre en s\'amusant !'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  onClick={() => setActiveGame('quiz')}
                  size="sm"
                  className="gap-1"
                >
                  🧠 Quiz
                </Button>
                <Button 
                  onClick={() => setActiveGame('memory')}
                  size="sm"
                  variant="secondary"
                  className="gap-1"
                >
                  🎴 {language === 'ar' ? 'ذاكرة' : 'Mémoire'}
                </Button>
                <Button 
                  onClick={() => setActiveGame('breathing')}
                  size="sm"
                  variant="outline"
                  className="gap-1"
                >
                  🌬️ {language === 'ar' ? 'تنفس' : 'Respiration'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="all" className="rounded-full">
              {language === 'ar' ? 'الكل' : 'Tous'}
            </TabsTrigger>
            <TabsTrigger value="educational" className="rounded-full flex items-center gap-1">
              <Brain className="h-4 w-4" />
              {language === 'ar' ? 'تعليمية' : 'Éducatif'}
            </TabsTrigger>
            <TabsTrigger value="relaxation" className="rounded-full flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {language === 'ar' ? 'استرخاء' : 'Relaxation'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Educational Games */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-playful-purple" />
                {t('games.educational')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {educationalGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>

            {/* Relaxation Games */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-playful-pink" />
                {t('games.relaxation')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relaxationGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="educational">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="relaxation">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relaxationGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievement Banner */}
        <Card className="bg-gradient-to-r from-playful-yellow/20 to-playful-orange/20 border-none card-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-playful-yellow/30 flex items-center justify-center">
              <Star className="h-8 w-8 text-playful-yellow animate-pulse-soft" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">
                {language === 'ar' ? 'أنت بطل!' : 'Tu es un champion !'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'لقد لعبت 8 ألعاب هذا الأسبوع. استمر!'
                  : 'Tu as joué à 8 jeux cette semaine. Continue !'}
              </p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">42</span>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'نجوم' : 'étoiles'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GamesPage;
