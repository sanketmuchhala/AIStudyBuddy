import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Target, TrendingUp, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { Subject, StudySession, UserPreferences } from '../../types';
import { SmartRecommendationEngine } from '../../algorithms/recommendationEngine';
import { AdaptiveLearningAnalyzer } from '../../algorithms/patternAnalyzer';
import { PerformancePredictor } from '../../algorithms/performancePredictor';
import { AddSubjectModal } from './AddSubjectModal';
import { SubjectCard } from './SubjectCard';
import { RecommendationCard } from './RecommendationCard';
import { ProgressOverview } from './ProgressOverview';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { QuickActions } from './QuickActions';

interface DashboardProps {
  subjects: Subject[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onAddSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
}

export function Dashboard({
  subjects,
  sessions,
  preferences,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject
}: DashboardProps) {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      setLoading(true);
      try {
        // Generate AI insights
        const insights = SmartRecommendationEngine.generateAIInsights(
          subjects,
          sessions,
          preferences
        );
        
        // Get productivity pattern
        const productivityPattern = AdaptiveLearningAnalyzer.analyzeProductivityPattern(sessions);
        
        // Get performance predictions
        const completionPredictions = PerformancePredictor.predictSubjectCompletion(
          subjects,
          sessions,
          productivityPattern,
          preferences
        );
        
        // Get learning velocity
        const velocityData = PerformancePredictor.predictLearningVelocity(sessions, subjects);
        
        setAiInsights({
          ...insights,
          productivityPattern,
          completionPredictions,
          velocityData
        });
      } catch (error) {
        console.error('Error generating AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [subjects, sessions, preferences]);

  const handleLogStudyTime = (subjectId: string, hours: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      onUpdateSubject(subjectId, {
        completedHours: subject.completedHours + hours
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Generating AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome to your AI Study Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personalized learning assistant powered by advanced algorithms
            </p>
          </div>
          <button
            onClick={() => setShowAddSubject(true)}
            className="btn-primary flex items-center space-x-2 text-sm px-3 py-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* AI Insights Summary */}
      {aiInsights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Learning Velocity</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {aiInsights.velocityData?.currentVelocity?.toFixed(1) || '0.0'}h/day
                </p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-success-100 dark:bg-success-900 rounded-lg">
                <Target className="h-4 w-4 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(aiInsights.performanceAnalysis?.goalAchievementRate * 100 || 0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {aiInsights.riskAssessment?.overallRisk || 'Low'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Subjects</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {subjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Progress Overview */}
        <ProgressOverview
          subjects={subjects}
          sessions={sessions}
          completionPredictions={aiInsights?.completionPredictions}
        />

        {/* Secondary Info Row - Distributed horizontally */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quick Actions */}
          <div className="card p-2">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Quick Actions</h3>
            <QuickActions subjects={subjects} />
          </div>

          {/* Upcoming Deadlines */}
          <div className="card p-2">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Deadlines</h3>
            <UpcomingDeadlines subjects={subjects.slice(0, 2)} />
          </div>

          {/* AI Recommendations */}
          {aiInsights?.adaptiveRecommendations && (
            <div className="card p-2">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">AI Tips</h3>
              <div className="space-y-1">
                {aiInsights.adaptiveRecommendations.slice(0, 1).map((rec: any, index: number) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Today's Schedule */}
          {aiInsights?.recommendedSchedule && (
            <div className="card p-2">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar className="h-3 w-3 text-primary-600" />
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Today</h3>
              </div>
              <div className="space-y-1">
                {aiInsights.recommendedSchedule.schedule
                  .filter((session: any) => {
                    const today = new Date().toDateString();
                    return session.startTime.toDateString() === today;
                  })
                  .slice(0, 1)
                  .map((session: any, index: number) => (
                    <div key={index} className="py-0.5 text-xs">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {subjects.find(s => s.id === session.subjectId)?.name || 'Unknown'}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration}m
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Study Techniques Row */}
        {aiInsights?.studyTechniqueSuggestions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiInsights.studyTechniqueSuggestions.slice(0, 3).map((suggestion: any, index: number) => (
              <div key={index} className="card p-2">
                <h4 className="text-xs font-medium text-gray-900 dark:text-white capitalize mb-1">
                  {suggestion.technique.replace('-', ' ')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {suggestion.reasoning}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Main Subjects List */}
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Subjects</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {subjects.length} subjects
            </span>
          </div>
          
          {subjects.length === 0 ? (
            <div className="text-center py-4">
              <BookOpen className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                No subjects added yet. Add your first subject to get started!
              </p>
              <button
                onClick={() => setShowAddSubject(true)}
                className="btn-primary text-xs px-2 py-1"
              >
                Add Your First Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  sessions={sessions.filter(s => s.subjectId === subject.id)}
                  prediction={aiInsights?.completionPredictions?.get(subject.id)}
                  onUpdate={onUpdateSubject}
                  onDelete={onDeleteSubject}
                  onLogTime={handleLogStudyTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddSubject && (
        <AddSubjectModal
          onAdd={onAddSubject}
          onClose={() => setShowAddSubject(false)}
        />
      )}
    </div>
  );
}