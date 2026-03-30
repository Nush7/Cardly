import { useState } from 'react';
import { Search, Filter, Share2, Eye, BarChart3, Calendar, MoreVertical, Play, Users, Clock, X } from 'lucide-react';
import { ShareModal } from './ShareModal';
import { useQuizzes } from '../contexts/QuizContext';

export const QuizLibrary = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { quizzes, loading, error} = useQuizzes();

  const handleShare = (quiz: any) => {
    setSelectedQuiz(quiz);
    setShowShareModal(true);
  };

  const handleViewAttempts = (quiz: any) => {
    setSelectedQuiz(quiz);
    setShowDetailsModal(true);
  };

  if (loading) {
    return <div className="p-8 text-gray-300">Loading quizzes...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-400">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Quiz Library</h1>
        <p className="text-gray-400 text-lg">Manage and share your quiz collections</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quizzes..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-700 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-white transition-all duration-200">
            <Filter className="h-5 w-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Quiz Cards */}
      <div className="grid gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz._id || quiz.id} className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 hover:border-gray-700 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">{quiz.title}</h3>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : ''}
                  </span>
                  <span>{quiz.questions?.length || quiz.questions || 0} questions</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                    }`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/quiz/${quiz.slug || quiz._id || quiz.id || ''}`, '_blank')}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                  title="Preview Quiz"
                >
                  <Play className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewAttempts(quiz)}
                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare(quiz)}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                  title="Share Quiz"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-200">
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{quiz.responses ?? quiz.attempts?.length ?? 0}</div>
                <div className="text-sm text-gray-400">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {quiz.attempts && quiz.attempts.length > 0
                    ? `${Math.round((quiz.attempts.reduce((acc, a) => acc + (a.score || 0), 0) / quiz.attempts.length) * 100) / 100}%`
                    : '--'}
                </div>
                <div className="text-sm text-gray-400">Avg Score</div>
              </div>
              <div className="text-center"></div>
            </div>

            {/* Recent Attempts */}
            {quiz.attempts && quiz.attempts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Recent Attempts
                </h4>
                <div className="space-y-3">
                  {quiz.attempts.slice(0, 3).map((attempt: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {attempt.name?.charAt(0) ?? '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{attempt.name ?? 'Anonymous'}</div>
                          <div className="text-gray-400 text-sm">{attempt.email ?? ''}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{attempt.score ?? 0}%</div>
                        <div className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {attempt.time ? `${Math.floor(attempt.time / 60)}:${(attempt.time % 60).toString().padStart(2, '0')}` : '--:--'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {quiz.attempts.length > 3 && (
                  <button
                    onClick={() => handleViewAttempts(quiz)}
                    className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    View all {quiz.attempts.length} attempts 2
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedQuiz && (
        <ShareModal
          quizId={selectedQuiz.slug || selectedQuiz._id || selectedQuiz.id || ''}
          quizTitle={selectedQuiz.title}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Quiz Details Modal */}
      {showDetailsModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-3xl font-bold text-white mb-4">{selectedQuiz.title}</h2>
            <div className="mb-6">
              <span className="text-gray-400 text-sm">{selectedQuiz.questions?.length || 0} questions</span>
              <span className="ml-4 text-gray-400 text-sm">Created: {selectedQuiz.createdAt ? new Date(selectedQuiz.createdAt).toLocaleDateString() : ''}</span>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Questions</h3>
              <ol className="space-y-4">
                {(selectedQuiz.questions || []).map((q: any, idx: number) => (
                  <li key={idx} className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-white font-medium mb-2">Q{idx + 1}: {q.questionText || q.question}</div>
                    <ul className="ml-4 list-disc text-gray-300">
                      {(q.options || []).map((opt: string, i: number) => (
                        <li key={i} className={q.correctIndex === i || q.correctAnswer === i ? 'text-emerald-400 font-semibold' : ''}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <div className="mt-2 text-xs text-purple-300">Explanation: {q.explanation}</div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Attempts / Responses</h3>
              {selectedQuiz.attempts && selectedQuiz.attempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-800 text-gray-300">
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Email</th>
                        <th className="py-2 px-4">Score</th>
                        <th className="py-2 px-4">Time</th>
                        <th className="py-2 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuiz.attempts.map((a: any, i: number) => (
                        <tr key={i} className="border-b border-gray-700">
                          <td className="py-2 px-4">{a.name || '-'}</td>
                          <td className="py-2 px-4">{a.email || '-'}</td>
                          <td className="py-2 px-4">{a.score != null ? a.score : '-'}</td>
                          <td className="py-2 px-4">{a.timeSpent != null ? `${Math.floor(a.timeSpent / 60)}m ${a.timeSpent % 60}s` : '-'}</td>
                          <td className="py-2 px-4">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-400">No attempts yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};