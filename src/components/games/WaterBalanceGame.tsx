import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface WaterBalanceGameProps {
    onBack: () => void;
}

interface DrinkItem {
    id: string;
    nameFr: string;
    nameAr: string;
    emoji: string;
    waterContent: number;
    isHealthy: boolean;
    bgColor: string;
    borderColor: string;
}

const DRINKS: DrinkItem[] = [
    { id: '1', nameFr: "Petit Verre d'Eau", nameAr: 'كوب ماء صغير', emoji: '🥛', waterContent: 15, isHealthy: true, bgColor: 'from-blue-100 to-cyan-50', borderColor: 'border-blue-300' },
    { id: '2', nameFr: "Grand Verre d'Eau", nameAr: 'كوب ماء كبير', emoji: '💧', waterContent: 25, isHealthy: true, bgColor: 'from-blue-200 to-sky-100', borderColor: 'border-blue-400' },
    { id: '3', nameFr: 'Jus de Fruit', nameAr: 'عصير فواكه', emoji: '🍊', waterContent: 20, isHealthy: false, bgColor: 'from-orange-100 to-yellow-50', borderColor: 'border-orange-300' },
    { id: '4', nameFr: 'Soupe', nameAr: 'حساء', emoji: '🍜', waterContent: 30, isHealthy: false, bgColor: 'from-yellow-100 to-amber-50', borderColor: 'border-yellow-400' },
    { id: '5', nameFr: 'Pastèque', nameAr: 'بطيخ', emoji: '🍉', waterContent: 18, isHealthy: true, bgColor: 'from-green-100 to-emerald-50', borderColor: 'border-green-300' },
];

const WaterGlass: React.FC<{ percentage: number; isDanger: boolean; isWarning: boolean }> = ({ percentage, isDanger, isWarning }) => {
    const clampedPct = Math.min(percentage, 100);
    const fillColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';
    const wavePath = `M0,${100 - clampedPct} Q25,${100 - clampedPct - 6} 50,${100 - clampedPct} Q75,${100 - clampedPct + 6} 100,${100 - clampedPct} L100,100 L0,100 Z`;
    return (
        <div className="relative w-28 h-40 mx-auto">
            <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-md">
                {/* Glass body */}
                <path d="M15,10 L10,130 Q10,138 18,138 L82,138 Q90,138 90,130 L85,10 Z" fill="rgba(186,230,253,0.25)" stroke="#7dd3fc" strokeWidth="3" strokeLinejoin="round" />
                {/* Water fill */}
                <clipPath id="glassClip">
                    <path d="M16,12 L11,128 Q11,136 18,136 L82,136 Q89,136 89,128 L84,12 Z" />
                </clipPath>
                <g clipPath="url(#glassClip)">
                    <rect x="0" y="0" width="100" height="140" fill={fillColor} opacity="0.15" />
                    <path d={wavePath} fill={fillColor} opacity="0.7" />
                </g>
                {/* Glass shine */}
                <path d="M22,18 L19,70" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                {/* Percentage text */}
                <text x="50" y="115" textAnchor="middle" fill={isDanger ? '#ef4444' : '#0284c7'} fontSize="16" fontWeight="bold" fontFamily="Nunito, sans-serif">
                    {Math.round(clampedPct)}%
                </text>
            </svg>
        </div>
    );
};

const WaterBalanceGame: React.FC<WaterBalanceGameProps> = ({ onBack }) => {
    const { language } = useLanguage();
    const [dailyLimit] = useState(100);
    const [waterIntake, setWaterIntake] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'good' | 'warn' | 'danger' | 'win' } | null>(null);
    const [round, setRound] = useState(1);
    const [lastPicked, setLastPicked] = useState<string | null>(null);
    const maxRounds = 5;

    const waterPercentage = (waterIntake / dailyLimit) * 100;
    const isWarningLevel = waterPercentage > 70 && waterPercentage <= 100;
    const isDangerLevel = waterPercentage > 100;

    const handleDrinkChoice = (drink: DrinkItem) => {
        if (gameOver) return;
        setLastPicked(drink.id);
        const newWaterIntake = waterIntake + drink.waterContent;
        setWaterIntake(newWaterIntake);

        if (newWaterIntake > dailyLimit) {
            setMessage({ text: language === 'ar' ? '🚫 تجاوزت الحد! كان كثيراً جداً!' : '🚫 Tu as dépassé la limite !', type: 'danger' });
            setGameOver(true);
            return;
        }

        if (drink.isHealthy) {
            setScore(s => s + 10);
            setMessage({ text: language === 'ar' ? '✅ رائع! خيار صحي ممتاز!' : '✅ Super ! Excellent choix sain !', type: 'good' });
        } else {
            setScore(s => s + 5);
            setMessage({ text: language === 'ar' ? '⚠️ انتبه! هذا يحتوي على سوائل كثيرة' : '⚠️ Attention ! Beaucoup de liquides ici', type: 'warn' });
        }

        if (round < maxRounds) {
            setTimeout(() => { setRound(r => r + 1); setMessage(null); setLastPicked(null); }, 1600);
        } else {
            setGameOver(true);
            setMessage({ text: language === 'ar' ? '🎉 رائع! أتممت اللعبة!' : '🎉 Bravo ! Tu as terminé le jeu !', type: 'win' });
        }
    };

    const resetGame = () => {
        setWaterIntake(0); setScore(0); setGameOver(false);
        setMessage(null); setRound(1); setLastPicked(null);
    };

    const success = !isDangerLevel && gameOver;

    return (
        <DashboardLayout role="patient">
            <div className="max-w-3xl mx-auto space-y-5 pb-8">
                {/* ── Header ── */}
                <div className="flex items-center justify-between pt-2">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        {language === 'ar' ? 'رجوع' : 'Retour'}
                    </button>
                    <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-4 py-1.5 rounded-full shadow-sm">
                        <span className="text-xl">⭐</span>
                        <span className="font-extrabold text-amber-700 text-lg">{score}</span>
                    </div>
                </div>

                {/* ── Title banner ── */}
                <div className="rounded-3xl bg-gradient-to-br from-sky-400 to-cyan-300 p-6 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute -top-6 -left-6 text-[80px] opacity-20 select-none">💧</div>
                    <div className="absolute -bottom-4 -right-4 text-[60px] opacity-20 select-none">🌊</div>
                    <div className="text-6xl mb-2 relative z-10">💧</div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow mb-1">
                        {language === 'ar' ? 'لعبة توازن الماء' : "Jeu d'Équilibre d'Eau"}
                    </h1>
                    <p className="text-sky-100 text-sm md:text-base font-medium">
                        {language === 'ar' ? 'تعلّم كيف تدير سوائلك بذكاء!' : 'Apprends à bien gérer tes liquides !'}
                    </p>
                </div>

                {/* ── Water glass + progress ── */}
                <div className="rounded-3xl bg-white border-4 border-sky-200 shadow-md p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <WaterGlass percentage={waterPercentage} isDanger={isDangerLevel} isWarning={isWarningLevel} />
                        <div className="flex-1 w-full space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700 text-base">
                                    {language === 'ar' ? '🫙 كمية السوائل اليوم' : '🫙 Fluides consommés aujourd\'hui'}
                                </span>
                                <span className={cn('font-extrabold text-lg', isDangerLevel ? 'text-red-500' : isWarningLevel ? 'text-amber-500' : 'text-sky-600')}>
                                    {waterIntake}%
                                </span>
                            </div>
                            {/* Custom progress bar */}
                            <div className="h-5 w-full rounded-full bg-sky-100 border-2 border-sky-200 overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700', isDangerLevel ? 'bg-red-400' : isWarningLevel ? 'bg-amber-400' : 'bg-sky-400')}
                                    style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 font-semibold px-1">
                                <span>0%</span>
                                <span className="text-amber-500">⚠ 70%</span>
                                <span className="text-red-500">🚫 100%</span>
                            </div>
                            {isWarningLevel && !isDangerLevel && (
                                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-2 text-amber-700 text-sm font-semibold">
                                    ⚠️ {language === 'ar' ? 'اقتربت من الحد! تمهّل قليلاً' : 'Tu approches de la limite !'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Round indicator ── */}
                {!gameOver && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: maxRounds }).map((_, i) => (
                            <div key={i} className={cn('w-3 h-3 rounded-full transition-all duration-300', i < round ? 'bg-sky-400 scale-125' : 'bg-slate-200')} />
                        ))}
                        <span className="ml-2 text-sm font-bold text-slate-500">
                            {language === 'ar' ? `الجولة ${round} / ${maxRounds}` : `Tour ${round} / ${maxRounds}`}
                        </span>
                    </div>
                )}

                {/* ── Message toast ── */}
                {message && (
                    <div className={cn(
                        'rounded-3xl px-6 py-4 text-center font-extrabold text-lg shadow-md border-4 transition-all',
                        message.type === 'good' && 'bg-green-50 border-green-300 text-green-700',
                        message.type === 'warn' && 'bg-amber-50 border-amber-300 text-amber-700',
                        message.type === 'danger' && 'bg-red-50 border-red-300 text-red-700',
                        message.type === 'win' && 'bg-violet-50 border-violet-300 text-violet-700',
                    )}>
                        {message.text}
                    </div>
                )}

                {/* ── Drink cards / Game Over ── */}
                {!gameOver ? (
                    <div>
                        <h3 className="text-center font-extrabold text-slate-700 text-lg mb-4">
                            {language === 'ar' ? '🍶 اختر ما ستشرب أو تأكل:' : '🍶 Choisis ce que tu veux boire ou manger :'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {DRINKS.map((drink) => (
                                <button
                                    key={drink.id}
                                    onClick={() => handleDrinkChoice(drink)}
                                    disabled={!!lastPicked}
                                    className={cn(
                                        `bg-gradient-to-br ${drink.bgColor} border-4 ${drink.borderColor}`,
                                        'rounded-3xl p-4 text-center transition-all duration-200 shadow-md',
                                        'hover:scale-105 hover:shadow-xl active:scale-95',
                                        lastPicked === drink.id && 'ring-4 ring-offset-2 ring-violet-400 scale-105',
                                        lastPicked && lastPicked !== drink.id && 'opacity-40',
                                        'disabled:cursor-not-allowed',
                                    )}
                                >
                                    <div className="text-5xl mb-2">{drink.emoji}</div>
                                    <div className="font-extrabold text-slate-700 text-sm leading-tight">
                                        {language === 'ar' ? drink.nameAr : drink.nameFr}
                                    </div>
                                    <div className="mt-2 text-xs font-bold text-slate-500">
                                        +{drink.waterContent}% {language === 'ar' ? 'سوائل' : 'fluides'}
                                    </div>
                                    {drink.isHealthy && (
                                        <div className="mt-2 inline-block bg-green-200 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {language === 'ar' ? '✅ صحي' : '✅ Sain'}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        'rounded-3xl p-8 text-center border-4 shadow-lg',
                        success ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-300' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                    )}>
                        <div className="text-7xl mb-4">{success ? '🏆' : '😅'}</div>
                        <h2 className="text-3xl font-extrabold mb-2 text-slate-800">
                            {success
                                ? (language === 'ar' ? 'أحسنت! 🎉' : 'Excellent ! 🎉')
                                : (language === 'ar' ? 'حاول مرة أخرى!' : 'Essaie encore !')}
                        </h2>
                        <p className="text-slate-600 text-lg mb-1">
                            {language === 'ar' ? 'نقاطك:' : 'Ton score :'} <span className="font-extrabold text-amber-600">{score}</span>
                        </p>
                        <p className="text-slate-500 text-sm mb-6">
                            {language === 'ar' ? `استهلاك السوائل: ${waterIntake}%` : `Fluides consommés : ${waterIntake}%`}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="lg" onClick={resetGame} className="rounded-2xl gap-2 text-base font-bold bg-sky-500 hover:bg-sky-600">
                                <RotateCcw className="h-4 w-4" />
                                {language === 'ar' ? 'العب مرة أخرى' : 'Rejouer'}
                            </Button>
                            <Button size="lg" variant="outline" onClick={onBack} className="rounded-2xl gap-2 text-base font-bold border-2">
                                <ArrowLeft className="h-4 w-4" />
                                {language === 'ar' ? 'رجوع إلى الألعاب' : 'Retour aux jeux'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Educational tip ── */}
                <div className="rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 border-4 border-indigo-200 p-5 shadow-sm">
                    <h3 className="font-extrabold text-indigo-700 mb-2 text-base flex items-center gap-2">
                        💡 {language === 'ar' ? 'هل تعلم؟' : 'Le savais-tu ?'}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {language === 'ar'
                            ? 'مرضى غسيل الكلى يجب عليهم مراقبة كمية السوائل يومياً. تحدّث مع طبيبك دائماً لمعرفة الكمية المناسبة لك!'
                            : "Les patients en dialyse doivent surveiller leurs liquides chaque jour. Parle toujours à ton médecin pour connaître ta limite !"}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WaterBalanceGame;
