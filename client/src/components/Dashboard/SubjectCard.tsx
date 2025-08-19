import React from 'react';
import { Calendar, Clock, TrendingUp, MoreVertical } from 'lucide-react';
import { Subject, StudySession } from '../../types';
import { differenceInDays } from 'date-fns';

interface SubjectCardProps {
  subject: Subject;
  sessions: StudySession[];
  prediction?: any;
  onUpdate: (id: string, updates: Partial<Subject>) => void;
  onDelete: (id: string) => void;
  onLogTime: (subjectId: string, hours: number) => void;
}

export function SubjectCard({ subject, sessions, prediction, onLogTime }: SubjectCardProps) {
  const progress = Math.round((subject.completedHours / subject.estimatedHours) * 100);
  const daysUntilDeadline = differenceInDays(subject.deadline, new Date());
  const isOverdue = daysUntilDeadline < 0;
  const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

  const handleLogTime = () => {
    const hours = parseFloat(prompt('How many hours did you study?') || '0');
    if (hours > 0) {
      onLogTime(subject.id, hours);
    }
  };

  return (
    <div className="card p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? 'text-red-500' : isUrgent ? 'text-yellow-500' : ''}>
                {isOverdue ? 'Overdue' : `${daysUntilDeadline} days left`}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{subject.completedHours}h / {subject.estimatedHours}h</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            subject.priority === 1 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            subject.priority === 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {subject.priority === 1 ? 'High' : subject.priority === 2 ? 'Medium' : 'Low'} Priority
          </span>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Prediction */}
      {prediction && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Success probability: {Math.round(prediction.probability * 100)}%</span>
          </div>
          <span>Est. completion: {prediction.expectedCompletionDate.toLocaleDateString()}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleLogTime}
          className="flex-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Log Study Time
        </button>
        <button className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200">
          Study Now
        </button>
      </div>
    </div>
  );
}