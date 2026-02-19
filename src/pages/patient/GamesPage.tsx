import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Gamepad2, Brain, Heart, Clock, Star, Play, Trophy, Zap, Sparkles } from 'lucide-react';
import { mockGames } from '@/data/mockData';
import MemoryMatchGame from '@/components/games/MemoryMatchGame';
import HealthQuizGame from '@/components/games/HealthQuizGame';
import BodyExplorerGame from '@/components/games/BodyExplorerGame';
import MedicineMatchGame from '@/components/games/MedicineMatchGame';
import PuzzleGardenGame from '@/components/games/PuzzleGardenGame';
import ColoringCornerGame from '@/components/games/ColoringCornerGame';
import BreathingBuddyGame from '@/components/games/BreathingBuddyGame';
import WaterBalanceGame from '@/components/games/WaterBalanceGame';

type ActiveGame = 'none' | 'memory' | 'quiz' | 'body' | 'medicine' | 'puzzle' | 'coloring' | 'breathing' | 'water';

const GamesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeGame, setActiveGame] = useState<ActiveGame>('none');

  const educationalGames = mockGames.filter(g => g.type === 'educational');
  const relaxationGames = mockGames.filter(g => g.type === 'relaxation');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success border-success/30';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'hard':
        return 'bg-destructive/20 text-destructive border-destructive/30';
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
      'playful-purple': 'from-playful-purple/40 via-playful-purple/20 to-playful-purple/10 hover:from-playful-purple/50',
      'playful-green': 'from-playful-green/40 via-playful-green/20 to-playful-green/10 hover:from-playful-green/50',
      'playful-pink': 'from-playful-pink/40 via-playful-pink/20 to-playful-pink/10 hover:from-playful-pink/50',
      'playful-orange': 'from-playful-orange/40 via-playful-orange/20 to-playful-orange/10 hover:from-playful-orange/50',
      'playful-yellow': 'from-playful-yellow/40 via-playful-yellow/20 to-playful-yellow/10 hover:from-playful-yellow/50',
    };
    return colors[color] || 'from-primary/40 via-primary/20 to-primary/10';
  };

  const handleGameClick = (gameId: string) => {
    const gameMap: Record<string, ActiveGame> = {
      '1': 'quiz',
      '2': 'body',
      '3': 'medicine',
      '4': 'memory',
      '5': 'puzzle',
      '6': 'coloring',
      '7': 'breathing',
      '8': 'water',
    };
    setActiveGame(gameMap[gameId] || 'none');
  };

  const GameCard = ({ game, index }: { game: typeof mockGames[0]; index: number }) => {
    return (
      <div
        className="animate-fade-in-up h-full"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <Card className={cn(
          'overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-500 group cursor-pointer',
          'hover:scale-[1.05] hover:-translate-y-2',
          'bg-gradient-to-br backdrop-blur-sm',
          'border-2 border-transparent hover:border-white/20',
          'h-full',
          getColorClass(game.color)
        )}>
          <CardContent className="p-6 relative h-full flex flex-col">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[100px] -z-0" />

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all" />
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500 inline-block relative z-10">
                    {game.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={cn(
                    'rounded-full px-3 py-1 font-semibold border shadow-sm',
                    getDifficultyColor(game.difficulty)
                  )}>
                    {getDifficultyLabel(game.difficulty)}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-foreground/70 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">{game.duration} {t('games.minutes')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-5 flex-1">
                <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {language === 'ar' ? game.titleAr : game.titleFr}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
                  {language === 'ar' ? game.descriptionAr : game.descriptionFr}
                </p>
              </div>

              <Button
                className={cn(
                  "w-full gap-2 rounded-xl font-semibold shadow-md",
                  "bg-white/90 text-primary hover:bg-white hover:shadow-lg",
                  "transform transition-all duration-300",
                  "group-hover:scale-105"
                )}
                onClick={() => handleGameClick(game.id)}
              >
                <Play className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                {t('games.play')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
  if (activeGame === 'water') {
    return <WaterBalanceGame onBack={() => setActiveGame('none')} />;
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header with improved visual hierarchy */}
        <div className="flex items-center gap-5 animate-fade-in">
          <div className="relative group">
            <div className="absolute inset-0 bg-playful-orange/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-playful-orange/30 to-playful-orange/10 flex items-center justify-center border border-playful-orange/20 shadow-lg">
              <Gamepad2 className="h-8 w-8 text-playful-orange" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t('games.title')}
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-playful-yellow" />
              {language === 'ar' ? 'تعلم والعب!' : 'Apprends en t\'amusant !'}
            </p>
          </div>
        </div>

        {/* Enhanced Featured Games Banner with glassmorphism */}
        <Card className={cn(
          "bg-gradient-to-r from-playful-purple/30 via-playful-pink/30 to-playful-orange/30",
          "border-none card-shadow overflow-hidden relative animate-fade-in",
          "backdrop-blur-sm"
        )}>
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">

              <div className="flex-1 text-center md:text-start">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <Trophy className="h-6 w-6 text-playful-yellow" />
                  {language === 'ar' ? '8 ألعاب متاحة!' : '8 jeux disponibles !'}
                </h2>
                <p className="text-foreground/80 text-lg">
                  {language === 'ar'
                    ? 'ألعاب تعليمية واسترخاء لتتعلم وتستمتع!'
                    : 'Des jeux éducatifs et relaxants pour apprendre en s\'amusant !'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setActiveGame('quiz')}
                  size="lg"
                  className="gap-2 bg-white/90 text-primary hover:bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  🧠 Quiz
                </Button>
                <Button
                  onClick={() => setActiveGame('memory')}
                  size="lg"
                  variant="secondary"
                  className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  🎴 {language === 'ar' ? 'ذاكرة' : 'Mémoire'}
                </Button>
                <Button
                  onClick={() => setActiveGame('breathing')}
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2"
                >
                  🌬️ {language === 'ar' ? 'تنفس' : 'Respiration'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Games Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className={cn(
            "grid w-full max-w-md grid-cols-3 mb-8 h-14",
            "bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm",
            "border border-border/50 shadow-lg"
          )}>
            <TabsTrigger
              value="all"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold transition-all"
            >
              <Zap className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الكل' : 'Tous'}
            </TabsTrigger>
            <TabsTrigger
              value="educational"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2 font-semibold transition-all"
            >
              <Brain className="h-4 w-4" />
              {language === 'ar' ? 'تعليمية' : 'Éducatif'}
            </TabsTrigger>
            <TabsTrigger
              value="relaxation"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-2 font-semibold transition-all"
            >
              <Heart className="h-4 w-4" />
              {language === 'ar' ? 'استرخاء' : 'Relaxation'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-10 mt-8">
            {/* Educational Games Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-playful-purple/20 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-playful-purple" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('games.educational')}
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-playful-purple/30 to-transparent rounded-full" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {educationalGames.map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} />
                ))}
              </div>
            </div>

            {/* Relaxation Games Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-playful-pink/20 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-playful-pink" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('games.relaxation')}
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-playful-pink/30 to-transparent rounded-full" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relaxationGames.map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="educational" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalGames.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="relaxation" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relaxationGames.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Achievement Banner with glassmorphism */}
        <Card className={cn(
          "bg-gradient-to-r from-playful-yellow/30 via-playful-orange/30 to-playful-pink/20",
          "border-none card-shadow relative overflow-hidden animate-fade-in"
        )}>
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-playful-yellow/40 rounded-full blur-xl group-hover:blur-2xl transition-all animate-pulse-soft" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-playful-yellow/40 to-playful-orange/30 flex items-center justify-center border-4 border-white/20 shadow-xl">
                <Star className="h-10 w-10 text-playful-yellow fill-playful-yellow/20" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2 justify-center sm:justify-start">
                <Trophy className="h-6 w-6 text-playful-orange" />
                {language === 'ar' ? 'أنت بطل!' : 'Tu es un champion !'}
              </h3>
              <p className="text-foreground/70 text-lg">
                {language === 'ar'
                  ? 'لقد لعبت 8 ألعاب هذا الأسبوع. استمر!'
                  : 'Tu as joué à 8 jeux cette semaine. Continue !'}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
              <div className="relative text-center bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-white/20">
                <span className="text-4xl font-bold bg-gradient-to-br from-playful-yellow to-playful-orange bg-clip-text text-transparent">
                  42
                </span>
                <p className="text-sm font-semibold text-foreground/70 mt-1 flex items-center gap-1 justify-center">
                  <Sparkles className="h-3 w-3 text-playful-yellow" />
                  {language === 'ar' ? 'نجوم' : 'étoiles'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GamesPage;