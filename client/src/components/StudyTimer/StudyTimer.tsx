import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Subject, StudySession, UserPreferences } from '../../types';

interface StudyTimerProps {
  subjects: Subject[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onAddSession: (session: Omit<StudySession, 'id'>) => void;
  onShowNotification: (title: string, options?: any) => void;
}

export function StudyTimer({ subjects, onAddSession, onShowNotification }: StudyTimerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (!isBreak && sessionStartTime && selectedSubject) {
      // Log study session
      const session: Omit<StudySession, 'id'> = {
        subjectId: selectedSubject,
        startTime: sessionStartTime,
        endTime: new Date(),
        duration: 25, // 25 minutes
        effectiveness: 4, // Default effectiveness
        technique: 'pomodoro',
        notes: '',
        completed: true,
        interruptions: 0
      };
      onAddSession(session);
      
      onShowNotification('Study Session Complete!', {
        body: 'Great job! Time for a 5-minute break.',
        tag: 'session-complete'
      });
    } else if (isBreak) {
      onShowNotification('Break Over!', {
        body: 'Ready for another study session?',
        tag: 'break-complete'
      });
    }

    // Switch between study and break
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? 25 * 60 : 5 * 60); // 25 min study or 5 min break
  };

  const startTimer = () => {
    if (!selectedSubject && !isBreak) {
      alert('Please select a subject first!');
      return;
    }
    
    setIsActive(true);
    if (!isBreak && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Study Timer
          </h2>

          {/* Timer Display */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
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
                strokeDasharray={`${progress}, 100`}
                className={isBreak ? 'text-green-500' : 'text-primary-600'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isBreak ? 'Break Time' : 'Study Time'}
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          {!isBreak && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field"
                disabled={isActive}
              >
                <option value="">Choose a subject...</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={startTimer}
              disabled={isActive}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              <Play className="h-5 w-5" />
              <span>Start</span>
            </button>

            <button
              onClick={pauseTimer}
              disabled={!isActive}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              <Pause className="h-5 w-5" />
              <span>Pause</span>
            </button>

            <button
              onClick={resetTimer}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Current Session Info */}
          {sessionStartTime && selectedSubject && (
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <h3 className="font-medium text-primary-900 dark:text-primary-100">
                Current Session
              </h3>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                {subjects.find(s => s.id === selectedSubject)?.name}
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                Started at {sessionStartTime.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timer Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Timer Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Duration (minutes)
            </label>
            <select className="input-field" defaultValue="25">
              <option value="15">15 minutes</option>
              <option value="25">25 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Break Duration (minutes)
            </label>
            <select className="input-field" defaultValue="5">
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}