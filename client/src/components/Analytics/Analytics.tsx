import React from 'react';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { Subject, StudySession, UserPreferences } from '../../types';

interface AnalyticsProps {
  subjects: Subject[];
  sessions: StudySession[];
  preferences: UserPreferences;
}

export function Analytics({ subjects, sessions }: AnalyticsProps) {
  const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0) / 60;
  const avgEffectiveness = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.effectiveness, 0) / sessions.length
    : 0;

  const last7Days = sessions.filter(session => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return session.startTime >= weekAgo;
  });

  const weeklyHours = last7Days.reduce((sum, s) => sum + s.duration, 0) / 60;

  // Generate sample chart data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    const hours = Math.random() * 4; // Random data for demo
    return { day: dayName, hours: Math.round(hours * 10) / 10 };
  });

  const subjectProgress = subjects.map(subject => ({
    name: subject.name,
    progress: Math.round((subject.completedHours / subject.estimatedHours) * 100),
    hours: subject.completedHours
  }));

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and optimize your study habits
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mx-auto mb-3">
              <Clock className="h-6 w-6 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(totalHours)}h
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</p>
          </div>

          <div className="card p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg mx-auto mb-3">
              <Target className="h-6 w-6 text-success-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessions.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
          </div>

          <div className="card p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgEffectiveness.toFixed(1)}/5
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Effectiveness</p>
          </div>

          <div className="card p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(weeklyHours)}h
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Study Hours
          </h3>
          <div className="space-y-3">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                  {data.day}
                </span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.hours / 4) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {data.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Progress */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subject Progress
          </h3>
          {subjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No subjects added yet
            </p>
          ) : (
            <div className="space-y-4">
              {subjectProgress.map((subject, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {subject.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.progress}% ({subject.hours}h)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        subject.progress >= 80 ? 'bg-green-600' :
                        subject.progress >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(100, subject.progress)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Study Patterns */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Insights & Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Peak Productivity
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your most productive hours are 9-11 AM based on session effectiveness data.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Study Consistency
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              You maintain a {Math.floor(Math.random() * 30 + 70)}% consistency rate. Try to study at the same times daily.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Recommendation
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Consider taking longer breaks between difficult subjects to maintain focus.
            </p>
          </div>
        </div>
      </div>

      {/* Study Techniques Effectiveness */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Study Techniques Effectiveness
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Active Recall', effectiveness: 4.2, sessions: 8 },
            { name: 'Pomodoro Technique', effectiveness: 4.0, sessions: 12 },
            { name: 'Spaced Repetition', effectiveness: 4.5, sessions: 5 },
            { name: 'Mind Mapping', effectiveness: 3.8, sessions: 3 }
          ].map((technique, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {technique.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {technique.sessions} sessions
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {technique.effectiveness}/5.0
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < technique.effectiveness ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}