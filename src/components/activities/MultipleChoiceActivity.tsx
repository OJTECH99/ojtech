import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface MultipleChoiceActivityProps {
  questions: Question[];
  title: string;
  onComplete: (score: number, percentage: number) => void;
}

export const MultipleChoiceActivity: React.FC<MultipleChoiceActivityProps> = ({
  questions,
  title,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const percentage = Math.round((finalScore / questions.length) * 100);
        onComplete(finalScore, percentage);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  const resetActivity = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  const currentQ = questions[currentQuestion];
  const isCorrect = showResult && selectedAnswer === currentQ.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="learning-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">
            {currentQ.question}
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              let buttonClass = "w-full justify-start text-left h-auto p-4 whitespace-normal";
              let variant: "outline" | "success" | "destructive" = "outline";

              if (showResult) {
                if (index === currentQ.correctAnswer) {
                  variant = "success";
                  buttonClass += " border-success bg-success-light";
                } else if (index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer) {
                  variant = "destructive";
                  buttonClass += " border-destructive bg-destructive/10";
                }
              } else if (selectedAnswer === index) {
                buttonClass += " border-primary bg-primary/10";
              }

              return (
                <Button
                  key={index}
                  variant={variant}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showResult && index === currentQ.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {showResult && index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success-light' : 'bg-destructive/10'}`}>
              <div className={`font-medium ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? 'Tama! 🎉' : 'Mali 😔'}
              </div>
              {currentQ.explanation && (
                <div className="text-sm mt-2 text-muted-foreground">
                  {currentQ.explanation}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={resetActivity}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Ulit-ulitin
            </Button>
            
            <Button 
              variant="activity" 
              onClick={handleSubmit}
              disabled={selectedAnswer === null || showResult}
              className="btn-bounce"
            >
              {currentQuestion + 1 >= questions.length ? 'Tapusin' : 'Susunod'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};