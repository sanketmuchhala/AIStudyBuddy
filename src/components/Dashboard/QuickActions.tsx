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
      label: 'Study Session',
      description: 'Start focused study',
      color: 'bg-primary-600 hover:bg-primary-700',
      disabled: subjects.length === 0
    },
    {
      icon: Calendar,
      label: 'Schedule',
      description: 'View study plan',
      color: 'bg-success-600 hover:bg-success-700',
      disabled: false
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'Track progress',
      color: 'bg-warning-600 hover:bg-warning-700',
      disabled: false
    },
    {
      icon: MessageSquare,
      label: 'Interview Prep',
      description: 'Practice questions',
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: false
    }
  ];

  return (
    <div className="space-y-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            disabled={action.disabled}
            className={`w-full p-2 rounded-lg text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              action.disabled 
                ? 'bg-gray-100 dark:bg-gray-700' 
                : `text-white ${action.color} hover:scale-105 hover:shadow-lg`
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon className="h-3 w-3" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium truncate">{action.label}</h4>
                <p className={`text-xs ${action.disabled ? 'text-gray-500' : 'text-white/90'} truncate`}>
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
      
      {subjects.length === 0 && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Add subjects to unlock study sessions.
          </p>
        </div>
      )}
    </div>
  );
}