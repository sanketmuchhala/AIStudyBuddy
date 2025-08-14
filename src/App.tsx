import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Target, BarChart3, MessageSquare, Settings, Sun, Moon, Bot, Sparkles } from 'lucide-react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { SmartScheduler } from './components/SmartScheduler/SmartScheduler';
import { StudyTimer } from './components/StudyTimer/StudyTimer';
import { InterviewCoach } from './components/InterviewCoach/InterviewCoach';
import { Analytics } from './components/Analytics/Analytics';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { AIChat } from './components/AIChat/AIChat';
import { AIStudyAssistant } from './components/AIStudyAssistant/AIStudyAssistant';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { Subject, StudySession, UserPreferences } from './types';
import { aiService } from './services/aiService';

// Default preferences
const defaultPreferences: UserPreferences = {
  peakHours: [9, 10, 11, 19, 20, 21],
  sessionLength: 45,
  breakLength: 15,
  studyStyle: 'mixed',
  difficultyPreference: 'morning',
  notificationsEnabled: true,
  darkMode: false,
  weekdayStudyHours: [
    { start: '09:00', end: '11:00', available: true },
    { start: '14:00', end: '16:00', available: true },
    { start: '19:00', end: '21:00', available: true }
  ],
  weekendStudyHours: [
    { start: '09:00', end: '12:00', available: true },
    { start: '14:00', end: '17:00', available: true },
    { start: '19:00', end: '21:00', available: true }
  ],
  maxDailyHours: 6,
  minBreakBetweenSessions: 15
};

type TabType = 'dashboard' | 'scheduler' | 'timer' | 'interview' | 'analytics' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('sessions', []);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('preferences', defaultPreferences);
  const [darkMode, setDarkMode] = useState(true); // Force dark mode always on
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAIStudyAssistant, setShowAIStudyAssistant] = useState(false);

  // Close AI components when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAIChat(false);
        setShowAIStudyAssistant(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const { requestPermission, showNotification } = useNotifications();

  useEffect(() => {
    // Request notification permission on app load
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update preferences
    setPreferences(prev => ({ ...prev, darkMode }));
  }, [darkMode, setPreferences]);

  const addSubject = (subject: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `subject_${Date.now()}`,
      createdAt: new Date(),
      topics: subject.topics || [],
      studyTechniques: subject.studyTechniques || ['active-recall'],
      retentionRate: 0.8,
      cognitiveLoad: subject.difficulty
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === id ? { ...subject, ...updates } : subject
    ));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
    setSessions(prev => prev.filter(session => session.subjectId !== id));
  };

  const addSession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `session_${Date.now()}`
    };
    setSessions(prev => [...prev, newSession]);
    
    // Update subject progress
    if (session.completed) {
      updateSubject(session.subjectId, {
        completedHours: subjects.find(s => s.id === session.subjectId)?.completedHours + (session.duration / 60) || 0
      });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'scheduler', label: 'AI Scheduler', icon: Calendar },
    { id: 'timer', label: 'Study Timer', icon: Target },
    { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Close AI components when switching tabs
    setShowAIChat(false);
    setShowAIStudyAssistant(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            subjects={subjects}
            sessions={sessions}
            preferences={preferences}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
          />
        );
      case 'scheduler':
        return (
          <SmartScheduler
            subjects={subjects}
            sessions={sessions}
            preferences={preferences}
            onUpdatePreferences={setPreferences}
          />
        );
      case 'timer':
        return (
          <StudyTimer
            subjects={subjects}
            sessions={sessions}
            preferences={preferences}
            onAddSession={addSession}
            onShowNotification={showNotification}
          />
        );
      case 'interview':
        return <InterviewCoach />;
      case 'analytics':
        return (
          <Analytics
            subjects={subjects}
            sessions={sessions}
            preferences={preferences}
          />
        );
      case 'settings':
        return (
          <SettingsPanel
            preferences={preferences}
            onUpdatePreferences={setPreferences}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen dark" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0a0a0a', borderBottomColor: '#333333' }} className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #00ff88 0%, #0066ff 100%)' }}>
                <Brain className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #00ff88 0%, #0066ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Smart AI Study Planner</h1>
                <p className="text-xs" style={{ color: '#888888' }}>Powered by AI • Enhanced Learning</p>
              </div>
            </div>

            {/* AI Features */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAIStudyAssistant(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-black font-medium"
                style={{ 
                  background: showAIStudyAssistant ? '#00ff88' : 'linear-gradient(135deg, #ff0080 0%, #ff6600 100%)',
                }}
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI Assistant</span>
              </button>
              <button
                onClick={() => setShowAIChat(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-black font-medium"
                style={{ 
                  background: showAIChat ? '#00ff88' : 'linear-gradient(135deg, #00ff88 0%, #0066ff 100%)',
                }}
              >
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium">AI Chat</span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="card p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as TabType)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="card p-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</span>
                  <span className="font-semibold text-primary-600">{subjects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Study Sessions</span>
                  <span className="font-semibold text-success-600">{sessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Hours</span>
                  <span className="font-semibold text-warning-600">
                    {Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)}h
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="animate-fade-in-scale">
              {renderActiveTab()}
            </div>
          </main>
        </div>
      </div>

      {/* AI Components - Only render when open */}
      {showAIChat && (
        <AIChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      )}
      
      {showAIStudyAssistant && (
        <AIStudyAssistant
          subjects={subjects.map(s => s.name)}
          onClose={() => setShowAIStudyAssistant(false)}
        />
      )}

      {/* Backdrop for AI components */}
      {(showAIChat || showAIStudyAssistant) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setShowAIChat(false);
            setShowAIStudyAssistant(false);
          }}
        />
      )}
    </div>
  );
}

export default App;