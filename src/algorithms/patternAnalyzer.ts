import { 
  StudySession, 
  Subject, 
  ProductivityPattern, 
  PerformanceMetrics,
  AdaptiveRecommendation,
  RiskAssessment,
  StudyTechnique
} from '../types';
import { 
  differenceInDays, 
  getHours, 
  format, 
  startOfWeek, 
  endOfWeek,
  subWeeks,
  isWithinInterval
} from 'date-fns';

/**
 * Adaptive Learning Pattern Analyzer
 * Uses machine learning concepts to analyze user behavior and optimize learning
 */

export class AdaptiveLearningAnalyzer {
  
  /**
   * Analyze user productivity patterns from historical data
   */
  static analyzeProductivityPattern(sessions: StudySession[]): ProductivityPattern {
    if (sessions.length < 10) {
      // Default pattern for new users
      return this.getDefaultProductivityPattern();
    }

    const hourlyData: Record<number, { total: number; effective: number; count: number }> = {};
    const dailyData: Record<string, { total: number; effective: number; count: number }> = {};
    
    // Initialize data structures
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { total: 0, effective: 0, count: 0 };
    }
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    daysOfWeek.forEach(day => {
      dailyData[day] = { total: 0, effective: 0, count: 0 };
    });

    // Analyze session data
    sessions.forEach(session => {
      if (!session.endTime) return;
      
      const hour = getHours(session.startTime);
      const dayOfWeek = format(session.startTime, 'EEEE').toLowerCase();
      const effectivenessScore = session.effectiveness / 5; // Normalize to 0-1
      
      // Hourly productivity
      hourlyData[hour].total += session.duration;
      hourlyData[hour].effective += session.duration * effectivenessScore;
      hourlyData[hour].count += 1;
      
      // Daily productivity
      if (dailyData[dayOfWeek]) {
        dailyData[dayOfWeek].total += session.duration;
        dailyData[dayOfWeek].effective += session.duration * effectivenessScore;
        dailyData[dayOfWeek].count += 1;
      }
    });

    // Calculate productivity scores
    const hourlyProductivity: Record<number, number> = {};
    const dayOfWeekProductivity: Record<string, number> = {};
    
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData[hour];
      hourlyProductivity[hour] = data.total > 0 ? data.effective / data.total : 0.5;
    }
    
    daysOfWeek.forEach(day => {
      const data = dailyData[day];
      dayOfWeekProductivity[day] = data.total > 0 ? data.effective / data.total : 0.5;
    });

    // Calculate optimal session and break lengths
    const sessionLengths = sessions.map(s => s.duration).filter(d => d > 0);
    const effectivenessByLength = this.calculateEffectivenessBySessionLength(sessions);
    
    const optimalSessionLength = this.findOptimalValue(effectivenessByLength) || 45;
    const optimalBreakLength = this.calculateOptimalBreakLength(sessions);
    
    // Calculate focus decline rate
    const focusDeclineRate = this.calculateFocusDeclineRate(sessions);

    return {
      hourlyProductivity,
      dayOfWeekProductivity,
      sessionLengthOptimal: optimalSessionLength,
      breakLengthOptimal: optimalBreakLength,
      focusDeclineRate
    };
  }

  /**
   * Generate adaptive recommendations based on patterns
   */
  static generateAdaptiveRecommendations(
    sessions: StudySession[],
    subjects: Subject[],
    productivityPattern: ProductivityPattern
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];
    
    // Analyze recent performance
    const recentSessions = this.getRecentSessions(sessions, 14);
    const performanceMetrics = this.calculatePerformanceMetrics(recentSessions, subjects);
    
    // Productivity optimization recommendations
    const productivityRecs = this.generateProductivityRecommendations(
      productivityPattern, 
      performanceMetrics
    );
    recommendations.push(...productivityRecs);
    
    // Study technique recommendations
    const techniqueRecs = this.generateTechniqueRecommendations(sessions, subjects);
    recommendations.push(...techniqueRecs);
    
    // Schedule adjustment recommendations
    const scheduleRecs = this.generateScheduleRecommendations(
      recentSessions, 
      subjects, 
      productivityPattern
    );
    recommendations.push(...scheduleRecs);
    
    // Burnout prevention recommendations
    const burnoutRecs = this.generateBurnoutPreventionRecommendations(recentSessions);
    recommendations.push(...burnoutRecs);

    return recommendations
      .sort((a, b) => this.getImpactScore(b.impact) - this.getImpactScore(a.impact))
      .slice(0, 5); // Top 5 recommendations
  }

  /**
   * Assess learning risks and provide mitigation strategies
   */
  static assessLearningRisks(
    sessions: StudySession[],
    subjects: Subject[]
  ): RiskAssessment {
    const riskFactors = [];
    const mitigationStrategies = [];
    
    // Deadline pressure risk
    const urgentSubjects = subjects.filter(s => 
      differenceInDays(s.deadline, new Date()) <= 7 && 
      s.completedHours / s.estimatedHours < 0.8
    );
    
    if (urgentSubjects.length > 0) {
      riskFactors.push({
        type: 'deadline_pressure' as const,
        severity: 4 as const,
        description: `${urgentSubjects.length} subjects have upcoming deadlines with insufficient progress`,
        affectedSubjects: urgentSubjects.map(s => s.id),
        probability: 0.8
      });
      
      mitigationStrategies.push({
        riskType: 'deadline_pressure',
        strategy: 'Increase daily study time by 50% and focus on high-priority topics',
        expectedReduction: 0.6,
        implementationEffort: 'high' as const
      });
    }
    
    // Burnout risk assessment
    const recentSessions = this.getRecentSessions(sessions, 7);
    const dailyHours = this.calculateDailyAverageHours(recentSessions);
    
    if (dailyHours > 8) {
      riskFactors.push({
        type: 'burnout_risk' as const,
        severity: 3 as const,
        description: 'Studying over 8 hours daily increases burnout risk',
        affectedSubjects: subjects.map(s => s.id),
        probability: 0.6
      });
      
      mitigationStrategies.push({
        riskType: 'burnout_risk',
        strategy: 'Implement mandatory breaks and limit daily study time to 6-7 hours',
        expectedReduction: 0.7,
        implementationEffort: 'medium' as const
      });
    }
    
    // Topic difficulty clustering risk
    const difficultyDistribution = this.analyzeDifficultyDistribution(subjects);
    if (difficultyDistribution.highDifficulty > 0.6) {
      riskFactors.push({
        type: 'topic_difficulty' as const,
        severity: 3 as const,
        description: 'High concentration of difficult subjects may overwhelm learning capacity',
        affectedSubjects: subjects.filter(s => s.difficulty >= 4).map(s => s.id),
        probability: 0.5
      });
      
      mitigationStrategies.push({
        riskType: 'topic_difficulty',
        strategy: 'Interleave difficult topics with easier ones and extend learning timeline',
        expectedReduction: 0.5,
        implementationEffort: 'medium' as const
      });
    }
    
    // Calculate overall risk
    const avgSeverity = riskFactors.reduce((sum, r) => sum + r.severity, 0) / riskFactors.length;
    const overallRisk: 'low' | 'medium' | 'high' = 
      avgSeverity >= 4 ? 'high' : avgSeverity >= 2.5 ? 'medium' : 'low';
    
    return {
      overallRisk,
      riskFactors,
      mitigationStrategies
    };
  }

  /**
   * Predict learning outcomes based on current patterns
   */
  static predictLearningOutcomes(
    sessions: StudySession[],
    subjects: Subject[],
    productivityPattern: ProductivityPattern
  ): {
    subjectCompletionProbability: Map<string, number>;
    overallSuccessRate: number;
    recommendedAdjustments: string[];
  } {
    const predictions = new Map<string, number>();
    const adjustments: string[] = [];
    
    subjects.forEach(subject => {
      const completionRate = subject.completedHours / subject.estimatedHours;
      const daysRemaining = Math.max(1, differenceInDays(subject.deadline, new Date()));
      const hoursRemaining = subject.estimatedHours - subject.completedHours;
      
      // Calculate required daily hours
      const requiredDailyHours = hoursRemaining / daysRemaining;
      
      // Estimate achievable daily hours based on productivity pattern
      const avgProductivity = Object.values(productivityPattern.hourlyProductivity)
        .reduce((sum, p) => sum + p, 0) / 24;
      const achievableDailyHours = Math.min(6, avgProductivity * 8); // Max 6 hours per day
      
      // Calculate completion probability
      let probability = Math.min(1, achievableDailyHours / requiredDailyHours);
      
      // Adjust for subject difficulty
      const difficultyPenalty = (subject.difficulty - 3) * 0.1;
      probability = Math.max(0.1, probability - difficultyPenalty);
      
      // Adjust for current progress momentum
      const recentSubjectSessions = sessions.filter(s => 
        s.subjectId === subject.id && 
        differenceInDays(new Date(), s.startTime) <= 7
      );
      const recentProgress = recentSubjectSessions.length > 0 ? 1.1 : 0.9;
      probability *= recentProgress;
      
      predictions.set(subject.id, Math.min(1, Math.max(0.1, probability)));
      
      // Generate adjustment recommendations
      if (probability < 0.7) {
        if (requiredDailyHours > achievableDailyHours * 1.5) {
          adjustments.push(`Consider extending deadline for ${subject.name} or reducing scope`);
        } else {
          adjustments.push(`Increase daily study time for ${subject.name} to ${Math.ceil(requiredDailyHours)} hours`);
        }
      }
    });
    
    const overallSuccessRate = Array.from(predictions.values())
      .reduce((sum, p) => sum + p, 0) / predictions.size;
    
    return {
      subjectCompletionProbability: predictions,
      overallSuccessRate,
      recommendedAdjustments: adjustments
    };
  }

  // Helper methods
  
  private static getDefaultProductivityPattern(): ProductivityPattern {
    const hourlyProductivity: Record<number, number> = {};
    
    // Default productivity curve (higher in morning and evening)
    for (let hour = 0; hour < 24; hour++) {
      if (hour >= 9 && hour <= 11) hourlyProductivity[hour] = 0.9; // Morning peak
      else if (hour >= 14 && hour <= 16) hourlyProductivity[hour] = 0.7; // Afternoon
      else if (hour >= 19 && hour <= 21) hourlyProductivity[hour] = 0.8; // Evening
      else if (hour >= 6 && hour <= 23) hourlyProductivity[hour] = 0.5; // Regular hours
      else hourlyProductivity[hour] = 0.2; // Night/early morning
    }
    
    const dayOfWeekProductivity = {
      monday: 0.8, tuesday: 0.85, wednesday: 0.9, thursday: 0.85,
      friday: 0.7, saturday: 0.6, sunday: 0.7
    };
    
    return {
      hourlyProductivity,
      dayOfWeekProductivity,
      sessionLengthOptimal: 45,
      breakLengthOptimal: 15,
      focusDeclineRate: 0.02
    };
  }
  
  private static calculateEffectivenessBySessionLength(sessions: StudySession[]): Record<number, number> {
    const lengthGroups: Record<number, { effectiveness: number; count: number }> = {};
    
    sessions.forEach(session => {
      const length = Math.floor(session.duration / 15) * 15; // Group by 15-minute intervals
      if (!lengthGroups[length]) {
        lengthGroups[length] = { effectiveness: 0, count: 0 };
      }
      lengthGroups[length].effectiveness += session.effectiveness;
      lengthGroups[length].count += 1;
    });
    
    const result: Record<number, number> = {};
    Object.entries(lengthGroups).forEach(([length, data]) => {
      result[parseInt(length)] = data.effectiveness / data.count;
    });
    
    return result;
  }
  
  private static findOptimalValue(data: Record<number, number>): number | null {
    let maxValue = -1;
    let optimalKey = null;
    
    Object.entries(data).forEach(([key, value]) => {
      if (value > maxValue) {
        maxValue = value;
        optimalKey = parseInt(key);
      }
    });
    
    return optimalKey;
  }
  
  private static calculateOptimalBreakLength(sessions: StudySession[]): number {
    // Analyze effectiveness after different break lengths
    // This is a simplified version - real implementation would be more sophisticated
    return 15; // Default optimal break length
  }
  
  private static calculateFocusDeclineRate(sessions: StudySession[]): number {
    // Analyze how focus/effectiveness declines during sessions
    const longSessions = sessions.filter(s => s.duration >= 60);
    if (longSessions.length < 5) return 0.02; // Default
    
    // Calculate average decline rate (simplified)
    return 0.02; // 2% decline per hour
  }
  
  private static getRecentSessions(sessions: StudySession[], days: number): StudySession[] {
    const cutoff = subWeeks(new Date(), Math.floor(days / 7));
    return sessions.filter(s => s.startTime >= cutoff);
  }
  
  private static calculatePerformanceMetrics(
    sessions: StudySession[], 
    subjects: Subject[]
  ): PerformanceMetrics {
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const avgEffectiveness = sessions.reduce((sum, s) => sum + s.effectiveness, 0) / sessions.length || 0;
    
    return {
      overallProductivity: Math.min(1, totalHours / (sessions.length * 0.75)), // Normalize
      subjectMastery: new Map(), // Would be calculated from actual data
      studyVelocity: totalHours / 7, // Hours per day
      retentionRate: 0.8, // Would be calculated from review performance
      goalAchievementRate: 0.7, // Would be calculated from completed goals
      sessionEffectiveness: avgEffectiveness,
      focusScore: Math.min(1, avgEffectiveness / 4),
      streakDays: this.calculateStreakDays(sessions),
      totalStudyHours: totalHours,
      sessionsCompleted: sessions.length
    };
  }
  
  private static calculateStreakDays(sessions: StudySession[]): number {
    // Calculate consecutive days with study sessions
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const hasSession = sessions.some(s => 
        format(s.startTime, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );
      
      if (!hasSession) break;
      
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return streak;
  }
  
  private static generateProductivityRecommendations(
    pattern: ProductivityPattern,
    metrics: PerformanceMetrics
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];
    
    // Find peak productivity hours
    const peakHours = Object.entries(pattern.hourlyProductivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    if (metrics.sessionEffectiveness < 3.5) {
      recommendations.push({
        type: 'schedule_adjustment',
        title: 'Optimize Study Timing',
        description: `Schedule challenging subjects during your peak hours: ${peakHours.join(', ')}:00`,
        reasoning: 'Your productivity is highest during these times based on historical data',
        impact: 'high',
        actionRequired: true,
        implementBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      });
    }
    
    return recommendations;
  }
  
  private static generateTechniqueRecommendations(
    sessions: StudySession[],
    subjects: Subject[]
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];
    
    // Analyze technique effectiveness
    const techniqueEffectiveness = this.analyzeTechniqueEffectiveness(sessions);
    
    const leastEffective = Object.entries(techniqueEffectiveness)
      .sort(([,a], [,b]) => a - b)[0];
    
    if (leastEffective && leastEffective[1] < 3) {
      recommendations.push({
        type: 'technique_change',
        title: 'Switch Study Technique',
        description: `Consider replacing "${leastEffective[0]}" with more effective techniques`,
        reasoning: `This technique shows lower effectiveness (${leastEffective[1]}/5) compared to others`,
        impact: 'medium',
        actionRequired: false
      });
    }
    
    return recommendations;
  }
  
  private static generateScheduleRecommendations(
    sessions: StudySession[],
    subjects: Subject[],
    pattern: ProductivityPattern
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];
    
    if (pattern.sessionLengthOptimal !== 45) {
      recommendations.push({
        type: 'schedule_adjustment',
        title: 'Adjust Session Length',
        description: `Your optimal session length is ${pattern.sessionLengthOptimal} minutes`,
        reasoning: 'Based on your effectiveness data across different session lengths',
        impact: 'medium',
        actionRequired: false
      });
    }
    
    return recommendations;
  }
  
  private static generateBurnoutPreventionRecommendations(
    sessions: StudySession[]
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];
    
    const dailyHours = this.calculateDailyAverageHours(sessions);
    
    if (dailyHours > 6) {
      recommendations.push({
        type: 'break_modification',
        title: 'Prevent Burnout',
        description: 'Consider reducing daily study hours and taking more breaks',
        reasoning: `You're averaging ${dailyHours.toFixed(1)} hours daily, which may lead to burnout`,
        impact: 'high',
        actionRequired: true
      });
    }
    
    return recommendations;
  }
  
  private static getImpactScore(impact: 'high' | 'medium' | 'low'): number {
    return impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
  }
  
  private static calculateDailyAverageHours(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const daysSpan = Math.max(1, differenceInDays(
      sessions[sessions.length - 1].startTime,
      sessions[0].startTime
    ));
    
    return totalHours / daysSpan;
  }
  
  private static analyzeDifficultyDistribution(subjects: Subject[]): {
    highDifficulty: number;
    mediumDifficulty: number;
    lowDifficulty: number;
  } {
    const total = subjects.length;
    const high = subjects.filter(s => s.difficulty >= 4).length;
    const medium = subjects.filter(s => s.difficulty === 3).length;
    const low = subjects.filter(s => s.difficulty <= 2).length;
    
    return {
      highDifficulty: high / total,
      mediumDifficulty: medium / total,
      lowDifficulty: low / total
    };
  }
  
  private static analyzeTechniqueEffectiveness(sessions: StudySession[]): Record<string, number> {
    const techniqueData: Record<string, { total: number; count: number }> = {};
    
    sessions.forEach(session => {
      const technique = session.technique;
      if (!techniqueData[technique]) {
        techniqueData[technique] = { total: 0, count: 0 };
      }
      techniqueData[technique].total += session.effectiveness;
      techniqueData[technique].count += 1;
    });
    
    const effectiveness: Record<string, number> = {};
    Object.entries(techniqueData).forEach(([technique, data]) => {
      effectiveness[technique] = data.total / data.count;
    });
    
    return effectiveness;
  }
}