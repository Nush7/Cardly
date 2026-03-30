import React, { useState } from 'react';
import { CheckCircle, Share2, Eye, Copy, Mail, MessageSquare, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { ShareModal } from './ShareModal';

interface QuizGenerationSuccessProps {
  quizData: {
    id: string;
    title: string;
    questions: any[];
    createdAt: string;
  };
  onCreateAnother: () => void;
  onGoToLibrary: () => void;
}

export const QuizGenerationSuccess = ({ quizData, onCreateAnother, onGoToLibrary }: QuizGenerationSuccessProps) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/quiz/${quizData.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleQuickShare = (platform: string) => {
    const text = encodeURIComponent(`Check out my quiz: ${quizData.title}`);
    const url = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    switch (platform) {
      case 'email':
        const subject = encodeURIComponent(`Take my quiz: ${quizData.title}`);
        const body = encodeURIComponent(`Hi! I've created a quiz called "${quizData.title}" and would love for you to try it out.\n\nClick here to take the quiz: ${shareUrl}\n\nGood luck!`);
        shareLink = `mailto:?subject=${subject}&body=${body}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Quiz Created Successfully!</h1>
        <p className="text-gray-400 text-lg">Your interactive quiz cards are ready to share</p>
      </div>

      {/* Quiz Preview Card */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-3">{quizData.title}</h2>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>{quizData.questions.length} questions</span>
              <span>Created {quizData.createdAt}</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>
          </div>
          <button
            onClick={() => window.open(`/quiz/${quizData.id}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>

        {/* Quick Copy Link */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Share Link
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Share Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleQuickShare('email')}
            className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-white"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">Email</div>
              <div className="text-sm text-gray-400">Send via email</div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => handleQuickShare('whatsapp')}
            className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-white"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">WhatsApp</div>
              <div className="text-sm text-gray-400">Share instantly</div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 text-white"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Share2 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">More Options</div>
              <div className="text-sm text-gray-400">Social & advanced</div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
          </button>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">-</div>
            <div className="text-sm text-gray-400">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{quizData.questions.length}</div>
            <div className="text-sm text-gray-400">Questions</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onCreateAnother}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
          Create Another Quiz
        </button>
        
        <button
          onClick={onGoToLibrary}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800 border border-gray-700 text-white rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 font-semibold"
        >
          View All Quizzes
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          quizId={quizData.id}
          quizTitle={quizData.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};