import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Trophy, Star, CheckCircle, XCircle, Brain } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-playful-purple/10 via-background to-playful-pink/10 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md mx-auto animate-scale-in bg-gradient-to-br from-playful-purple/10 to-playful-pink/10">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce-gentle">🏆</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {texts.congratulations}
            </h2>
            
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

            <p className="text-3xl font-bold text-foreground mb-2">
              {score} {texts.outOf} {QUIZ_QUESTIONS.length}
            </p>
            <p className="text-muted-foreground mb-6">{getResultMessage()}</p>

            <div className="flex gap-3 justify-center">
              <Button onClick={restartGame} className="gap-2">
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
    <div className="min-h-screen bg-gradient-to-br from-playful-purple/10 via-background to-playful-pink/10 p-4 md:p-8">
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
            onClick={restartGame}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {texts.restart}
          </Button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            🧠 {texts.title}
          </h1>
          <p className="text-muted-foreground">
            {texts.question} {currentQuestion + 1} {texts.of} {QUIZ_QUESTIONS.length}
          </p>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-3 mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>🌟 {score} {language === 'ar' ? 'صحيح' : 'correct'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6 card-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-playful-purple/20 flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-playful-purple" />
              </div>
              <h2 className="text-xl font-bold text-foreground leading-relaxed">
                {language === 'ar' ? question.questionAr : question.questionFr}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isCorrect = index === question.correctIndex;
                const isSelected = selectedAnswer === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all duration-300 border-2',
                      !showResult && 'hover:scale-[1.02] hover:border-playful-purple/50 cursor-pointer',
                      !showResult && 'bg-card border-border',
                      showResult && isCorrect && 'bg-success/20 border-success',
                      showResult && isSelected && !isCorrect && 'bg-destructive/20 border-destructive',
                      showResult && !isSelected && !isCorrect && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {language === 'ar' ? option.ar : option.fr}
                      </span>
                      {showResult && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-success animate-scale-in" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-destructive animate-scale-in" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && (
              <div className={cn(
                'mt-6 p-4 rounded-xl animate-fade-in',
                selectedAnswer === question.correctIndex
                  ? 'bg-success/10 border border-success/30'
                  : 'bg-warning/10 border border-warning/30'
              )}>
                <p className="font-bold mb-2 flex items-center gap-2">
                  {selectedAnswer === question.correctIndex ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success" />
                      {texts.correct}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      {texts.incorrect}
                    </>
                  )}
                </p>
                <p className="text-muted-foreground">
                  {language === 'ar' ? question.explanationAr : question.explanationFr}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Button */}
        {showResult && (
          <div className="flex justify-center animate-fade-in">
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="gap-2 px-8"
            >
              {currentQuestion < QUIZ_QUESTIONS.length - 1 ? texts.next : texts.finish}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthQuizGame;
