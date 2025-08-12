import {
  Subject,
  StudySession,
  StudyTechnique,
  StudyTechniqueSuggestion,
  UserPreferences,
  ProductivityPattern,
  AIInsights
} from '../types';
import { differenceInDays, format, addDays } from 'date-fns';
import { AdaptiveLearningAnalyzer } from './patternAnalyzer';
import { generateOptimalSchedule } from './scheduleOptimizer';

/**
 * Smart Study Recommendations Engine
 * Provides personalized, AI-driven study recommendations based on learning science
 */

export class SmartRecommendationEngine {
  
  /**
   * Generate comprehensive AI insights and recommendations
   */
  static generateAIInsights(
    subjects: Subject[],
    sessions: StudySession[],
    preferences: UserPreferences
  ): AIInsights {
    const productivityPattern = AdaptiveLearningAnalyzer.analyzeProductivityPattern(sessions);
    const performanceMetrics = this.calculateDetailedPerformanceMetrics(sessions, subjects);
    
    // Generate optimized schedule
    const recommendedSchedule = generateOptimalSchedule(
      subjects,
      sessions, 
      preferences,
      productivityPattern
    );
    
    // Generate study technique suggestions
    const studyTechniqueSuggestions = this.generateStudyTechniqueSuggestions(
      subjects,
      sessions,
      performanceMetrics
    );
    
    // Calculate retention predictions
    const retentionPredictions = this.calculateRetentionPredictions(subjects, sessions);
    
    // Calculate optimal review times
    const optimalReviewTimes = this.calculateOptimalReviewTimes(subjects, sessions);
    
    // Generate adaptive recommendations
    const adaptiveRecommendations = AdaptiveLearningAnalyzer.generateAdaptiveRecommendations(
      sessions,
      subjects,
      productivityPattern
    );
    
    // Assess risks
    const riskAssessment = AdaptiveLearningAnalyzer.assessLearningRisks(sessions, subjects);
    
    return {
      recommendedSchedule,
      studyTechniqueSuggestions,
      retentionPredictions,
      optimalReviewTimes,
      performanceAnalysis: performanceMetrics,
      adaptiveRecommendations,
      riskAssessment
    };
  }
  
  /**
   * Generate personalized study technique recommendations
   */
  static generateStudyTechniqueSuggestions(
    subjects: Subject[],
    sessions: StudySession[],
    performanceMetrics: any
  ): StudyTechniqueSuggestion[] {
    const suggestions: StudyTechniqueSuggestion[] = [];
    
    // Analyze current technique effectiveness
    const techniquePerformance = this.analyzeTechniquePerformance(sessions);
    
    subjects.forEach(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const currentTechniques = [...new Set(subjectSessions.map(s => s.technique))];
      
      // Get optimal techniques for this subject type and difficulty
      const optimalTechniques = this.getOptimalTechniques(subject, performanceMetrics);
      
      optimalTechniques.forEach(({ technique, reasoning, expectedImprovement }) => {
        if (!currentTechniques.includes(technique)) {
          suggestions.push({
            technique,
            subjectIds: [subject.id],
            reasoning,
            expectedImprovement,
            confidenceLevel: this.calculateConfidenceLevel(subject, technique, sessions)
          });
        }
      });
    });
    
    // Group similar suggestions
    return this.consolidateRecommendations(suggestions);
  }
  
  /**
   * Calculate retention predictions using forgetting curve models
   */
  static calculateRetentionPredictions(
    subjects: Subject[],
    sessions: StudySession[]
  ): Map<string, number> {
    const predictions = new Map<string, number>();
    
    subjects.forEach(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      if (subjectSessions.length === 0) {
        predictions.set(subject.id, 0.5); // Default for no data
        return;
      }
      
      // Calculate retention based on Ebbinghaus forgetting curve
      const lastSession = subjectSessions.sort((a, b) => 
        b.startTime.getTime() - a.startTime.getTime()
      )[0];
      
      const daysSinceLastStudy = differenceInDays(new Date(), lastSession.startTime);
      const avgEffectiveness = subjectSessions.reduce((sum, s) => sum + s.effectiveness, 0) / subjectSessions.length;
      
      // Forgetting curve: R(t) = e^(-t/S)
      // Where S (strength) is influenced by effectiveness and repetitions
      const strength = (avgEffectiveness / 5) * Math.log(subjectSessions.length + 1);
      const retention = Math.exp(-daysSinceLastStudy / Math.max(1, strength * 7)); // 7-day base period
      
      predictions.set(subject.id, Math.max(0.1, Math.min(1, retention)));
    });
    
    return predictions;
  }
  
  /**
   * Calculate optimal review times using spaced repetition principles
   */
  static calculateOptimalReviewTimes(
    subjects: Subject[],
    sessions: StudySession[]
  ): Map<string, Date> {
    const reviewTimes = new Map<string, Date>();
    
    subjects.forEach(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      if (subjectSessions.length === 0) {
        // Never studied - recommend reviewing in 1 day
        reviewTimes.set(subject.id, addDays(new Date(), 1));
        return;
      }
      
      const lastSession = subjectSessions.sort((a, b) => 
        b.startTime.getTime() - a.startTime.getTime()
      )[0];
      
      const avgEffectiveness = subjectSessions.reduce((sum, s) => sum + s.effectiveness, 0) / subjectSessions.length;
      
      // Calculate next review interval using modified SM-2 algorithm
      let interval = 1;
      
      if (avgEffectiveness >= 4) {
        interval = Math.min(14, subjectSessions.length * 2); // High performance = longer intervals
      } else if (avgEffectiveness >= 3) {
        interval = Math.min(7, subjectSessions.length); // Medium performance
      } else {
        interval = Math.min(3, Math.max(1, Math.floor(subjectSessions.length / 2))); // Poor performance = frequent reviews
      }
      
      // Adjust for subject difficulty
      const difficultyMultiplier = 1 - (subject.difficulty - 1) * 0.1;
      interval = Math.round(interval * difficultyMultiplier);
      
      reviewTimes.set(subject.id, addDays(lastSession.startTime, interval));
    });
    
    return reviewTimes;
  }
  
  /**
   * Recommend optimal study sequence based on cognitive load and dependencies
   */
  static recommendStudySequence(
    subjects: Subject[],
    availableTime: number, // in minutes
    currentHour: number,
    productivityPattern: ProductivityPattern
  ): Subject[] {
    const currentProductivity = productivityPattern.hourlyProductivity[currentHour] || 0.5;
    
    // Score subjects for current time slot
    const scoredSubjects = subjects.map(subject => {
      let score = 0;
      
      // Productivity alignment
      const isHighProductivity = currentProductivity > 0.7;
      const isHighDifficulty = subject.difficulty >= 4;
      
      if (isHighProductivity && isHighDifficulty) {
        score += 30; // High-difficulty during high-productivity time
      } else if (!isHighProductivity && !isHighDifficulty) {
        score += 20; // Easy tasks during low-productivity time
      }
      
      // Urgency factor
      const daysUntilDeadline = differenceInDays(subject.deadline, new Date());
      if (daysUntilDeadline <= 3) score += 25;
      else if (daysUntilDeadline <= 7) score += 15;
      
      // Priority factor
      score += (4 - subject.priority) * 10;
      
      // Progress factor (less complete = higher priority)
      const completionRatio = subject.completedHours / subject.estimatedHours;
      score += (1 - completionRatio) * 15;
      
      return { subject, score };
    });
    
    // Sort by score and return sequence
    return scoredSubjects
      .sort((a, b) => b.score - a.score)
      .map(item => item.subject)
      .slice(0, Math.floor(availableTime / 45)); // Assuming 45-minute sessions
  }
  
  /**
   * Generate break recommendations based on cognitive load and time
   */
  static recommendBreakActivity(
    lastSessionDifficulty: number,
    sessionDuration: number,
    timeOfDay: number
  ): {
    activity: string;
    duration: number;
    reasoning: string;
  } {
    let activity: string;
    let duration: number;
    let reasoning: string;
    
    if (sessionDuration >= 90) {
      // Long session - need substantial break
      activity = 'Take a walk outside or do light exercise';
      duration = 20;
      reasoning = 'After long study sessions, physical activity helps restore mental energy';
    } else if (lastSessionDifficulty >= 4) {
      // Difficult session - need mental reset
      activity = 'Listen to music or do breathing exercises';
      duration = 15;
      reasoning = 'High cognitive load requires mental relaxation to prevent burnout';
    } else if (timeOfDay >= 18) {
      // Evening - prepare for wind-down
      activity = 'Have a healthy snack and hydrate';
      duration = 10;
      reasoning = 'Evening breaks should support relaxation and preparation for rest';
    } else {
      // Standard break
      activity = 'Step away from screen and stretch';
      duration = 10;
      reasoning = 'Regular movement breaks maintain focus and prevent fatigue';
    }
    
    return { activity, duration, reasoning };
  }
  
  /**
   * Adaptive difficulty adjustment recommendations
   */
  static recommendDifficultyAdjustment(
    subject: Subject,
    recentSessions: StudySession[]
  ): {
    adjustment: 'increase' | 'decrease' | 'maintain';
    reasoning: string;
    newDifficulty?: number;
  } {
    const subjectSessions = recentSessions.filter(s => s.subjectId === subject.id);
    
    if (subjectSessions.length < 3) {
      return {
        adjustment: 'maintain',
        reasoning: 'Insufficient data to recommend difficulty adjustment'
      };
    }
    
    const avgEffectiveness = subjectSessions.reduce((sum, s) => sum + s.effectiveness, 0) / subjectSessions.length;
    
    if (avgEffectiveness >= 4.5) {
      // Consistently high performance - increase difficulty
      return {
        adjustment: 'increase',
        reasoning: 'High performance indicates readiness for more challenging material',
        newDifficulty: Math.min(5, subject.difficulty + 1)
      };
    } else if (avgEffectiveness <= 2.5) {
      // Poor performance - decrease difficulty
      return {
        adjustment: 'decrease',
        reasoning: 'Low effectiveness suggests current difficulty level may be too high',
        newDifficulty: Math.max(1, subject.difficulty - 1)
      };
    } else {
      return {
        adjustment: 'maintain',
        reasoning: 'Current difficulty level is appropriate based on performance'
      };
    }
  }
  
  // Helper methods
  
  private static calculateDetailedPerformanceMetrics(
    sessions: StudySession[],
    subjects: Subject[]
  ): any {
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const avgEffectiveness = sessions.reduce((sum, s) => sum + s.effectiveness, 0) / sessions.length || 0;
    
    // Calculate subject-specific mastery
    const subjectMastery = new Map<string, number>();
    subjects.forEach(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const completionRate = subject.completedHours / subject.estimatedHours;
      const sessionQuality = subjectSessions.length > 0 
        ? subjectSessions.reduce((sum, s) => sum + s.effectiveness, 0) / subjectSessions.length / 5
        : 0;
      
      subjectMastery.set(subject.id, (completionRate * 0.6) + (sessionQuality * 0.4));
    });
    
    return {
      overallProductivity: Math.min(1, totalHours / Math.max(1, sessions.length * 0.75)),
      subjectMastery,
      studyVelocity: totalHours / 7, // Assuming weekly calculation
      retentionRate: this.estimateRetentionRate(sessions),
      goalAchievementRate: this.calculateGoalAchievementRate(subjects),
      sessionEffectiveness: avgEffectiveness,
      focusScore: Math.min(1, avgEffectiveness / 4),
      streakDays: this.calculateStreakDays(sessions),
      totalStudyHours: totalHours,
      sessionsCompleted: sessions.length
    };
  }
  
  private static analyzeTechniquePerformance(sessions: StudySession[]): Record<StudyTechnique, number> {
    const techniqueData: Record<string, { total: number; count: number }> = {};
    
    sessions.forEach(session => {
      const technique = session.technique;
      if (!techniqueData[technique]) {
        techniqueData[technique] = { total: 0, count: 0 };
      }
      techniqueData[technique].total += session.effectiveness;
      techniqueData[technique].count += 1;
    });
    
    const performance: Record<StudyTechnique, number> = {} as Record<StudyTechnique, number>;
    Object.entries(techniqueData).forEach(([technique, data]) => {
      performance[technique as StudyTechnique] = data.total / data.count;
    });
    
    return performance;
  }
  
  private static getOptimalTechniques(
    subject: Subject,
    performanceMetrics: any
  ): Array<{ technique: StudyTechnique; reasoning: string; expectedImprovement: number }> {
    const techniques: Array<{ technique: StudyTechnique; reasoning: string; expectedImprovement: number }> = [];
    
    // High-difficulty subjects benefit from active recall and spaced repetition
    if (subject.difficulty >= 4) {
      techniques.push({
        technique: 'active-recall',
        reasoning: 'Active recall is highly effective for complex, high-difficulty subjects',
        expectedImprovement: 0.3
      });
      
      techniques.push({
        technique: 'feynman',
        reasoning: 'The Feynman technique helps break down complex concepts',
        expectedImprovement: 0.25
      });
    }
    
    // Math and technical subjects benefit from practice problems
    if (subject.name.toLowerCase().includes('math') || 
        subject.name.toLowerCase().includes('programming') ||
        subject.name.toLowerCase().includes('physics')) {
      techniques.push({
        technique: 'practice-problems',
        reasoning: 'Practice problems are essential for quantitative subjects',
        expectedImprovement: 0.4
      });
    }
    
    // Memory-intensive subjects benefit from spaced repetition
    if (subject.name.toLowerCase().includes('history') ||
        subject.name.toLowerCase().includes('language') ||
        subject.name.toLowerCase().includes('vocabulary')) {
      techniques.push({
        technique: 'spaced-repetition',
        reasoning: 'Spaced repetition optimizes long-term retention for factual content',
        expectedImprovement: 0.35
      });
      
      techniques.push({
        technique: 'flashcards',
        reasoning: 'Flashcards are effective for memorizing facts and vocabulary',
        expectedImprovement: 0.2
      });
    }
    
    // Multiple topics benefit from interleaving
    if (subject.topics.length > 3) {
      techniques.push({
        technique: 'interleaving',
        reasoning: 'Interleaving multiple topics improves discrimination and transfer',
        expectedImprovement: 0.15
      });
    }
    
    return techniques;
  }
  
  private static calculateConfidenceLevel(
    subject: Subject,
    technique: StudyTechnique,
    sessions: StudySession[]
  ): number {
    // Base confidence on research evidence for technique-subject combinations
    const baseConfidence = 0.7;
    
    // Adjust based on user's historical performance with similar techniques
    const similarTechniques = ['active-recall', 'spaced-repetition', 'practice-problems'];
    const userExperience = sessions.filter(s => 
      similarTechniques.includes(s.technique) && s.subjectId === subject.id
    ).length;
    
    const experienceBonus = Math.min(0.2, userExperience * 0.02);
    
    return Math.min(1, baseConfidence + experienceBonus);
  }
  
  private static consolidateRecommendations(
    suggestions: StudyTechniqueSuggestion[]
  ): StudyTechniqueSuggestion[] {
    const consolidated = new Map<StudyTechnique, StudyTechniqueSuggestion>();
    
    suggestions.forEach(suggestion => {
      const existing = consolidated.get(suggestion.technique);
      if (existing) {
        // Merge subject IDs and update metrics
        existing.subjectIds.push(...suggestion.subjectIds);
        existing.expectedImprovement = Math.max(existing.expectedImprovement, suggestion.expectedImprovement);
        existing.confidenceLevel = (existing.confidenceLevel + suggestion.confidenceLevel) / 2;
      } else {
        consolidated.set(suggestion.technique, { ...suggestion });
      }
    });
    
    return Array.from(consolidated.values())
      .sort((a, b) => b.expectedImprovement - a.expectedImprovement)
      .slice(0, 5); // Top 5 recommendations
  }
  
  private static estimateRetentionRate(sessions: StudySession[]): number {
    // Simplified retention rate estimation
    // In practice, this would be based on review session performance
    const avgEffectiveness = sessions.reduce((sum, s) => sum + s.effectiveness, 0) / sessions.length || 0;
    return Math.min(1, avgEffectiveness / 5);
  }
  
  private static calculateGoalAchievementRate(subjects: Subject[]): number {
    const totalSubjects = subjects.length;
    if (totalSubjects === 0) return 0;
    
    const achievedGoals = subjects.filter(s => {
      const completionRate = s.completedHours / s.estimatedHours;
      return completionRate >= 0.8; // Consider 80% completion as goal achievement
    }).length;
    
    return achievedGoals / totalSubjects;
  }
  
  private static calculateStreakDays(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;
    
    const sessionDates = [...new Set(sessions.map(s => format(s.startTime, 'yyyy-MM-dd')))]
      .sort()
      .reverse();
    
    let streak = 0;
    let expectedDate = format(new Date(), 'yyyy-MM-dd');
    
    for (const date of sessionDates) {
      if (date === expectedDate) {
        streak++;
        expectedDate = format(addDays(new Date(expectedDate), -1), 'yyyy-MM-dd');
      } else {
        break;
      }
    }
    
    return streak;
  }
}