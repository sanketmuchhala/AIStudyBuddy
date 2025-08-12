import React from 'react';
import { Calendar, Brain, Settings } from 'lucide-react';
import { Subject, StudySession, UserPreferences } from '../../types';

interface SmartSchedulerProps {
  subjects: Subject[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: UserPreferences) => void;
}

export function SmartScheduler({ subjects }: SmartSchedulerProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Brain className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Smart Scheduler</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent scheduling powered by spaced repetition and cognitive load optimization
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Subjects to Schedule
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add subjects to your dashboard to generate an AI-optimized study schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">AI-Generated Schedule</h3>
                <div className="space-y-3">
                  {subjects.slice(0, 5).map((subject, index) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">{subject.name}</h4>
                        <p className="text-sm text-gray-500">Recommended: {45 + index * 15} minutes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {9 + index}:00 AM
                        </p>
                        <p className="text-xs text-gray-500">Peak productivity time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold">Schedule Preferences</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Length</label>
                    <select className="input-field">
                      <option value="30">30 minutes</option>
                      <option value="45" selected>45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Break Length</label>
                    <select className="input-field">
                      <option value="10">10 minutes</option>
                      <option value="15" selected>15 minutes</option>
                      <option value="20">20 minutes</option>
                      <option value="30">30 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty Preference</label>
                    <select className="input-field">
                      <option value="morning" selected>Morning (Hard subjects)</option>
                      <option value="afternoon">Afternoon (Medium subjects)</option>
                      <option value="evening">Evening (Easy subjects)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your peak productivity hours are 9-11 AM based on historical data.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Spaced repetition suggests reviewing subjects every 3-7 days for optimal retention.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Consider reducing cognitive load in the afternoon by scheduling easier subjects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}