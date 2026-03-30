import React from 'react';
import { Brain, Plus, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardView } from './Dashboard';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'builder', label: 'Study Builder', icon: Plus },
    { id: 'library', label: 'Quiz Library', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CardCraft
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as DashboardView)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeView === item.id
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <Icon className={`h-5 w-5 ${activeView === item.id ? 'text-blue-400' : 'group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};