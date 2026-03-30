import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { StudyBuilder } from './StudyBuilder';
import { QuizLibrary } from './QuizLibrary';
import { Analytics } from './Analytics';
import { Profile } from './Profile';

export type DashboardView = 'builder' | 'library' | 'analytics' | 'profile';

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('builder');

  const renderContent = () => {
    switch (activeView) {
      case 'builder':
        return <StudyBuilder />;
      case 'library':
        return <QuizLibrary />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile />;
      default:
        return <StudyBuilder />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto bg-gray-950">
        {renderContent()}
      </div>
    </div>
  );
};