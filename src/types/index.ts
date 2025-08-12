export interface Subject {
  id: string;
  name: string;
  deadline: Date;
  priority: 1 | 2 | 3; // 1 = high, 2 = medium, 3 = low
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = very easy, 5 = very hard
  estimatedHours: number;
  completedHours: number;
  topics: Topic[];
  studyTechniques: StudyTechnique[];
  retentionRate: number; // 0-1, how well user retains this subject
  lastReviewed?: Date;
  createdAt: Date;
  averageSessionEffectiveness?: number; // 1-5 rating
  cognitiveLoad: number; // 1-5, mental effort required
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  completed: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number; // in minutes
  actualTime?: number;
  masteryLevel: number; // 0-1
  lastReviewed?: Date;
  reviewInterval: number; // days until next review
  reviewCount: number;
  easeFactor: number; // SM-2 algorithm ease factor
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  effectiveness: 1 | 2 | 3 | 4 | 5; // self-reported
  technique: StudyTechnique;
  notes: string;
  completed: boolean;
  focusScore?: number; // 0-1, calculated from behavior
  interruptions: number;
  environmentScore?: number; // 1-5
}

export interface UserPreferences {
  peakHours: number[]; // Hours when most productive (0-23)
  sessionLength: number; // Preferred study session length in minutes
  breakLength: number; // Preferred break length in minutes
  studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  difficultyPreference: 'morning' | 'afternoon' | 'evening'; // When to tackle hard subjects
  notificationsEnabled: boolean;
  darkMode: boolean;
  weekdayStudyHours: TimeBlock[];
  weekendStudyHours: TimeBlock[];
  maxDailyHours: number;
  minBreakBetweenSessions: number; // minutes
}

export interface TimeBlock {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  available: boolean;
}

export type StudyTechnique = 
  | 'active-recall'
  | 'spaced-repetition' 
  | 'pomodoro'
  | 'feynman'
  | 'mind-mapping'
  | 'flashcards'
  | 'practice-problems'
  | 'summarization'
  | 'teaching-others'
  | 'interleaving';

export interface StudyPlan {
  id: string;
  userId: string;
  generatedAt: Date;
  validUntil: Date;
  schedule: ScheduledSession[];
  totalEstimatedHours: number;
  confidence: number; // 0-1, AI confidence in plan success
  adaptiveFactors: AdaptiveFactors;
}

export interface ScheduledSession {
  id: string;
  subjectId: string;
  topicIds: string[];
  startTime: Date;
  duration: number; // minutes
  technique: StudyTechnique;
  difficulty: number; // 1-5
  priority: number; // 1-3
  cognitiveLoad: number; // 1-5
  estimatedEffectiveness: number; // 0-1
  prerequisites: string[]; // topic IDs that should be completed first
}

export interface AdaptiveFactors {
  userProductivityPattern: ProductivityPattern;
  retentionCurve: RetentionData[];
  difficultyProgression: DifficultyProgression;
  motivationFactors: MotivationFactors;
}

export interface ProductivityPattern {
  hourlyProductivity: Record<number, number>; // hour -> productivity score 0-1
  dayOfWeekProductivity: Record<string, number>;
  sessionLengthOptimal: number; // minutes
  breakLengthOptimal: number; // minutes
  focusDeclineRate: number; // how quickly focus drops during session
}

export interface RetentionData {
  subjectId: string;
  topicId: string;
  initialLearning: Date;
  retentionRate: number; // 0-1
  forgettingCurve: ForgettingCurvePoint[];
}

export interface ForgettingCurvePoint {
  daysAfterLearning: number;
  retentionPercentage: number;
}

export interface DifficultyProgression {
  currentLevel: number; // 1-5
  masteryThreshold: number; // 0-1
  progressionRate: number; // how quickly to increase difficulty
  adaptationSpeed: number; // how quickly to adjust based on performance
}

export interface MotivationFactors {
  goalProximity: number; // 0-1, how close to deadline
  progressMomentum: number; // 0-1, recent progress trend
  achievementHistory: AchievementRecord[];
  streakCount: number;
  lastMotivationScore: number; // 1-5
}

export interface AchievementRecord {
  date: Date;
  type: 'session_completed' | 'goal_reached' | 'streak_milestone' | 'mastery_achieved';
  subjectId?: string;
  description: string;
  motivationImpact: number; // -1 to 1
}

export interface AIInsights {
  recommendedSchedule: StudyPlan;
  studyTechniqueSuggestions: StudyTechniqueSuggestion[];
  retentionPredictions: Map<string, number>;
  optimalReviewTimes: Map<string, Date>;
  performanceAnalysis: PerformanceMetrics;
  adaptiveRecommendations: AdaptiveRecommendation[];
  riskAssessment: RiskAssessment;
}

export interface StudyTechniqueSuggestion {
  technique: StudyTechnique;
  subjectIds: string[];
  reasoning: string;
  expectedImprovement: number; // 0-1
  confidenceLevel: number; // 0-1
}

export interface PerformanceMetrics {
  overallProductivity: number; // 0-1
  subjectMastery: Record<string, number>; // subject ID -> mastery level 0-1
  studyVelocity: number; // hours per day average
  retentionRate: number; // 0-1
  goalAchievementRate: number; // 0-1
  sessionEffectiveness: number; // 1-5 average
  focusScore: number; // 0-1
  streakDays: number;
  totalStudyHours: number;
  sessionsCompleted: number;
}

export interface AdaptiveRecommendation {
  type: 'schedule_adjustment' | 'technique_change' | 'break_modification' | 'goal_revision';
  title: string;
  description: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  implementBy?: Date;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
}

export interface RiskFactor {
  type: 'deadline_pressure' | 'burnout_risk' | 'topic_difficulty' | 'time_shortage';
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  affectedSubjects: string[];
  probability: number; // 0-1
}

export interface MitigationStrategy {
  riskType: string;
  strategy: string;
  expectedReduction: number; // 0-1
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface InterviewQuestion {
  id: string;
  type: 'technical' | 'behavioral' | 'situational' | 'coding';
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  question: string;
  expectedAnswer?: string;
  hints: string[];
  followUpQuestions: string[];
  timeLimit?: number; // seconds
  skills: string[];
  industry?: string;
  role?: string;
}

export interface InterviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  overallScore?: number; // 0-1
  feedback: InterviewFeedback;
  sessionType: 'practice' | 'mock' | 'targeted';
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  timeSpent: number; // seconds
  confidence: 1 | 2 | 3 | 4 | 5;
  score?: number; // 0-1, AI-generated
  feedback?: string;
}

export interface InterviewFeedback {
  strengths: string[];
  improvements: string[];
  technicalScore: number; // 0-1
  communicationScore: number; // 0-1
  overallReadiness: number; // 0-1
  nextSteps: string[];
}

export interface LearningPathway {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  prerequisites: string[];
  milestones: Milestone[];
  estimatedDuration: number; // days
  difficultyProgression: number[];
  adaptiveAdjustments: PathwayAdjustment[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  topics: string[];
  targetMasteryLevel: number; // 0-1
  estimatedHours: number;
  completed: boolean;
  completedAt?: Date;
}

export interface PathwayAdjustment {
  reason: string;
  adjustment: 'skip_topic' | 'add_review' | 'increase_difficulty' | 'decrease_pace';
  implementedAt: Date;
  impact: string;
}