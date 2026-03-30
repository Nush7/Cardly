// import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { QuizAttempt } from './components/QuizAttempt';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user } = useAuth();

  // Check if we're on a quiz attempt page
  const path = window.location.pathname;
  const isQuizAttempt = path.startsWith('/quiz/');

  if (isQuizAttempt) {
    const quizId = path.split('/quiz/')[1];
    return <QuizAttempt quizId={quizId} />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {user ? <Dashboard /> : <LandingPage />}
    </div>
  );
}


import { QuizProvider } from './contexts/QuizContext';

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <AppContent />
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;