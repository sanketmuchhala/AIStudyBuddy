import { Topic, StudySession } from '../types';
import { addDays, differenceInDays } from 'date-fns';

/**
 * SM-2 (SuperMemo 2) Spaced Repetition Algorithm Implementation
 * Based on the research by Piotr Wozniak for optimal memory retention
 */

export interface SM2Result {
  interval: number; // days until next review
  easeFactor: number; // ease of remembering (1.3-2.5)
  reviewCount: number; // number of reviews
  nextReviewDate: Date;
}

/**
 * Calculate next review using SM-2 algorithm
 * @param quality - Quality of response (0-5): 0=complete blackout, 5=perfect response
 * @param easeFactor - Current ease factor (default: 2.5)
 * @param interval - Previous interval in days (default: 1)
 * @param reviewCount - Number of times reviewed (default: 0)
 */
export function calculateNextReview(
  quality: number,
  easeFactor: number = 2.5,
  interval: number = 1,
  reviewCount: number = 0
): SM2Result {
  // Ensure quality is within bounds
  quality = Math.max(0, Math.min(5, quality));
  
  // Calculate new ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ensure ease factor stays within reasonable bounds
  newEaseFactor = Math.max(1.3, newEaseFactor);
  
  let newInterval: number;
  let newReviewCount = reviewCount + 1;
  
  // If quality < 3, reset the learning process
  if (quality < 3) {
    newInterval = 1;
    newReviewCount = 0;
  } else {
    if (reviewCount === 0) {
      newInterval = 1;
    } else if (reviewCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }
  
  const nextReviewDate = addDays(new Date(), newInterval);
  
  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    reviewCount: newReviewCount,
    nextReviewDate
  };
}

/**
 * Enhanced spaced repetition that considers user performance patterns
 */
export function calculateAdaptiveReview(
  topic: Topic,
  recentSessions: StudySession[],
  userRetentionRate: number = 0.8
): SM2Result {
  // Get the most recent quality score from sessions
  const recentSession = recentSessions
    .filter(s => s.topicId === topic.id)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
    
  const quality = recentSession?.effectiveness || 3;
  
  // Apply user-specific retention rate adjustment
  const retentionAdjustment = userRetentionRate < 0.7 ? -0.5 : userRetentionRate > 0.9 ? 0.5 : 0;
  const adjustedQuality = Math.max(0, Math.min(5, quality + retentionAdjustment));
  
  const result = calculateNextReview(
    adjustedQuality,
    topic.easeFactor,
    topic.reviewInterval,
    topic.reviewCount
  );
  
  // Additional adaptive factors
  const daysSinceLastReview = topic.lastReviewed 
    ? differenceInDays(new Date(), topic.lastReviewed)
    : 0;
    
  // If overdue, reduce interval slightly
  if (daysSinceLastReview > result.interval * 1.5) {
    result.interval = Math.max(1, Math.round(result.interval * 0.8));
    result.nextReviewDate = addDays(new Date(), result.interval);
  }
  
  return result;
}

/**
 * Get topics that are due for review
 */
export function getTopicsDueForReview(topics: Topic[], currentDate: Date = new Date()): Topic[] {
  return topics.filter(topic => {
    if (!topic.lastReviewed) return true; // Never reviewed
    
    const daysSinceReview = differenceInDays(currentDate, topic.lastReviewed);
    return daysSinceReview >= topic.reviewInterval;
  });
}

/**
 * Forgetting curve implementation - predicts retention over time
 */
export function calculateRetentionProbability(
  daysSinceLastReview: number,
  easeFactor: number,
  initialStrength: number = 1.0
): number {
  // Ebbinghaus forgetting curve: R(t) = e^(-t/S)
  // Where t is time and S is memory strength
  
  const memoryStrength = initialStrength * easeFactor;
  const retentionProbability = Math.exp(-daysSinceLastReview / memoryStrength);
  
  return Math.max(0, Math.min(1, retentionProbability));
}

/**
 * Optimal review schedule generator using spaced repetition
 */
export function generateOptimalReviewSchedule(
  topics: Topic[],
  studySessions: StudySession[],
  daysAhead: number = 30
): { date: Date; topics: Topic[] }[] {
  const schedule: { date: Date; topics: Topic[] }[] = [];
  const currentDate = new Date();
  
  // Generate schedule for each day
  for (let day = 0; day <= daysAhead; day++) {
    const targetDate = addDays(currentDate, day);
    const topicsForDay: Topic[] = [];
    
    topics.forEach(topic => {
      const result = calculateAdaptiveReview(
        topic,
        studySessions,
        topic.retentionRate || 0.8
      );
      
      // Check if this topic should be reviewed on this day
      if (
        targetDate.toDateString() === result.nextReviewDate.toDateString() ||
        (topic.lastReviewed && 
         differenceInDays(targetDate, topic.lastReviewed) >= topic.reviewInterval)
      ) {
        topicsForDay.push(topic);
      }
    });
    
    if (topicsForDay.length > 0) {
      schedule.push({
        date: targetDate,
        topics: topicsForDay.sort((a, b) => {
          // Sort by mastery level (less mastered topics first)
          return a.masteryLevel - b.masteryLevel;
        })
      });
    }
  }
  
  return schedule;
}

/**
 * Calculate mastery level based on spaced repetition performance
 */
export function calculateMasteryLevel(
  topic: Topic,
  sessions: StudySession[]
): number {
  const topicSessions = sessions.filter(s => s.topicId === topic.id);
  
  if (topicSessions.length === 0) return 0;
  
  // Base mastery on review count, ease factor, and recent performance
  const baseScore = Math.min(1, topic.reviewCount / 10); // Max out at 10 reviews
  const easeScore = (topic.easeFactor - 1.3) / (2.5 - 1.3); // Normalize ease factor
  
  // Recent performance (last 5 sessions)
  const recentSessions = topicSessions
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 5);
    
  const avgRecentPerformance = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => sum + s.effectiveness, 0) / (recentSessions.length * 5)
    : 0;
  
  // Combine factors with weights
  const mastery = (baseScore * 0.4) + (easeScore * 0.3) + (avgRecentPerformance * 0.3);
  
  return Math.max(0, Math.min(1, mastery));
}

/**
 * Intelligent review prioritization
 */
export function prioritizeReviews(
  topics: Topic[],
  sessions: StudySession[],
  maxTopicsPerDay: number = 10
): Topic[] {
  const topicsWithPriority = topics.map(topic => {
    const daysSinceReview = topic.lastReviewed 
      ? differenceInDays(new Date(), topic.lastReviewed)
      : Infinity;
      
    const retentionProbability = calculateRetentionProbability(
      daysSinceReview,
      topic.easeFactor
    );
    
    // Priority factors:
    // 1. Low retention probability (forgetting soon)
    // 2. Low mastery level (needs more practice)
    // 3. High difficulty (harder topics need more attention)
    const priority = 
      (1 - retentionProbability) * 0.4 +
      (1 - topic.masteryLevel) * 0.3 +
      (topic.difficulty / 5) * 0.3;
      
    return {
      topic,
      priority,
      retentionProbability
    };
  });
  
  // Sort by priority (highest first) and return top topics
  return topicsWithPriority
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxTopicsPerDay)
    .map(item => item.topic);
}

/**
 * Update topic after study session
 */
export function updateTopicAfterSession(
  topic: Topic,
  session: StudySession
): Topic {
  const sm2Result = calculateNextReview(
    session.effectiveness,
    topic.easeFactor,
    topic.reviewInterval,
    topic.reviewCount
  );
  
  return {
    ...topic,
    easeFactor: sm2Result.easeFactor,
    reviewInterval: sm2Result.interval,
    reviewCount: sm2Result.reviewCount,
    lastReviewed: session.startTime,
    masteryLevel: calculateMasteryLevel(topic, [session])
  };
}