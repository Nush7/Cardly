import React, { useState } from 'react';
import { X, Copy, Share2, Mail, MessageSquare, Check, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  quizId: string;
  quizTitle: string;
  onClose: () => void;
}

export const ShareModal = ({ quizId, quizTitle, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/quiz/${quizId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Take my quiz: ${quizTitle}`);
    const body = encodeURIComponent(`Hi! I've created a quiz called "${quizTitle}" and would love for you to try it out.\n\nClick here to take the quiz: ${shareUrl}\n\nGood luck!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(`Check out this quiz: ${quizTitle}`);
    const url = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Share2 className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Share Quiz</h2>
          <p className="text-gray-400">Share "{quizTitle}" with others</p>
        </div>

        {/* Copy Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Quiz Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          {copied && (
            <p className="text-emerald-400 text-sm mt-2">Link copied to clipboard!</p>
          )}
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Share via</h3>
          
          <button
            onClick={handleEmailShare}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-white"
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
            onClick={() => handleSocialShare('whatsapp')}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-white"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">WhatsApp</div>
              <div className="text-sm text-gray-400">Share on WhatsApp</div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-white"
            >
              <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <Share2 className="h-4 w-4 text-blue-400" />
              </div>
              <span className="font-medium">Twitter</span>
            </button>
            
            <button
              onClick={() => handleSocialShare('linkedin')}
              className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-white"
            >
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Share2 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">LinkedIn</span>
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Anyone with this link can take your quiz. Results will appear in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};