import {
  Subject,
  StudySession,
  PerformanceMetrics,
  ProductivityPattern,
  UserPreferences
} from '../types';
import { differenceInDays, addDays, format } from 'date-fns';
import { AdaptiveLearningAnalyzer } from './patternAnalyzer';

/**
 * AI Performance Prediction Engine
 * Uses machine learning concepts to predict study outcomes and optimize learning paths
 */

export class PerformancePredictor {
  
  /**
   * Predict completion probability for each subject based on current progress
   */
  static predictSubjectCompletion(
    subjects: Subject[],
    sessions: StudySession[],
    productivityPattern: ProductivityPattern,
    preferences: UserPreferences
  ): Map<string, {
    probability: number;
    expectedCompletionDate: Date;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    const predictions = new Map();
    
    subjects.forEach(subject => {
      const prediction = this.predictSingleSubjectCompletion(
        subject,
        sessions,
        productivityPattern,
        preferences
      );
      predictions.set(subject.id, prediction);
    });
    
    return predictions;
  }
  
  /**
   * Predict optimal study schedule effectiveness
   */
  static predictScheduleEffectiveness(
    plannedSessions: any[],
    historicalSessions: StudySession[],
    productivityPattern: ProductivityPattern
  ): {
    overallEffectiveness: number;
    dailyPredictions: Array<{
      date: Date;
      predictedProductivity: number;
      cognitiveLoadScore: number;
      burnoutRisk: number;
    }>;
    recommendations: string[];
  } {
    const dailyPredictions = [];
    const recommendations: string[] = [];
    
    // Group sessions by day
    const sessionsByDay = this.groupSessionsByDay(plannedSessions);
    
    let overallEffectiveness = 0;
    let dayCount = 0;
    
    for (const [dateStr, daySessions] of sessionsByDay) {
      const date = new Date(dateStr);
      const dayPrediction = this.predictDayEffectiveness(
        daySessions,
        date,
        productivityPattern,
        historicalSessions
      );
      
      dailyPredictions.push(dayPrediction);
      overallEffectiveness += dayPrediction.predictedProductivity;
      dayCount++;
      
      // Generate recommendations based on predictions
      if (dayPrediction.burnoutRisk > 0.7) {
        recommendations.push(`${format(date, 'MMM dd')}: High burnout risk - consider reducing study load`);
      }
      if (dayPrediction.cognitiveLoadScore > 4) {
        recommendations.push(`${format(date, 'MMM dd')}: Very high cognitive load - balance with easier subjects`);
      }
    }
    
    overallEffectiveness = dayCount > 0 ? overallEffectiveness / dayCount : 0;
    
    return {
      overallEffectiveness,
      dailyPredictions,
      recommendations: recommendations.slice(0, 5) // Top 5 recommendations
    };
  }
  
  /**
   * Predict learning velocity based on historical data
   */
  static predictLearningVelocity(
    sessions: StudySession[],
    subjects: Subject[]
  ): {
    currentVelocity: number; // hours per day
    projectedVelocity: number;
    velocityTrend: 'increasing' | 'decreasing' | 'stable';
    factors: {
      motivationScore: number;
      difficultyImpact: number;
      consistencyScore: number;
    };
  } {
    if (sessions.length < 7) {
      return {
        currentVelocity: 0,
        projectedVelocity: 0,
        velocityTrend: 'stable',
        factors: {
          motivationScore: 0.5,
          difficultyImpact: 0,
          consistencyScore: 0
        }
      };
    }
    
    // Calculate current velocity (last 7 days)
    const recentSessions = sessions
      .filter(s => differenceInDays(new Date(), s.startTime) <= 7)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    const currentVelocity = recentSessions.reduce((sum, s) => sum + s.duration, 0) / (60 * 7); // hours per day
    
    // Calculate historical velocities to determine trend
    const weeklyVelocities = this.calculateWeeklyVelocities(sessions);
    const velocityTrend = this.determineVelocityTrend(weeklyVelocities);
    
    // Calculate factors affecting velocity
    const motivationScore = this.calculateMotivationScore(sessions, subjects);
    const difficultyImpact = this.calculateDifficultyImpact(sessions, subjects);
    const consistencyScore = this.calculateConsistencyScore(sessions);
    
    // Project future velocity based on trends and factors
    const trendMultiplier = velocityTrend === 'increasing' ? 1.1 : 
                           velocityTrend === 'decreasing' ? 0.9 : 1.0;
    const motivationMultiplier = 0.8 + (motivationScore * 0.4); // 0.8 to 1.2
    const consistencyMultiplier = 0.9 + (consistencyScore * 0.2); // 0.9 to 1.1
    
    const projectedVelocity = currentVelocity * trendMultiplier * motivationMultiplier * consistencyMultiplier;
    
    return {
      currentVelocity: Math.round(currentVelocity * 100) / 100,
      projectedVelocity: Math.round(projectedVelocity * 100) / 100,
      velocityTrend,
      factors: {
        motivationScore: Math.round(motivationScore * 100) / 100,
        difficultyImpact: Math.round(difficultyImpact * 100) / 100,
        consistencyScore: Math.round(consistencyScore * 100) / 100
      }
    };
  }
  
  /**
   * Predict optimal review intervals using machine learning approach
   */
  static predictOptimalReviewIntervals(
    subject: Subject,
    sessions: StudySession[]
  ): Map<string, {
    nextReviewDate: Date;
    confidence: number;
    retentionProbability: number;
  }> {
    const reviewPredictions = new Map();
    
    subject.topics.forEach(topic => {
      const topicSessions = sessions.filter(s => s.topicId === topic.id);
      
      if (topicSessions.length === 0) {
        reviewPredictions.set(topic.id, {
          nextReviewDate: addDays(new Date(), 1),
          confidence: 0.5,
          retentionProbability: 0.5
        });
        return;
      }
      
      // Advanced retention prediction using multiple factors
      const prediction = this.predictTopicRetention(topic, topicSessions, subject);
      reviewPredictions.set(topic.id, prediction);
    });
    
    return reviewPredictions;
  }
  
  /**
   * Predict success probability for upcoming deadlines
   */
  static predictDeadlineSuccess(
    subjects: Subject[],
    sessions: StudySession[],
    currentVelocity: number
  ): Array<{
    subjectId: string;
    subjectName: string;
    deadline: Date;
    successProbability: number;
    requiredDailyHours: number;
    recommendations: string[];
  }> {
    return subjects.map(subject => {
      const remainingHours = subject.estimatedHours - subject.completedHours;
      const daysRemaining = Math.max(1, differenceInDays(subject.deadline, new Date()));
      const requiredDailyHours = remainingHours / daysRemaining;
      
      // Calculate success probability based on multiple factors
      let successProbability = 1.0;
      const recommendations: string[] = [];
      
      // Factor 1: Required vs available study time
      const maxDailyCapacity = Math.min(8, currentVelocity * 1.5); // Assume max 1.5x current velocity
      if (requiredDailyHours > maxDailyCapacity) {
        successProbability *= 0.3; // Very low probability if impossible daily hours
        recommendations.push('Consider extending deadline or reducing scope');
      } else if (requiredDailyHours > currentVelocity * 1.2) {
        successProbability *= 0.6; // Medium probability if requires significant increase
        recommendations.push('Increase daily study time significantly');
      } else if (requiredDailyHours > currentVelocity) {
        successProbability *= 0.8; // Good probability with moderate increase
        recommendations.push('Increase daily study time moderately');
      }
      
      // Factor 2: Subject difficulty
      const difficultyPenalty = (subject.difficulty - 3) * 0.1;
      successProbability = Math.max(0.1, successProbability - difficultyPenalty);
      
      if (subject.difficulty >= 4) {
        recommendations.push('Focus on understanding fundamentals first');
      }
      
      // Factor 3: Current progress momentum
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const recentSessions = subjectSessions.filter(s => 
        differenceInDays(new Date(), s.startTime) <= 7
      );
      
      if (recentSessions.length === 0) {
        successProbability *= 0.7; // Penalty for no recent progress
        recommendations.push('Start studying this subject immediately');
      } else {
        const avgEffectiveness = recentSessions.reduce((sum, s) => sum + s.effectiveness, 0) / recentSessions.length;
        if (avgEffectiveness < 3) {
          successProbability *= 0.8; // Penalty for low effectiveness
          recommendations.push('Review study methods and materials');
        }
      }
      
      // Factor 4: Time pressure
      if (daysRemaining <= 3) {
        successProbability *= 0.7; // High time pressure penalty
        recommendations.push('Emergency study mode - focus on key topics only');
      } else if (daysRemaining <= 7) {
        successProbability *= 0.85; // Moderate time pressure
        recommendations.push('Prioritize this subject in daily schedule');
      }
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        deadline: subject.deadline,
        successProbability: Math.round(Math.max(0.05, Math.min(0.95, successProbability)) * 100) / 100,
        requiredDailyHours: Math.round(requiredDailyHours * 100) / 100,
        recommendations: recommendations.slice(0, 2) // Top 2 recommendations
      };
    }).sort((a, b) => a.successProbability - b.successProbability); // Lowest success first
  }
  
  // Helper methods
  
  private static predictSingleSubjectCompletion(
    subject: Subject,
    sessions: StudySession[],
    productivityPattern: ProductivityPattern,
    preferences: UserPreferences
  ) {
    const remainingHours = subject.estimatedHours - subject.completedHours;
    const daysToDeadline = differenceInDays(subject.deadline, new Date());
    
    if (remainingHours <= 0) {
      return {
        probability: 1.0,
        expectedCompletionDate: new Date(),
        confidence: 1.0,
        riskFactors: [],
        recommendations: ['Subject already completed!']
      };
    }
    
    // Calculate available daily study capacity
    const avgDailyProductivity = Object.values(productivityPattern.hourlyProductivity)
      .reduce((sum, p) => sum + p, 0) / 24;
    const maxDailyHours = Math.min(preferences.maxDailyHours, avgDailyProductivity * 10);
    
    // Calculate required vs available time
    const requiredDailyHours = remainingHours / Math.max(1, daysToDeadline);
    let probability = Math.min(1, maxDailyHours / requiredDailyHours);
    
    // Adjust for subject-specific factors
    const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
    const avgEffectiveness = subjectSessions.length > 0 
      ? subjectSessions.reduce((sum, s) => sum + s.effectiveness, 0) / subjectSessions.length
      : 3;
    
    // Effectiveness adjustment
    probability *= (avgEffectiveness / 5) * 1.2; // Boost for high effectiveness
    
    // Difficulty adjustment
    const difficultyPenalty = (subject.difficulty - 3) * 0.1;
    probability = Math.max(0.1, probability - difficultyPenalty);
    
    // Calculate expected completion date
    const effectiveDailyHours = maxDailyHours * (avgEffectiveness / 5);
    const daysNeeded = Math.ceil(remainingHours / effectiveDailyHours);
    const expectedCompletionDate = addDays(new Date(), daysNeeded);
    
    // Identify risk factors
    const riskFactors: string[] = [];
    if (requiredDailyHours > maxDailyHours * 0.8) {
      riskFactors.push('High daily time requirement');
    }
    if (subject.difficulty >= 4) {
      riskFactors.push('High subject difficulty');
    }
    if (daysToDeadline <= 7) {
      riskFactors.push('Approaching deadline');
    }
    if (avgEffectiveness < 3) {
      riskFactors.push('Low study effectiveness');
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (probability < 0.7) {
      recommendations.push('Consider extending deadline or reducing scope');
      recommendations.push('Increase daily study time allocation');
    }
    if (avgEffectiveness < 3.5) {
      recommendations.push('Review and improve study techniques');
    }
    if (subject.difficulty >= 4) {
      recommendations.push('Break down into smaller, manageable topics');
    }
    
    return {
      probability: Math.round(probability * 100) / 100,
      expectedCompletionDate,
      confidence: Math.min(1, subjectSessions.length / 10), // Higher confidence with more data
      riskFactors,
      recommendations: recommendations.slice(0, 3)
    };
  }
  
  private static groupSessionsByDay(sessions: any[]): Map<string, any[]> {
    const grouped = new Map();
    sessions.forEach(session => {
      const dateStr = format(session.startTime, 'yyyy-MM-dd');
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      grouped.get(dateStr).push(session);
    });
    return grouped;
  }
  
  private static predictDayEffectiveness(
    daySessions: any[],
    date: Date,
    productivityPattern: ProductivityPattern,
    historicalSessions: StudySession[]
  ) {
    const totalDuration = daySessions.reduce((sum: number, s: any) => sum + s.duration, 0);
    const avgCognitiveLoad = daySessions.reduce((sum: number, s: any) => sum + s.cognitiveLoad, 0) / daySessions.length;
    
    // Get day of week productivity
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const dayProductivity = productivityPattern.dayOfWeekProductivity[dayOfWeek] || 0.7;
    
    // Calculate hour-weighted productivity
    let hourWeightedProductivity = 0;
    daySessions.forEach((session: any) => {
      const hour = session.startTime.getHours();
      const hourProductivity = productivityPattern.hourlyProductivity[hour] || 0.5;
      hourWeightedProductivity += hourProductivity * (session.duration / totalDuration);
    });
    
    // Predict productivity based on session characteristics
    const predictedProductivity = dayProductivity * hourWeightedProductivity * 
                                 Math.max(0.5, 1.2 - (avgCognitiveLoad / 5)); // Cognitive load penalty
    
    // Calculate burnout risk
    const dailyHours = totalDuration / 60;
    const burnoutRisk = Math.min(1, Math.max(0, (dailyHours - 4) / 4)); // Risk increases after 4 hours
    
    return {
      date,
      predictedProductivity: Math.round(predictedProductivity * 100) / 100,
      cognitiveLoadScore: Math.round(avgCognitiveLoad * 100) / 100,
      burnoutRisk: Math.round(burnoutRisk * 100) / 100
    };
  }
  
  private static calculateWeeklyVelocities(sessions: StudySession[]): number[] {
    const velocities: number[] = [];
    const now = new Date();
    
    for (let week = 0; week < 8; week++) { // Last 8 weeks
      const weekStart = addDays(now, -7 * (week + 1));
      const weekEnd = addDays(now, -7 * week);
      
      const weekSessions = sessions.filter(s => 
        s.startTime >= weekStart && s.startTime < weekEnd
      );
      
      const weeklyHours = weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60;
      const dailyAverage = weeklyHours / 7;
      velocities.unshift(dailyAverage); // Add to beginning
    }
    
    return velocities.filter(v => v > 0); // Remove weeks with no data
  }
  
  private static determineVelocityTrend(velocities: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (velocities.length < 3) return 'stable';
    
    const recent = velocities.slice(-3);
    const earlier = velocities.slice(-6, -3);
    
    if (recent.length < 3 || earlier.length < 3) return 'stable';
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, v) => sum + v, 0) / earlier.length;
    
    const changePercent = (recentAvg - earlierAvg) / earlierAvg;
    
    if (changePercent > 0.1) return 'increasing';
    if (changePercent < -0.1) return 'decreasing';
    return 'stable';
  }
  
  private static calculateMotivationScore(sessions: StudySession[], subjects: Subject[]): number {
    // Calculate motivation based on recent activity and progress
    const recentSessions = sessions.filter(s => 
      differenceInDays(new Date(), s.startTime) <= 7
    );
    
    if (recentSessions.length === 0) return 0.3;
    
    // Factor 1: Session frequency (consistency)
    const daysWithSessions = new Set(recentSessions.map(s => 
      format(s.startTime, 'yyyy-MM-dd')
    )).size;
    const consistencyScore = daysWithSessions / 7;
    
    // Factor 2: Average effectiveness
    const avgEffectiveness = recentSessions.reduce((sum, s) => sum + s.effectiveness, 0) / recentSessions.length;
    const effectivenessScore = avgEffectiveness / 5;
    
    // Factor 3: Progress momentum
    const totalProgress = subjects.reduce((sum, s) => sum + (s.completedHours / s.estimatedHours), 0) / subjects.length;
    
    return (consistencyScore * 0.4 + effectivenessScore * 0.4 + totalProgress * 0.2);
  }
  
  private static calculateDifficultyImpact(sessions: StudySession[], subjects: Subject[]): number {
    const subjectDifficulties = new Map(subjects.map(s => [s.id, s.difficulty]));
    
    const difficultyWeightedSessions = sessions.map(s => {
      const difficulty = subjectDifficulties.get(s.subjectId) || 3;
      return { session: s, difficulty };
    });
    
    const avgDifficulty = difficultyWeightedSessions.reduce((sum, item) => 
      sum + item.difficulty, 0) / difficultyWeightedSessions.length;
    
    const avgEffectiveness = difficultyWeightedSessions.reduce((sum, item) => 
      sum + item.session.effectiveness, 0) / difficultyWeightedSessions.length;
    
    // Higher difficulty should correlate with lower effectiveness
    // Return impact as how much difficulty affects performance
    return (5 - avgDifficulty) / 5 * (avgEffectiveness / 5);
  }
  
  private static calculateConsistencyScore(sessions: StudySession[]): number {
    if (sessions.length < 7) return 0.5;
    
    const last14Days = sessions.filter(s => 
      differenceInDays(new Date(), s.startTime) <= 14
    );
    
    const dailyHours = new Map<string, number>();
    last14Days.forEach(s => {
      const dateStr = format(s.startTime, 'yyyy-MM-dd');
      dailyHours.set(dateStr, (dailyHours.get(dateStr) || 0) + s.duration / 60);
    });
    
    const hours = Array.from(dailyHours.values());
    if (hours.length === 0) return 0;
    
    const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const maxStdDev = mean; // Normalize by mean
    return Math.max(0, 1 - (standardDeviation / maxStdDev));
  }
  
  private static predictTopicRetention(
    topic: any,
    sessions: StudySession[],
    subject: Subject
  ) {
    const lastSession = sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
    const daysSinceLastStudy = differenceInDays(new Date(), lastSession.startTime);
    
    // Advanced retention model considering multiple factors
    const avgEffectiveness = sessions.reduce((sum, s) => sum + s.effectiveness, 0) / sessions.length;
    const sessionCount = sessions.length;
    
    // Base retention using forgetting curve
    const memoryStrength = (avgEffectiveness / 5) * Math.log(sessionCount + 1) * (6 - subject.difficulty) / 5;
    const baseRetention = Math.exp(-daysSinceLastStudy / Math.max(1, memoryStrength * 7));
    
    // Adjust for topic difficulty
    const difficultyMultiplier = (6 - topic.difficulty) / 5;
    const retentionProbability = baseRetention * difficultyMultiplier;
    
    // Calculate optimal next review date
    const optimalInterval = Math.max(1, Math.min(30, memoryStrength * 7));
    const nextReviewDate = addDays(lastSession.startTime, Math.round(optimalInterval));
    
    // Calculate confidence based on data quality
    const confidence = Math.min(1, sessionCount / 5) * (avgEffectiveness / 5);
    
    return {
      nextReviewDate,
      confidence: Math.round(confidence * 100) / 100,
      retentionProbability: Math.round(Math.max(0.1, Math.min(1, retentionProbability)) * 100) / 100
    };
  }
}