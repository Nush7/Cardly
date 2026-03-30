import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/30 via-gray-950 to-purple-900/30 pointer-events-none z-0"></div>
      <div className="fixed top-1/4 left-1/4 w-[32rem] h-[32rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none z-0"></div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full px-0 py-0 rounded-3xl bg-transparent backdrop-blur-full">
        <div className="inline-flex items-center gap-2  border border-gray-700 rounded-full px-4 py-2 mb-8 shadow">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-300">AI-Powered Learning Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-center drop-shadow-lg w-full">
          Transform Your Study Material Into
          <span className="block text-blue-400 font-bold animate-pulse">
            Interactive Cards
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed text-center drop-shadow">
          Upload  content and let us create engaging quiz cards.
          Share with teams, track progress, and revolutionize learning.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full">
          <button
            onClick={() => handleAuthClick('register')}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
          >
            Start Creating
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {/* Show Auth Modal */}
        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </main>
    </div>
  );
};