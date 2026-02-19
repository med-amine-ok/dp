import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, ThumbsUp, Droplets, Coffee, Soup, Apple, AlertCircle, Trophy, Star } from 'lucide-react';

interface WaterBalanceGameProps {
    onBack: () => void;
}

interface DrinkItem {
    id: string;
    nameFr: string;
    nameAr: string;
    icon: React.ElementType;
    waterContent: number; // percentage of daily limit
    isHealthy: boolean;
}

const WaterBalanceGame: React.FC<WaterBalanceGameProps> = ({ onBack }) => {
    const { language, t } = useLanguage();
    const [dailyLimit] = useState(100); // 100% daily water limit
    const [waterIntake, setWaterIntake] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [round, setRound] = useState(1);
    const maxRounds = 5;

    const drinks: DrinkItem[] = [
        {
            id: '1',
            nameFr: 'Petit Verre d\'Eau',
            nameAr: 'كوب ماء صغير',
            icon: Droplets,
            waterContent: 15,
            isHealthy: true,
        },
        {
            id: '2',
            nameFr: 'Grand Verre d\'Eau',
            nameAr: 'كوب ماء كبير',
            icon: Droplets,
            waterContent: 25,
            isHealthy: true,
        },
        {
            id: '3',
            nameFr: 'Jus de Fruit',
            nameAr: 'عصير فواكه',
            icon: Coffee,
            waterContent: 20,
            isHealthy: false,
        },
        {
            id: '4',
            nameFr: 'Soupe',
            nameAr: 'حساء',
            icon: Soup,
            waterContent: 30,
            isHealthy: false,
        },
        {
            id: '5',
            nameFr: 'Fruit (Pastèque)',
            nameAr: 'فاكهة (بطيخ)',
            icon: Apple,
            waterContent: 18,
            isHealthy: true,
        },
    ];

    const handleDrinkChoice = (drink: DrinkItem) => {
        if (gameOver) return;

        const newWaterIntake = waterIntake + drink.waterContent;
        setWaterIntake(newWaterIntake);

        // Check if within safe limits
        if (newWaterIntake > dailyLimit) {
            setMessage(language === 'ar'
                ? '🚫 تحذير! شربت الكثير من الماء اليوم!'
                : '🚫 Attention ! Tu as dépassé ta limite d\'eau !');
            setGameOver(true);
            return;
        }

        // Award points
        if (drink.isHealthy) {
            setScore(score + 10);
            setMessage(language === 'ar'
                ? '✅ اختيار جيد! هذا صحي!'
                : '✅ Bon choix ! C\'est sain !');
        } else {
            setScore(score + 5);
            setMessage(language === 'ar'
                ? '⚠️ كن حذرا! يحتوي هذا على الكثير من السوائل'
                : '⚠️ Attention ! Cela contient beaucoup de liquides');
        }

        // Move to next round
        if (round < maxRounds) {
            setTimeout(() => {
                setRound(round + 1);
                setMessage('');
            }, 1500);
        } else {
            // Game completed successfully
            setGameOver(true);
            setMessage(language === 'ar'
                ? '🎉 رائع! أنت تدير سوائلك بشكل جيد!'
                : '🎉 Bravo ! Tu gères bien tes fluides !');
        }
    };

    const resetGame = () => {
        setWaterIntake(0);
        setScore(0);
        setGameOver(false);
        setMessage('');
        setRound(1);
    };

    const waterPercentage = (waterIntake / dailyLimit) * 100;
    const isWarningLevel = waterPercentage > 70 && waterPercentage <= 100;
    const isDangerLevel = waterPercentage > 100;

    return (
        <DashboardLayout role="patient">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {language === 'ar' ? 'رجوع' : 'Retour'}
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-playful-yellow/20 px-4 py-2 rounded-xl">
                            <Star className="h-5 w-5 text-playful-yellow" />
                            <span className="font-bold text-foreground">{score}</span>
                        </div>
                    </div>
                </div>

                {/* Game Title */}
                <Card className="bg-gradient-to-r from-playful-orange/30 to-playful-purple/20 border-none card-shadow">
                    <CardContent className="p-6 text-center">
                        <div className="text-6xl mb-4">💧</div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {language === 'ar' ? 'لعبة توازن الماء' : 'Jeu d\'Équilibre d\'Eau'}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {language === 'ar'
                                ? 'تعلم كيف تدير شربك للماء بشكل صحي!'
                                : 'Apprends à gérer ton hydratation de manière saine !'}
                        </p>
                    </CardContent>
                </Card>

                {/* Water Intake Progress */}
                <Card className="card-shadow">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                    <Droplets className={cn(
                                        "h-5 w-5",
                                        isDangerLevel ? "text-destructive" : isWarningLevel ? "text-warning" : "text-primary"
                                    )} />
                                    {language === 'ar' ? 'استهلاك السوائل اليومي' : 'Consommation quotidienne de fluides'}
                                </h3>
                                <span className={cn(
                                    "text-lg font-bold",
                                    isDangerLevel ? "text-destructive" : isWarningLevel ? "text-warning" : "text-foreground"
                                )}>
                                    {waterIntake}% / {dailyLimit}%
                                </span>
                            </div>
                            <Progress
                                value={waterPercentage}
                                className={cn(
                                    "h-4",
                                    isDangerLevel && "bg-destructive/20",
                                    isWarningLevel && !isDangerLevel && "bg-warning/20"
                                )}
                            />
                            {isWarningLevel && !isDangerLevel && (
                                <div className="flex items-center gap-2 text-warning text-sm bg-warning/10 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{language === 'ar' ? 'انتبه! اقتربت من حد السوائل!' : 'Attention ! Tu approches de ta limite !'}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Round Info */}
                {!gameOver && (
                    <div className="text-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                            {language === 'ar' ? `الدورة ${round} من ${maxRounds}` : `Tour ${round} sur ${maxRounds}`}
                        </span>
                    </div>
                )}

                {/* Message */}
                {message && (
                    <Card className={cn(
                        "border-2 animate-slide-up",
                        message.includes('✅') && "bg-success/10 border-success",
                        message.includes('⚠️') && "bg-warning/10 border-warning",
                        message.includes('🚫') && "bg-destructive/10 border-destructive",
                        message.includes('🎉') && "bg-primary/10 border-primary"
                    )}>
                        <CardContent className="p-4 text-center">
                            <p className="text-lg font-semibold text-foreground">{message}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Game Content */}
                {!gameOver ? (
                    <Card className="card-shadow">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                                {language === 'ar' ? 'اختر ما تريد شربه أو أكله:' : 'Choisis ce que tu veux boire ou manger :'}
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {drinks.map((drink) => (
                                    <Card
                                        key={drink.id}
                                        className={cn(
                                            "cursor-pointer transition-all duration-300 hover:scale-105 card-shadow hover:card-shadow-hover",
                                            "bg-gradient-to-br from-card to-muted/30"
                                        )}
                                        onClick={() => handleDrinkChoice(drink)}
                                    >
                                        <CardContent className="p-6 text-center space-y-3">
                                            <div className="flex justify-center">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                                    drink.isHealthy ? "bg-success/20" : "bg-warning/20"
                                                )}>
                                                    <drink.icon className={cn(
                                                        "h-8 w-8",
                                                        drink.isHealthy ? "text-success" : "text-warning"
                                                    )} />
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-foreground">
                                                {language === 'ar' ? drink.nameAr : drink.nameFr}
                                            </h4>
                                            <div className="text-sm text-muted-foreground">
                                                +{drink.waterContent}% {language === 'ar' ? 'سوائل' : 'de fluides'}
                                            </div>
                                            {drink.isHealthy && (
                                                <div className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                                                    <ThumbsUp className="h-3 w-3" />
                                                    {language === 'ar' ? 'صحي' : 'Sain'}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Game Over Screen */
                    <Card className="card-shadow bg-gradient-to-br from-playful-yellow/20 to-playful-orange/20">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-24 h-24 rounded-full bg-playful-yellow/30 flex items-center justify-center animate-celebration">
                                    <Trophy className="h-12 w-12 text-playful-yellow" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">
                                {waterIntake > dailyLimit
                                    ? (language === 'ar' ? 'حاول مرة أخرى!' : 'Essaie encore !')
                                    : (language === 'ar' ? 'أحسنت!' : 'Excellent !')}
                            </h2>
                            <p className="text-xl text-foreground/80">
                                {language === 'ar' ? `مجموع النقاط: ${score}` : `Score total : ${score}`}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    onClick={resetGame}
                                    className="gap-2"
                                >
                                    🔄 {language === 'ar' ? 'العب مرة أخرى' : 'Jouer à nouveau'}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={onBack}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {language === 'ar' ? 'رجوع إلى الألعاب' : 'Retour aux jeux'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Educational Info */}
                <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                            💡 {language === 'ar' ? 'نصيحة مهمة' : 'Conseil Important'}
                        </h3>
                        <p className="text-foreground/80">
                            {language === 'ar'
                                ? 'مرضى غسيل الكلى يجب عليهم مراقبة كمية السوائل التي يشربونها كل يوم. تحدث مع طبيبك لمعرفة الكمية المناسبة لك!'
                                : 'Les patients en dialyse doivent surveiller la quantité de liquides qu\'ils consomment chaque jour. Parle à ton médecin pour connaître ta limite personnelle !'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default WaterBalanceGame;
