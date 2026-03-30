
import { Trophy, RotateCcw, Share2, Home, Target, TrendingUp } from 'lucide-react';


type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  onRetry: () => void;
  onHome: () => void;
  onShare?: () => void;
  quizTitle?: string;
  userAnswers?: number[];
  questions?: { question: string; options: string[]; correctAnswer: number; explanation?: string }[];
};

export const QuizResults = ({
  score,
  totalQuestions,
  timeSpent,
  onRetry,
  onHome,
  onShare,
  quizTitle = "Quiz Complete",
  userAnswers = [],
  questions = []
}: QuizResultsProps) => {
  // Debug logging removed for production
  // Show answers and correct answers at the end
  const showAnswers = questions.length > 0 && userAnswers.length > 0;
  const percentage = Math.round((score / totalQuestions) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding!", color: "text-emerald-400", icon: Trophy };
    if (percentage >= 80) return { message: "Great job!", color: "text-blue-400", icon: Target };
    if (percentage >= 70) return { message: "Well done!", color: "text-purple-400", icon: TrendingUp };
    if (percentage >= 60) return { message: "Good effort!", color: "text-orange-400", icon: Target };
    return { message: "Keep practicing!", color: "text-red-400", icon: RotateCcw };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 shadow-2xl text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PerformanceIcon className={`h-10 w-10 ${performance.color}`} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{performance.message}</h1>
            <p className="text-gray-400 text-lg">{quizTitle}</p>
          </div>
          {/* Show all answers and correct answers at the end */}
          {showAnswers && (
            <div className="mb-8 text-left">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Your Answers</h3>
              <ol className="space-y-4">
                {questions.map((q, idx) => {
                  const userAnswer = userAnswers[idx];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const hasAnswered = userAnswer !== undefined && userAnswer !== -1;
                  return (
                    <li key={idx} className={`bg-gray-800/50 rounded-xl p-4 border ${isCorrect ? 'border-emerald-600' : 'border-red-600'}`}>
                      <div className="text-white font-medium mb-2">Q{idx + 1}: {q.question}</div>
                      <div className="ml-2 mb-1">
                        <span className="font-medium text-gray-300">Your answer: </span>
                        <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                          {hasAnswered ? q.options[userAnswer] : <span className="italic text-gray-500">No answer</span>}
                        </span>
                        {hasAnswered && isCorrect && <span className="ml-2 text-emerald-400 font-bold">✔</span>}
                        {hasAnswered && !isCorrect && <span className="ml-2 text-red-400 font-bold">✘</span>}
                      </div>
                      {(!isCorrect || !hasAnswered) && (
                        <div className="ml-2 mb-1">
                          <span className="font-medium text-gray-300">Correct answer: </span>
                          <span className="text-emerald-400">
                            {q.options && q.options[q.correctAnswer] !== undefined
                              ? q.options[q.correctAnswer]
                              : <span className="italic text-red-400">[Invalid correct answer index: {String(q.correctAnswer)}]</span>
                            }
                          </span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="ml-2 mt-1 text-xs text-purple-300">Explanation: {q.explanation}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Score Circle */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${percentage * 2.83} 283`}
                className="text-blue-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-1">{percentage}%</div>
                <div className="text-gray-400 text-sm">Score</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{score}</div>
              <div className="text-gray-400 text-sm">Correct</div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-red-400 mb-1">{totalQuestions - score}</div>
              <div className="text-gray-400 text-sm">Incorrect</div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`}
              </div>
              <div className="text-gray-400 text-sm">Time</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Performance Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accuracy Rate</span>
                <span className="font-semibold text-white">{percentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Time per Question</span>
                <span className="font-semibold text-white">
                  {Math.round(timeSpent / totalQuestions)}s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Questions Answered</span>
                <span className="font-semibold text-white">{totalQuestions}/{totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-105"
            >
              <RotateCcw className="h-5 w-5" />
              Try Again
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 font-semibold"
              >
                <Share2 className="h-5 w-5" />
                Share Results
              </button>
            )}

            <button
              onClick={onHome}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 font-semibold"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};