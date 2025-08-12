import React from 'react';
import { Settings, Bell, Clock, Brain, Palette } from 'lucide-react';
import { UserPreferences } from '../../types';

interface SettingsPanelProps {
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: UserPreferences) => void;
}

export function SettingsPanel({ preferences, onUpdatePreferences }: SettingsPanelProps) {
  const updatePreference = (key: keyof UserPreferences, value: any) => {
    onUpdatePreferences({
      ...preferences,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Settings className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your learning experience
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Study Preferences */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Study Preferences
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Session Length (minutes)
                </label>
                <select
                  value={preferences.sessionLength}
                  onChange={(e) => updatePreference('sessionLength', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={25}>25 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Break Length (minutes)
                </label>
                <select
                  value={preferences.breakLength}
                  onChange={(e) => updatePreference('breakLength', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Study Style
                </label>
                <select
                  value={preferences.studyStyle}
                  onChange={(e) => updatePreference('studyStyle', e.target.value)}
                  className="input-field"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Preference
                </label>
                <select
                  value={preferences.difficultyPreference}
                  onChange={(e) => updatePreference('difficultyPreference', e.target.value)}
                  className="input-field"
                >
                  <option value="morning">Morning (Hard subjects first)</option>
                  <option value="afternoon">Afternoon (Balanced)</option>
                  <option value="evening">Evening (Easy subjects first)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Daily Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={preferences.maxDailyHours}
                  onChange={(e) => updatePreference('maxDailyHours', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Break Between Sessions (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={preferences.minBreakBetweenSessions}
                  onChange={(e) => updatePreference('minBreakBetweenSessions', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Enable Notifications
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about study sessions, breaks, and deadlines
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notificationsEnabled}
                    onChange={(e) => updatePreference('notificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* AI & Learning */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI & Learning
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Peak Productivity Hours
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Select hours when you're most productive for difficult subjects
                </p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {Array.from({ length: 24 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const newPeakHours = preferences.peakHours.includes(i)
                          ? preferences.peakHours.filter(h => h !== i)
                          : [...preferences.peakHours, i];
                        updatePreference('peakHours', newPeakHours);
                      }}
                      className={`p-2 text-xs rounded-lg border transition-colors duration-200 ${
                        preferences.peakHours.includes(i)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {i.toString().padStart(2, '0')}:00
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use dark theme for better focus during late-night study sessions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.darkMode}
                    onChange={(e) => updatePreference('darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data & Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Local Data Storage
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  All your data is stored locally in your browser. No data is sent to external servers.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button className="btn-secondary">
                  Export Data
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}