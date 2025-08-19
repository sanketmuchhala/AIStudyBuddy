import React from 'react';
import { Play, Calendar, BarChart3, MessageSquare } from 'lucide-react';
import { Subject } from '../../types';

interface QuickActionsProps {
  subjects: Subject[];
}

export function QuickActions({ subjects }: QuickActionsProps) {
  const actions = [
    {
      icon: Play,
      label: 'Start Study Session',
      description: 'Begin a focused study session',
      color: 'bg-primary-600 hover:bg-primary-700',
      disabled: subjects.length === 0
    },
    {
      icon: Calendar,
      label: 'View Schedule',
      description: 'Check today\'s study plan',
      color: 'bg-success-600 hover:bg-success-700',
      disabled: false
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      description: 'Track your progress',
      color: 'bg-warning-600 hover:bg-warning-700',
      disabled: false
    },
    {
      icon: MessageSquare,
      label: 'Interview Prep',
      description: 'Practice interview questions',
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: false
    }
  ];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              disabled={action.disabled}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                action.disabled 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : `text-white ${action.color} hover:scale-105 hover:shadow-lg`
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <div>
                  <h4 className="font-medium">{action.label}</h4>
                  <p className={`text-sm ${action.disabled ? 'text-gray-500' : 'text-white/90'}`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {subjects.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Add subjects to unlock study sessions and get personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
}