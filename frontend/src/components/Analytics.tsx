import React from 'react';
import { TrendingUp, Users, Clock, Award, BarChart, PieChart } from 'lucide-react';

export const Analytics = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400 text-lg">Track your quiz performance and insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Quizzes</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Responses</p>
              <p className="text-3xl font-bold text-white">156</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl p-3">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Completion</p>
              <p className="text-3xl font-bold text-white">8.5m</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-3">
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-white">78%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-3">
              <Award className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Performance Over Time</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 border border-gray-800 rounded-xl bg-gray-800/30">
            Chart visualization would be implemented here
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Quiz Categories</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 border border-gray-800 rounded-xl bg-gray-800/30">
            Pie chart visualization would be implemented here
          </div>
        </div>
      </div>
    </div>
  );
};