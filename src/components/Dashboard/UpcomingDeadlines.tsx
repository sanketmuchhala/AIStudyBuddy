import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Subject } from '../../types';
import { differenceInDays } from 'date-fns';

interface UpcomingDeadlinesProps {
  subjects: Subject[];
}

export function UpcomingDeadlines({ subjects }: UpcomingDeadlinesProps) {
  const sortedSubjects = subjects
    .map(subject => ({
      ...subject,
      daysLeft: differenceInDays(subject.deadline, new Date())
    }))
    .filter(subject => subject.daysLeft >= -1) // Include today and overdue by 1 day
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3); // Limit to 3 items

  if (sortedSubjects.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No upcoming deadlines
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedSubjects.map((subject) => {
        const isOverdue = subject.daysLeft < 0;
        const isUrgent = subject.daysLeft <= 1 && subject.daysLeft >= 0;
        const progress = (subject.completedHours / subject.estimatedHours) * 100;
        
        return (
          <div key={subject.id} className="flex items-center justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                {(isOverdue || isUrgent) && (
                  <AlertTriangle className={`h-3 w-3 ${isOverdue ? 'text-red-500' : 'text-yellow-500'}`} />
                )}
                <h4 className="font-medium text-gray-900 dark:text-white text-xs truncate">
                  {subject.name}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${
                  isOverdue ? 'text-red-500' : 
                  isUrgent ? 'text-yellow-500' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {isOverdue ? 'Overdue' : 
                   subject.daysLeft === 0 ? 'Due today' :
                   subject.daysLeft === 1 ? 'Due tomorrow' :
                   `${subject.daysLeft}d`}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5 mt-1">
                <div 
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    progress >= 80 ? 'bg-green-500' :
                    progress >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}