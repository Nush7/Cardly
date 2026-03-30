import React, { useState, useEffect } from 'react';
import { Mail, Play, Clock, Hash, User, ArrowRight } from 'lucide-react';
import { QuizCard } from './QuizCard';
import { QuizResults } from './QuizResults';
import { getQuizBySlug, attemptQuiz } from '../api/quiz';

interface QuizAttemptProps {
  quizId: string;
  quizData?: {
    title: string;
    description: string;
    questions: any[];
    timeLimit?: number;
    createdBy: string;
  };
}

type AttemptState = 'email' | 'instructions' | 'quiz' | 'results';

export const QuizAttempt = ({ quizId, quizData }: QuizAttemptProps) => {
  const [state, setState] = useState<AttemptState>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);

  const [quizDataState, setQuizDataState] = useState<any>(quizData || null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizData && quizId) {
      setFetchError(null);
      getQuizBySlug(quizId)
        .then((data) => {
          if (data && data.questions) {
            setQuizDataState(data);
          } else {
            setFetchError('Quiz not found or invalid format.');
          }
        })
        .catch(() => setFetchError('Failed to fetch quiz.'));
    }
  }, [quizId, quizData]);

  const currentQuizData = quizDataState;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setLoading(true);
    // Simulate API call to register attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setState('instructions');
  };

  const handleStartQuiz = () => {
    setState('quiz');
  };

  const handleQuizComplete = async (finalScore: number, finalTimeSpent: number, selectedAnswers: number[]) => {
    setScore(finalScore);
    setTimeSpent(finalTimeSpent);
    setQuizDataState((prev: any) => ({
      ...prev,
      userAnswers: selectedAnswers
    }));
    setState('results');
    // Submit attempt to backend
    try {
      await attemptQuiz(quizId, {
        email,
        name,
        answers: selectedAnswers
      });
    } catch (err) {
      // Optionally handle error
      console.error('Failed to submit attempt:', err);
    }
  };

  const handleRetry = () => {
    setState('instructions');
  };

  const handleExit = () => {
    setState('instructions');
  };


  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-gray-950">
        {fetchError}
      </div>
    );
  }

  if (!currentQuizData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300 bg-gray-950">
        Loading quiz...
      </div>
    );
  }

  if (state === 'quiz') {
    return (
      <QuizCard
        questions={currentQuizData.questions.map((q: any, idx: number) => ({
          id: idx.toString(),
          question: q.questionText,
          options: q.options,
          correctAnswer: q.correctIndex,
          explanation: q.explanation,
        }))}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    );
  }

  if (state === 'results') {
    return (
      <QuizResults
        score={score}
        totalQuestions={currentQuizData.questions.length}
        timeSpent={timeSpent}
        onRetry={handleRetry}
        onHome={() => window.location.href = '/'}
        quizTitle={currentQuizData.title}
        userAnswers={currentQuizData.userAnswers || []}
        // Always map correctAnswer from correctIndex for consistency, warn if missing
        questions={currentQuizData.questions.map((q: any) => {
          // Use correctIndex from backend, fallback to 0 and log if missing
          let correctAnswer = 0;
          if (typeof q.correctIndex === 'number') correctAnswer = q.correctIndex;
          else if (typeof q.correctIndex === 'string' && !isNaN(Number(q.correctIndex))) correctAnswer = Number(q.correctIndex);
          else { console.warn('Missing or invalid correctIndex for question', q); }
          return {
            question: q.questionText,
            options: q.options,
            correctAnswer,
            explanation: q.explanation,
          };
        })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {state === 'email' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play className="h-8 w-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Ready to Start?</h1>
              <p className="text-gray-400 text-lg">Enter your details to begin the quiz</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Your Name
                </label>
                <div className="relative">
                  <User className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-lg"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-lg"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !name.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
              >
                {loading ? 'Processing...' : 'Continue'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {state === 'instructions' && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">{currentQuizData.title}</h1>
              <p className="text-gray-400 text-lg">{currentQuizData.description}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <Hash className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{currentQuizData.questions.length}</div>
                <div className="text-gray-400 text-sm">Questions</div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <Clock className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  {currentQuizData.timeLimit ? `${Math.floor(currentQuizData.timeLimit / 60)}m` : 'No limit'}
                </div>
                <div className="text-gray-400 text-sm">Time Limit</div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <User className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-lg font-bold text-white mb-1">{name}</div>
                <div className="text-gray-400 text-sm">Participant</div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Instructions</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Read each question carefully before selecting your answer</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>You'll see the correct answer immediately after each question</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Your results will be shared with the quiz creator</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Take your time and do your best!</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
            >
              <Play className="h-6 w-6" />
              Start Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};