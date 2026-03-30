import React from 'react';
import { User, Mail, Calendar, Settings, Crown, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400 text-lg">Manage your account settings and preferences</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-white mb-1">{user?.name}</h2>
            <p className="text-gray-400 text-lg">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Crown className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">Free Plan</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                Account Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Quizzes Created</span>
                  <span className="font-semibold text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Responses</span>
                  <span className="font-semibold text-white">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="font-semibold text-white">Jan 2024</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Upgrade to Pro
              </h3>
              <p className="text-gray-400 mb-4">Unlock unlimited cards, advanced analytics, and premium features</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};