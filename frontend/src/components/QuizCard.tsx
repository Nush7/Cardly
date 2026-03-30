import React, { useState } from 'react';

// Always expect correctAnswer to be mapped from correctIndex
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // mapped from correctIndex
  explanation?: string;
}


interface QuizCardProps {
  questions: Question[];
  onComplete: (score: number, timeSpent: number, answers: number[]) => void;
  onExit: () => void;
}


export const QuizCard = ({ questions, onComplete, onExit }: QuizCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [startTime, setStartTime] = useState(Date.now());
  // Results are handled by parent, not here

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (!questions.length || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        No questions available.
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
    if (currentIndex === questions.length - 1) {
      finishQuiz(newAnswers);
    } else {
      setTimeout(() => {
        setCurrentIndex((idx) => idx + 1);
      }, 300);
    }
  };

  const finishQuiz = (finalAnswers = answers) => {
    const normalizedAnswers: number[] = finalAnswers.map(a => a === null ? -1 : a as number);
    const score = normalizedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    const spent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(score, spent, normalizedAnswers);
  };

  // Results are handled by parent, not here

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={onExit}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Exit
            </button>
            <div className="flex-1 mx-6">
              <div className="bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-white font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      <div className="w-full max-w-2xl mt-20">
        <div className="relative transition-all duration-700 transform-gpu">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 shadow-2xl">
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left rounded-xl border transition-all duration-300 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50 hover:border-gray-600 hover:scale-[1.02]";
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center items-center mt-8">
              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                      ? 'bg-blue-500 w-6'
                      : answers[index] !== null
                        ? 'bg-emerald-500'
                        : 'bg-gray-700'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};