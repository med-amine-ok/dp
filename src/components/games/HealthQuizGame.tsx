import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: number;
  questionFr: string;
  questionAr: string;
  options: {
    fr: string;
    ar: string;
  }[];
  correctIndex: number;
  explanationFr: string;
  explanationAr: string;
}

interface HealthQuizGameProps {
  onBack: () => void;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    questionFr: 'Où se trouvent les reins dans notre corps ?',
    questionAr: 'أين تقع الكليتان في جسمنا؟',
    options: [
      { fr: 'Dans la tête', ar: 'في الرأس' },
      { fr: 'Dans le ventre, près du dos', ar: 'في البطن، بالقرب من الظهر' },
      { fr: 'Dans les jambes', ar: 'في الساقين' },
      { fr: 'Dans les bras', ar: 'في الذراعين' },
    ],
    correctIndex: 1,
    explanationFr: 'Les reins sont situés de chaque côté de la colonne vertébrale, juste en dessous des côtes !',
    explanationAr: 'تقع الكليتان على جانبي العمود الفقري، أسفل الأضلاع مباشرة!',
  },
  {
    id: 2,
    questionFr: 'Quel est le rôle principal des reins ?',
    questionAr: 'ما هو الدور الرئيسي للكلى؟',
    options: [
      { fr: 'Nous aider à voir', ar: 'مساعدتنا على الرؤية' },
      { fr: 'Nettoyer notre sang', ar: 'تنظيف دمنا' },
      { fr: 'Nous faire grandir', ar: 'جعلنا ننمو' },
      { fr: 'Nous aider à parler', ar: 'مساعدتنا على الكلام' },
    ],
    correctIndex: 1,
    explanationFr: 'Les reins filtrent notre sang pour éliminer les déchets et l\'eau en excès !',
    explanationAr: 'الكلى تنقي دمنا لإزالة الفضلات والماء الزائد!',
  },
  {
    id: 3,
    questionFr: 'Combien avons-nous de reins ?',
    questionAr: 'كم عدد الكلى لدينا؟',
    options: [
      { fr: 'Un seul', ar: 'واحدة فقط' },
      { fr: 'Deux', ar: 'اثنتان' },
      { fr: 'Trois', ar: 'ثلاث' },
      { fr: 'Quatre', ar: 'أربع' },
    ],
    correctIndex: 1,
    explanationFr: 'Nous avons deux reins, un de chaque côté de notre corps !',
    explanationAr: 'لدينا كليتان، واحدة على كل جانب من جسمنا!',
  },
  {
    id: 4,
    questionFr: 'Qu\'est-ce que la dialyse aide à faire ?',
    questionAr: 'ما الذي يساعد غسيل الكلى على فعله؟',
    options: [
      { fr: 'Nous aider à courir plus vite', ar: 'مساعدتنا على الجري أسرع' },
      { fr: 'Remplacer le travail des reins', ar: 'استبدال عمل الكلى' },
      { fr: 'Nous faire dormir', ar: 'جعلنا ننام' },
      { fr: 'Nous rendre plus intelligent', ar: 'جعلنا أكثر ذكاء' },
    ],
    correctIndex: 1,
    explanationFr: 'La dialyse fait le travail de nettoyage que les reins ne peuvent plus faire !',
    explanationAr: 'غسيل الكلى يقوم بعمل التنظيف الذي لم تعد الكلى قادرة على القيام به!',
  },
  {
    id: 5,
    questionFr: 'Pourquoi est-il important de boire de l\'eau ?',
    questionAr: 'لماذا من المهم شرب الماء؟',
    options: [
      { fr: 'Pour avoir les cheveux longs', ar: 'للحصول على شعر طويل' },
      { fr: 'Pour aider nos reins à bien fonctionner', ar: 'لمساعدة كليتنا على العمل بشكل جيد' },
      { fr: 'Pour changer de couleur', ar: 'لتغيير اللون' },
      { fr: 'Pour voler', ar: 'للطيران' },
    ],
    correctIndex: 1,
    explanationFr: 'L\'eau aide les reins à éliminer les déchets de notre corps !',
    explanationAr: 'الماء يساعد الكلى على إزالة الفضلات من أجسامنا!',
  },
  {
    id: 6,
    questionFr: 'À quoi ressemble un rein ?',
    questionAr: 'كيف يبدو شكل الكلية؟',
    options: [
      { fr: 'Une étoile', ar: 'نجمة' },
      { fr: 'Un haricot', ar: 'حبة فاصولياء' },
      { fr: 'Un carré', ar: 'مربع' },
      { fr: 'Un triangle', ar: 'مثلث' },
    ],
    correctIndex: 1,
    explanationFr: 'Les reins ont la forme d\'un haricot, c\'est pour ça qu\'on les appelle parfois "haricots" !',
    explanationAr: 'الكلى على شكل حبة فاصولياء، لهذا السبب يسميها البعض أحياناً "الفاصولياء"!',
  },
  {
    id: 7,
    questionFr: 'Pendant la dialyse, que fait la machine ?',
    questionAr: 'أثناء غسيل الكلى، ماذا تفعل الآلة؟',
    options: [
      { fr: 'Elle joue de la musique', ar: 'تعزف الموسيقى' },
      { fr: 'Elle nettoie le sang', ar: 'تنظف الدم' },
      { fr: 'Elle fait des dessins', ar: 'ترسم رسومات' },
      { fr: 'Elle cuisine', ar: 'تطبخ' },
    ],
    correctIndex: 1,
    explanationFr: 'La machine de dialyse filtre le sang comme le feraient des reins en bonne santé !',
    explanationAr: 'آلة غسيل الكلى تنقي الدم كما تفعل الكلى السليمة!',
  },
  {
    id: 8,
    questionFr: 'Quel aliment est bon pour les reins ?',
    questionAr: 'ما هو الطعام الجيد للكلى؟',
    options: [
      { fr: 'Beaucoup de bonbons', ar: 'الكثير من الحلوى' },
      { fr: 'Les fruits et légumes frais', ar: 'الفواكه والخضروات الطازجة' },
      { fr: 'Que des frites', ar: 'البطاطس المقلية فقط' },
      { fr: 'Beaucoup de sel', ar: 'الكثير من الملح' },
    ],
    correctIndex: 1,
    explanationFr: 'Les fruits et légumes aident nos reins à rester en bonne santé !',
    explanationAr: 'الفواكه والخضروات تساعد كليتنا على البقاء بصحة جيدة!',
  },
];

const HealthQuizGame: React.FC<HealthQuizGameProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnsweredQuestions((prev) => [...prev, isCorrect]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
    setGameComplete(false);
  };

  const getStars = () => {
    const percentage = (score / QUIZ_QUESTIONS.length) * 100;
    if (percentage >= 80) return 3;
    if (percentage >= 50) return 2;
    return 1;
  };

  const texts = {
    title: language === 'ar' ? 'اختبار الصحة' : 'Quiz Santé',
    question: language === 'ar' ? 'السؤال' : 'Question',
    of: language === 'ar' ? 'من' : 'sur',
    next: language === 'ar' ? 'التالي' : 'Suivant',
    finish: language === 'ar' ? 'إنهاء' : 'Terminer',
    restart: language === 'ar' ? 'إعادة اللعب' : 'Rejouer',
    back: language === 'ar' ? 'رجوع' : 'Retour',
    correct: language === 'ar' ? 'صحيح!' : 'Correct !',
    incorrect: language === 'ar' ? 'خطأ!' : 'Incorrect !',
    congratulations: language === 'ar' ? 'مبروك! 🎉' : 'Félicitations ! 🎉',
    yourScore: language === 'ar' ? 'نتيجتك' : 'Ton score',
    outOf: language === 'ar' ? 'من' : 'sur',
    excellent: language === 'ar' ? 'ممتاز! أنت خبير!' : 'Excellent ! Tu es un expert !',
    good: language === 'ar' ? 'أحسنت! استمر في التعلم!' : 'Bien joué ! Continue à apprendre !',
    keepLearning: language === 'ar' ? 'استمر! كل سؤال فرصة للتعلم!' : 'Continue ! Chaque question est une chance d\'apprendre !',
  };

  const getResultMessage = () => {
    const percentage = (score / QUIZ_QUESTIONS.length) * 100;
    if (percentage >= 80) return texts.excellent;
    if (percentage >= 50) return texts.good;
    return texts.keepLearning;
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-8 text-center">
          <div className="text-7xl mb-4 animate-bounce-gentle">🏆</div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-1">{texts.congratulations}</h2>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={cn('text-5xl transition-all', i < getStars() ? 'opacity-100' : 'opacity-20 grayscale')}>⭐</span>
            ))}
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-4 mb-5">
            <div className="text-4xl font-extrabold text-violet-700 mb-1">{score} <span className="text-slate-400 text-2xl">/ {QUIZ_QUESTIONS.length}</span></div>
            <p className="text-slate-600 font-semibold text-sm">{getResultMessage()}</p>
          </div>

          {/* Answered dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {answeredQuestions.map((correct, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-full', correct ? 'bg-emerald-400' : 'bg-red-400')} />
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={restartGame} className="flex-1 rounded-2xl gap-2 font-bold bg-violet-500 hover:bg-violet-600 text-white">
              <RotateCcw className="h-4 w-4" />
              {texts.restart}
            </Button>
            <Button variant="outline" onClick={onBack} className="flex-1 rounded-2xl font-bold border-2">
              {texts.back}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const optionColors = [
    { bg: 'from-sky-50 to-blue-50', border: 'border-sky-200', hover: 'hover:border-sky-400 hover:from-sky-100 hover:to-blue-100' },
    { bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', hover: 'hover:border-violet-400 hover:from-violet-100 hover:to-purple-100' },
    { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', hover: 'hover:border-emerald-400 hover:from-emerald-100 hover:to-green-100' },
    { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', hover: 'hover:border-amber-400 hover:from-amber-100 hover:to-yellow-100' },
  ];
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="max-w-2xl mx-auto mb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {texts.back}
          </button>
          <button onClick={restartGame} className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-4 py-2 rounded-full transition-all">
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </button>
        </div>

        {/* Title + brain */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-1">🧠</div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{texts.title}</h1>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border-2 border-violet-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-500">
              {texts.question} <span className="text-violet-600">{currentQuestion + 1}</span> {texts.of} {QUIZ_QUESTIONS.length}
            </span>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <span className="text-sm">⭐</span>
              <span className="font-extrabold text-amber-600 text-sm">{score} {language === 'ar' ? 'صحيح' : 'correct'}</span>
            </div>
          </div>
          <div className="h-3 bg-violet-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Answered question dots */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {Array.from({ length: QUIZ_QUESTIONS.length }).map((_, i) => (
              <div key={i} className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                i < answeredQuestions.length
                  ? (answeredQuestions[i] ? 'bg-emerald-400' : 'bg-red-400')
                  : i === currentQuestion ? 'bg-violet-400 scale-125' : 'bg-slate-200'
              )} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl border-4 border-violet-200 shadow-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-extrabold text-lg">{currentQuestion + 1}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 leading-relaxed pt-1">
              {language === 'ar' ? question.questionAr : question.questionFr}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correctIndex;
              const isSelected = selectedAnswer === index;
              const col = optionColors[index];

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={cn(
                    `w-full p-4 rounded-2xl text-left transition-all duration-300 border-4 bg-gradient-to-r`,
                    !showResult && [col.bg, col.border, col.hover, 'hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-[0.98]'],
                    showResult && isCorrect && 'bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-400 scale-[1.01]',
                    showResult && isSelected && !isCorrect && 'bg-gradient-to-r from-red-100 to-rose-100 border-red-400',
                    showResult && !isSelected && !isCorrect && 'opacity-40 border-slate-200 bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0',
                        showResult && isCorrect ? 'bg-emerald-500 text-white' : showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-white/70 text-slate-600',
                      )}>
                        {optionLetters[index]}
                      </span>
                      <span className="font-bold text-slate-700">
                        {language === 'ar' ? option.ar : option.fr}
                      </span>
                    </div>
                    {showResult && isCorrect && <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className={cn(
              'mt-5 p-4 rounded-2xl border-2',
              selectedAnswer === question.correctIndex
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-amber-50 border-amber-300'
            )}>
              <p className="font-extrabold mb-1 flex items-center gap-2 text-slate-800">
                {selectedAnswer === question.correctIndex ? (
                  <><CheckCircle className="h-5 w-5 text-emerald-500" />{texts.correct}</>
                ) : (
                  <><XCircle className="h-5 w-5 text-red-500" />{texts.incorrect}</>
                )}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                {language === 'ar' ? question.explanationAr : question.explanationFr}
              </p>
            </div>
          )}
        </div>

        {/* Next button */}
        {showResult && (
          <div className="flex justify-center pb-6">
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="px-10 rounded-2xl gap-2 font-extrabold text-base bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-lg"
            >
              {currentQuestion < QUIZ_QUESTIONS.length - 1 ? `${texts.next} →` : texts.finish}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthQuizGame;
