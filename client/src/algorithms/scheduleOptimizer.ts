import { 
  Subject, 
  StudySession, 
  UserPreferences, 
  ScheduledSession, 
  StudyPlan,
  TimeBlock,
  StudyTechnique,
  ProductivityPattern
} from '../types';
import { 
  addDays, 
  addMinutes, 
  differenceInDays, 
  format, 
  isAfter, 
  isBefore, 
  startOfDay,
  setHours,
  setMinutes
} from 'date-fns';
import { calculateNextReview, getTopicsDueForReview } from './spacedRepetition';

/**
 * Advanced AI-powered schedule optimization engine
 * Uses multiple algorithms and heuristics to create optimal study schedules
 */

interface SchedulingConstraints {
  availableTimeBlocks: TimeBlock[];
  maxDailyHours: number;
  minBreakBetweenSessions: number;
  preferredSessionLength: number;
  deadlines: Map<string, Date>;
  cognitiveLoadLimits: CognitiveLoadConstraint[];
}

interface CognitiveLoadConstraint {
  timeOfDay: string; // "morning" | "afternoon" | "evening"
  maxCognitiveLoad: number; // 1-5
  optimalDifficulty: number; // 1-5
}

interface OptimizationWeight {
  deadlinePressure: number;
  cognitiveLoadBalance: number;
  spacedRepetition: number;
  userPreferences: number;
  prerequisites: number;
  varietyBalance: number;
}

/**
 * Main schedule optimization function
 */
export function generateOptimalSchedule(
  subjects: Subject[],
  sessions: StudySession[],
  preferences: UserPreferences,
  productivityPattern: ProductivityPattern,
  daysAhead: number = 14
): StudyPlan {
  const constraints = buildSchedulingConstraints(subjects, preferences);
  const weights: OptimizationWeight = {
    deadlinePressure: 0.25,
    cognitiveLoadBalance: 0.2,
    spacedRepetition: 0.2,
    userPreferences: 0.15,
    prerequisites: 0.1,
    varietyBalance: 0.1
  };
  
  // Generate study tasks from subjects
  const studyTasks = generateStudyTasks(subjects, sessions);
  
  // Optimize schedule using multi-objective optimization
  const optimizedSessions = optimizeScheduleMultiObjective(
    studyTasks,
    constraints,
    weights,
    productivityPattern,
    daysAhead
  );
  
  // Calculate confidence score
  const confidence = calculateScheduleConfidence(optimizedSessions, subjects, constraints);
  
  return {
    id: generateId(),
    userId: 'current-user', // This would come from auth
    generatedAt: new Date(),
    validUntil: addDays(new Date(), daysAhead),
    schedule: optimizedSessions,
    totalEstimatedHours: optimizedSessions.reduce((sum, s) => sum + s.duration, 0) / 60,
    confidence,
    adaptiveFactors: {
      userProductivityPattern: productivityPattern,
      retentionCurve: [], // Would be populated from actual data
      difficultyProgression: {
        currentLevel: calculateAverageDifficulty(subjects),
        masteryThreshold: 0.8,
        progressionRate: 0.1,
        adaptationSpeed: 0.2
      },
      motivationFactors: {
        goalProximity: calculateGoalProximity(subjects),
        progressMomentum: calculateProgressMomentum(sessions),
        achievementHistory: [],
        streakCount: calculateStreakCount(sessions),
        lastMotivationScore: 4
      }
    }
  };
}

/**
 * Multi-objective optimization using weighted scoring
 */
function optimizeScheduleMultiObjective(
  studyTasks: StudyTask[],
  constraints: SchedulingConstraints,
  weights: OptimizationWeight,
  productivityPattern: ProductivityPattern,
  daysAhead: number
): ScheduledSession[] {
  const scheduledSessions: ScheduledSession[] = [];
  const currentDate = new Date();
  
  // Sort tasks by priority score
  const prioritizedTasks = prioritizeStudyTasks(studyTasks, weights);
  
  // Schedule tasks day by day
  for (let day = 0; day < daysAhead; day++) {
    const targetDate = addDays(currentDate, day);
    const dayOfWeek = format(targetDate, 'EEEE').toLowerCase();
    
    // Get available time blocks for this day
    const availableBlocks = getAvailableTimeBlocks(targetDate, constraints, dayOfWeek);
    
    // Schedule sessions for this day
    const daySchedule = scheduleDayOptimally(
      prioritizedTasks,
      availableBlocks,
      targetDate,
      productivityPattern,
      constraints
    );
    
    scheduledSessions.push(...daySchedule);
    
    // Remove completed tasks
    daySchedule.forEach(session => {
      const taskIndex = prioritizedTasks.findIndex(t => 
        t.subjectId === session.subjectId && 
        t.topicIds.some(id => session.topicIds.includes(id))
      );
      if (taskIndex !== -1) {
        const task = prioritizedTasks[taskIndex];
        task.remainingMinutes -= session.duration;
        if (task.remainingMinutes <= 0) {
          prioritizedTasks.splice(taskIndex, 1);
        }
      }
    });
  }
  
  return scheduledSessions;
}

/**
 * Optimal day scheduling using cognitive load balancing
 */
function scheduleDayOptimally(
  availableTasks: StudyTask[],
  timeBlocks: TimeBlock[],
  targetDate: Date,
  productivityPattern: ProductivityPattern,
  constraints: SchedulingConstraints
): ScheduledSession[] {
  const daySchedule: ScheduledSession[] = [];
  let remainingTasks = [...availableTasks];
  
  for (const block of timeBlocks) {
    const blockStart = parseTimeToDate(targetDate, block.start);
    const blockEnd = parseTimeToDate(targetDate, block.end);
    const blockDuration = (blockEnd.getTime() - blockStart.getTime()) / (1000 * 60);
    
    let currentTime = blockStart;
    let remainingBlockTime = blockDuration;
    
    while (remainingBlockTime >= 30 && remainingTasks.length > 0) { // Minimum 30 min session
      const hour = currentTime.getHours();
      const optimalTask = selectOptimalTask(
        remainingTasks,
        hour,
        remainingBlockTime,
        productivityPattern,
        constraints
      );
      
      if (!optimalTask) break;
      
      const sessionDuration = Math.min(
        optimalTask.optimalSessionLength,
        remainingBlockTime,
        constraints.preferredSessionLength
      );
      
      const session: ScheduledSession = {
        id: generateId(),
        subjectId: optimalTask.subjectId,
        topicIds: optimalTask.topicIds,
        startTime: new Date(currentTime),
        duration: sessionDuration,
        technique: optimalTask.recommendedTechnique,
        difficulty: optimalTask.difficulty,
        priority: optimalTask.priority,
        cognitiveLoad: optimalTask.cognitiveLoad,
        estimatedEffectiveness: calculateEstimatedEffectiveness(
          optimalTask,
          hour,
          productivityPattern
        ),
        prerequisites: optimalTask.prerequisites
      };
      
      daySchedule.push(session);
      
      // Update task
      optimalTask.remainingMinutes -= sessionDuration;
      if (optimalTask.remainingMinutes <= 0) {
        remainingTasks = remainingTasks.filter(t => t !== optimalTask);
      }
      
      // Move to next time slot
      currentTime = addMinutes(currentTime, sessionDuration + constraints.minBreakBetweenSessions);
      remainingBlockTime -= (sessionDuration + constraints.minBreakBetweenSessions);
    }
  }
  
  return daySchedule;
}

/**
 * Select optimal task for given time and conditions
 */
function selectOptimalTask(
  tasks: StudyTask[],
  hour: number,
  availableTime: number,
  productivityPattern: ProductivityPattern,
  constraints: SchedulingConstraints
): StudyTask | null {
  const hourlyProductivity = productivityPattern.hourlyProductivity[hour] || 0.5;
  
  // Score each task for this time slot
  const scoredTasks = tasks.map(task => {
    let score = 0;
    
    // Productivity alignment
    if (task.difficulty >= 4 && hourlyProductivity > 0.7) {
      score += 20; // High difficulty during productive hours
    } else if (task.difficulty <= 2 && hourlyProductivity < 0.5) {
      score += 15; // Easy tasks during low productivity
    }
    
    // Urgency (deadline pressure)
    const daysUntilDeadline = task.daysUntilDeadline;
    if (daysUntilDeadline <= 3) score += 30;
    else if (daysUntilDeadline <= 7) score += 15;
    
    // Cognitive load balance
    const cognitiveConstraint = getCognitiveConstraintForHour(hour, constraints);
    if (task.cognitiveLoad <= cognitiveConstraint.maxCognitiveLoad) {
      score += 10;
    } else {
      score -= 15; // Penalty for exceeding cognitive load
    }
    
    // Time fit
    if (task.optimalSessionLength <= availableTime) {
      score += 10;
    } else {
      score -= 5;
    }
    
    // Spaced repetition priority
    if (task.isReviewDue) score += 25;
    
    // Priority bonus
    score += (4 - task.priority) * 5; // Higher priority = lower number
    
    return { task, score };
  });
  
  // Return highest scoring task that fits
  const bestTask = scoredTasks
    .filter(({ task }) => task.optimalSessionLength <= availableTime)
    .sort((a, b) => b.score - a.score)[0];
    
  return bestTask?.task || null;
}

/**
 * Generate study tasks from subjects
 */
function generateStudyTasks(subjects: Subject[], sessions: StudySession[]): StudyTask[] {
  const tasks: StudyTask[] = [];
  
  subjects.forEach(subject => {
    const remainingHours = subject.estimatedHours - subject.completedHours;
    if (remainingHours <= 0) return;
    
    const daysUntilDeadline = differenceInDays(subject.deadline, new Date());
    const isUrgent = daysUntilDeadline <= 7;
    
    // Create tasks for incomplete topics
    const incompleteTopics = subject.topics.filter(t => !t.completed);
    const topicsNeedingReview = getTopicsDueForReview(subject.topics);
    
    // Regular study tasks
    if (incompleteTopics.length > 0) {
      const sessionCount = Math.ceil(remainingHours * 60 / 45); // 45 min average sessions
      const topicsPerSession = Math.ceil(incompleteTopics.length / sessionCount);
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionTopics = incompleteTopics.slice(
          i * topicsPerSession, 
          (i + 1) * topicsPerSession
        );
        
        tasks.push({
          id: generateId(),
          subjectId: subject.id,
          topicIds: sessionTopics.map(t => t.id),
          difficulty: subject.difficulty,
          priority: subject.priority,
          cognitiveLoad: subject.cognitiveLoad,
          remainingMinutes: 45,
          optimalSessionLength: getOptimalSessionLength(subject, sessionTopics),
          daysUntilDeadline,
          isReviewDue: false,
          recommendedTechnique: selectBestTechnique(subject, sessionTopics),
          prerequisites: getPrerequisites(sessionTopics)
        });
      }
    }
    
    // Review tasks
    topicsNeedingReview.forEach(topic => {
      tasks.push({
        id: generateId(),
        subjectId: subject.id,
        topicIds: [topic.id],
        difficulty: topic.difficulty,
        priority: isUrgent ? 1 : subject.priority,
        cognitiveLoad: Math.max(1, subject.cognitiveLoad - 1), // Review is easier
        remainingMinutes: 20, // Reviews are shorter
        optimalSessionLength: 20,
        daysUntilDeadline,
        isReviewDue: true,
        recommendedTechnique: 'active-recall',
        prerequisites: []
      });
    });
  });
  
  return tasks;
}

/**
 * Helper interfaces
 */
interface StudyTask {
  id: string;
  subjectId: string;
  topicIds: string[];
  difficulty: number;
  priority: number;
  cognitiveLoad: number;
  remainingMinutes: number;
  optimalSessionLength: number;
  daysUntilDeadline: number;
  isReviewDue: boolean;
  recommendedTechnique: StudyTechnique;
  prerequisites: string[];
}

/**
 * Helper functions
 */
function buildSchedulingConstraints(
  subjects: Subject[], 
  preferences: UserPreferences
): SchedulingConstraints {
  const deadlines = new Map<string, Date>();
  subjects.forEach(s => deadlines.set(s.id, s.deadline));
  
  return {
    availableTimeBlocks: [
      ...preferences.weekdayStudyHours,
      ...preferences.weekendStudyHours
    ],
    maxDailyHours: preferences.maxDailyHours,
    minBreakBetweenSessions: preferences.minBreakBetweenSessions,
    preferredSessionLength: preferences.sessionLength,
    deadlines,
    cognitiveLoadLimits: [
      { timeOfDay: 'morning', maxCognitiveLoad: 5, optimalDifficulty: 4 },
      { timeOfDay: 'afternoon', maxCognitiveLoad: 4, optimalDifficulty: 3 },
      { timeOfDay: 'evening', maxCognitiveLoad: 3, optimalDifficulty: 2 }
    ]
  };
}

function prioritizeStudyTasks(tasks: StudyTask[], weights: OptimizationWeight): StudyTask[] {
  return tasks.sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    
    // Deadline pressure
    scoreA += (30 - a.daysUntilDeadline) * weights.deadlinePressure;
    scoreB += (30 - b.daysUntilDeadline) * weights.deadlinePressure;
    
    // Priority
    scoreA += (4 - a.priority) * weights.userPreferences * 10;
    scoreB += (4 - b.priority) * weights.userPreferences * 10;
    
    // Review urgency
    if (a.isReviewDue) scoreA += weights.spacedRepetition * 20;
    if (b.isReviewDue) scoreB += weights.spacedRepetition * 20;
    
    return scoreB - scoreA;
  });
}

function getAvailableTimeBlocks(
  date: Date, 
  constraints: SchedulingConstraints, 
  dayOfWeek: string
): TimeBlock[] {
  // This would be more complex in real implementation
  // considering weekday vs weekend schedules
  return constraints.availableTimeBlocks.filter(block => block.available);
}

function parseTimeToDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  return setMinutes(setHours(startOfDay(date), hours), minutes);
}

function getCognitiveConstraintForHour(
  hour: number, 
  constraints: SchedulingConstraints
): CognitiveLoadConstraint {
  if (hour < 12) return constraints.cognitiveLoadLimits[0]; // morning
  if (hour < 18) return constraints.cognitiveLoadLimits[1]; // afternoon
  return constraints.cognitiveLoadLimits[2]; // evening
}

function calculateEstimatedEffectiveness(
  task: StudyTask,
  hour: number,
  productivityPattern: ProductivityPattern
): number {
  const hourlyProductivity = productivityPattern.hourlyProductivity[hour] || 0.5;
  const difficultyAlignment = task.difficulty <= 3 ? 0.8 : hourlyProductivity;
  return Math.min(1, hourlyProductivity * difficultyAlignment);
}

function getOptimalSessionLength(subject: Subject, topics: any[]): number {
  // Base length on subject difficulty and topic count
  const baseDuration = 45;
  const difficultyMultiplier = subject.difficulty / 3;
  const topicMultiplier = Math.min(2, topics.length / 3);
  
  return Math.round(baseDuration * difficultyMultiplier * topicMultiplier);
}

function selectBestTechnique(subject: Subject, topics: any[]): StudyTechnique {
  // Select technique based on subject characteristics
  if (subject.difficulty >= 4) return 'feynman';
  if (topics.length > 1) return 'interleaving';
  if (subject.name.toLowerCase().includes('math')) return 'practice-problems';
  return 'active-recall';
}

function getPrerequisites(topics: any[]): string[] {
  // This would analyze topic dependencies
  return [];
}

function calculateScheduleConfidence(
  sessions: ScheduledSession[],
  subjects: Subject[],
  constraints: SchedulingConstraints
): number {
  // Calculate confidence based on various factors
  let confidence = 0.8; // Base confidence
  
  // Adjust for time constraints
  const totalPlannedHours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;
  const totalAvailableHours = constraints.maxDailyHours * 14; // Assuming 14 days
  
  if (totalPlannedHours > totalAvailableHours * 0.9) {
    confidence -= 0.2; // Overloaded schedule
  }
  
  return Math.max(0.3, Math.min(1, confidence));
}

function calculateAverageDifficulty(subjects: Subject[]): number {
  return subjects.reduce((sum, s) => sum + s.difficulty, 0) / subjects.length;
}

function calculateGoalProximity(subjects: Subject[]): number {
  const avgDaysToDeadline = subjects.reduce((sum, s) => 
    sum + differenceInDays(s.deadline, new Date()), 0) / subjects.length;
  return Math.max(0, Math.min(1, (30 - avgDaysToDeadline) / 30));
}

function calculateProgressMomentum(sessions: StudySession[]): number {
  const recentSessions = sessions
    .filter(s => differenceInDays(new Date(), s.startTime) <= 7)
    .length;
  return Math.min(1, recentSessions / 10); // Normalize to 0-1
}

function calculateStreakCount(sessions: StudySession[]): number {
  // Simple streak calculation - would be more sophisticated in practice
  const today = startOfDay(new Date());
  let streak = 0;
  let checkDate = today;
  
  while (true) {
    const hasSessionOnDate = sessions.some(s => 
      startOfDay(s.startTime).getTime() === checkDate.getTime()
    );
    
    if (!hasSessionOnDate) break;
    
    streak++;
    checkDate = addDays(checkDate, -1);
  }
  
  return streak;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}