import React from 'react';
import { TrendingUp, Target, Clock } from 'lucide-react';
import { Subject, StudySession } from '../../types';

interface ProgressOverviewProps {
  subjects: Subject[];
  sessions: StudySession[];
  completionPredictions?: Map<string, any>;
}

export function ProgressOverview({ subjects, sessions }: ProgressOverviewProps) {
  const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0) / 60;
  const totalEstimated = subjects.reduce((sum, subject) => sum + subject.estimatedHours, 0);
  const totalCompleted = subjects.reduce((sum, subject) => sum + subject.completedHours, 0);
  const overallProgress = totalEstimated > 0 ? (totalCompleted / totalEstimated) * 100 : 0;

  const sessionsThisWeek = sessions.filter(session => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return session.startTime >= weekAgo;
  }).length;

  const avgEffectiveness = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.effectiveness, 0) / sessions.length
    : 0;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-200 dark:text-gray-700"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${overallProgress}, 100`}
                className="text-primary-600"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Overall Progress</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(totalCompleted)}h / {totalEstimated}h
          </p>
        </div>

        {/* Study Stats */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
              <Clock className="h-4 w-4 text-success-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(totalHours)}h Total
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Study time logged</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Target className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {sessionsThisWeek} Sessions
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <TrendingUp className="h-4 w-4 text-warning-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {avgEffectiveness.toFixed(1)}/5.0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg effectiveness</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {subjects.filter(s => s.completedHours / s.estimatedHours >= 0.8).length}/{subjects.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Near completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}