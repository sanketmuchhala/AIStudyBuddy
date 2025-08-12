import {
  InterviewQuestion,
  InterviewSession,
  InterviewAnswer,
  InterviewFeedback,
  StudySession
} from '../types';

/**
 * Advanced AI Interview Coaching System
 * Provides intelligent interview practice with adaptive difficulty and personalized feedback
 */

export class AdvancedInterviewCoach {
  
  private static technicalQuestionBank: InterviewQuestion[] = [
    // JavaScript/Web Development
    {
      id: 'js-1',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 2,
      question: 'Explain the difference between let, const, and var in JavaScript.',
      expectedAnswer: 'let and const are block-scoped, var is function-scoped. const cannot be reassigned.',
      hints: ['Think about scoping rules', 'Consider reassignment behavior'],
      followUpQuestions: ['What is hoisting?', 'Explain the temporal dead zone'],
      timeLimit: 180,
      skills: ['JavaScript fundamentals', 'Variable declarations'],
      industry: 'Software Engineering',
      role: 'Frontend Developer'
    },
    {
      id: 'js-2',
      type: 'technical', 
      category: 'JavaScript',
      difficulty: 3,
      question: 'What is a closure in JavaScript and why would you use one?',
      expectedAnswer: 'A closure gives access to an outer functions scope from inner function. Used for data privacy, callbacks, modules.',
      hints: ['Think about function scope', 'Consider data encapsulation'],
      followUpQuestions: ['Give an example of closure usage', 'What are the memory implications?'],
      timeLimit: 240,
      skills: ['JavaScript advanced concepts', 'Functional programming'],
      industry: 'Software Engineering',
      role: 'Full-stack Developer'
    },
    {
      id: 'js-3',
      type: 'technical',
      category: 'JavaScript',
      difficulty: 4,
      question: 'Explain the event loop in JavaScript and how it handles asynchronous operations.',
      expectedAnswer: 'Event loop manages call stack, callback queue, and microtask queue. Processes callbacks after stack is empty.',
      hints: ['Think about call stack', 'Consider callback queue vs microtask queue'],
      followUpQuestions: ['What are microtasks?', 'How do Promises fit into this?'],
      timeLimit: 300,
      skills: ['JavaScript internals', 'Async programming'],
      industry: 'Software Engineering', 
      role: 'Senior Developer'
    },
    
    // Algorithms & Data Structures
    {
      id: 'algo-1',
      type: 'coding',
      category: 'Arrays',
      difficulty: 2,
      question: 'Given an array of integers, return indices of two numbers that add up to a specific target.',
      expectedAnswer: 'Use hash map to store complements. Time: O(n), Space: O(n)',
      hints: ['Use a hash map', 'Store complements'],
      followUpQuestions: ['What if array is sorted?', 'Can you do it in one pass?'],
      timeLimit: 900,
      skills: ['Hash tables', 'Array manipulation'],
      industry: 'Software Engineering',
      role: 'Software Engineer'
    },
    {
      id: 'algo-2',
      type: 'coding',
      category: 'Linked Lists',
      difficulty: 3,
      question: 'Reverse a linked list iteratively and recursively.',
      expectedAnswer: 'Iteratively: use three pointers. Recursively: reverse rest then point back.',
      hints: ['Think about pointer manipulation', 'Consider base case for recursion'],
      followUpQuestions: ['What about reversing in groups of k?', 'How to detect cycles?'],
      timeLimit: 1200,
      skills: ['Linked lists', 'Recursion', 'Pointers'],
      industry: 'Software Engineering',
      role: 'Software Engineer'
    },
    {
      id: 'algo-3',
      type: 'coding',
      category: 'Dynamic Programming',
      difficulty: 5,
      question: 'Find the longest common subsequence between two strings.',
      expectedAnswer: 'Use 2D DP table. dp[i][j] = max(dp[i-1][j], dp[i][j-1]) or dp[i-1][j-1] + 1',
      hints: ['Think about subproblems', 'Use dynamic programming'],
      followUpQuestions: ['Can you optimize space?', 'How to reconstruct the sequence?'],
      timeLimit: 1800,
      skills: ['Dynamic programming', 'String algorithms'],
      industry: 'Software Engineering',
      role: 'Senior Software Engineer'
    },
    
    // System Design
    {
      id: 'sys-1',
      type: 'technical',
      category: 'System Design',
      difficulty: 4,
      question: 'Design a URL shortener service like bit.ly. What are the key components?',
      expectedAnswer: 'Database for mappings, encoding algorithm, caching, load balancing, analytics.',
      hints: ['Think about database schema', 'Consider scalability'],
      followUpQuestions: ['How to handle custom URLs?', 'What about analytics?'],
      timeLimit: 2700,
      skills: ['System design', 'Scalability', 'Databases'],
      industry: 'Software Engineering',
      role: 'Senior/Staff Engineer'
    }
  ];
  
  private static behavioralQuestionBank: InterviewQuestion[] = [
    {
      id: 'behav-1',
      type: 'behavioral',
      category: 'Leadership',
      difficulty: 2,
      question: 'Tell me about a time when you had to lead a team through a difficult project.',
      hints: ['Use STAR method', 'Focus on your leadership actions'],
      followUpQuestions: ['How did you handle team conflicts?', 'What would you do differently?'],
      timeLimit: 180,
      skills: ['Leadership', 'Project management'],
      industry: 'General'
    },
    {
      id: 'behav-2',
      type: 'behavioral',
      category: 'Problem Solving',
      difficulty: 3,
      question: 'Describe a time when you solved a problem in an innovative way.',
      hints: ['Explain your thought process', 'Highlight creativity'],
      followUpQuestions: ['How did you validate your solution?', 'What was the impact?'],
      timeLimit: 200,
      skills: ['Problem solving', 'Innovation'],
      industry: 'General'
    },
    {
      id: 'behav-3',
      type: 'behavioral',
      category: 'Failure/Learning',
      difficulty: 2,
      question: 'Tell me about a time you failed and what you learned from it.',
      hints: ['Be honest about failure', 'Focus on learning and growth'],
      followUpQuestions: ['How did this change your approach?', 'Any regrets?'],
      timeLimit: 180,
      skills: ['Self-awareness', 'Growth mindset'],
      industry: 'General'
    }
  ];
  
  /**
   * Generate personalized interview questions based on user's progress and industry
   */
  static generatePersonalizedQuestions(
    userHistory: InterviewSession[],
    targetRole: string,
    targetIndustry: string,
    difficulty: number = 3
  ): InterviewQuestion[] {
    // Analyze user's weak areas from previous sessions
    const weakAreas = this.analyzeWeakAreas(userHistory);
    const questionPool = [...this.technicalQuestionBank, ...this.behavioralQuestionBank];
    
    // Filter questions by role, industry, and difficulty
    let relevantQuestions = questionPool.filter(q => {
      const roleMatch = !q.role || q.role.toLowerCase().includes(targetRole.toLowerCase());
      const industryMatch = !q.industry || q.industry === 'General' || 
                           q.industry.toLowerCase().includes(targetIndustry.toLowerCase());
      const difficultyRange = Math.abs(q.difficulty - difficulty) <= 1;
      
      return roleMatch && industryMatch && difficultyRange;
    });
    
    // Prioritize questions in weak areas
    relevantQuestions = relevantQuestions.sort((a, b) => {
      const aWeakness = weakAreas.has(a.category) ? weakAreas.get(a.category)! : 0;
      const bWeakness = weakAreas.has(b.category) ? weakAreas.get(b.category)! : 0;
      return bWeakness - aWeakness; // Higher weakness score = higher priority
    });
    
    // Return top 10 questions with variety
    return this.diversifyQuestions(relevantQuestions).slice(0, 10);
  }
  
  /**
   * Provide AI-powered feedback on interview answers
   */
  static analyzeAnswer(
    question: InterviewQuestion,
    answer: InterviewAnswer,
    timeSpent: number
  ): InterviewFeedback {
    const feedback: InterviewFeedback = {
      strengths: [],
      improvements: [],
      technicalScore: 0,
      communicationScore: 0,
      overallReadiness: 0,
      nextSteps: []
    };
    
    // Analyze answer completeness
    const answerLength = answer.answer.trim().length;
    const expectedLength = question.expectedAnswer?.length || 200;
    
    if (answerLength >= expectedLength * 0.8) {
      feedback.strengths.push('Comprehensive answer with good detail');
      feedback.technicalScore += 0.3;
    } else if (answerLength < expectedLength * 0.3) {
      feedback.improvements.push('Answer lacks sufficient detail and explanation');
    }
    
    // Analyze timing
    const timeLimit = question.timeLimit || 300;
    const timeRatio = timeSpent / timeLimit;
    
    if (timeRatio <= 0.8) {
      feedback.strengths.push('Answered within appropriate time frame');
      feedback.communicationScore += 0.2;
    } else if (timeRatio > 1.2) {
      feedback.improvements.push('Consider being more concise in your explanations');
    }
    
    // Technical content analysis (simplified - would use NLP in production)
    if (question.type === 'technical' || question.type === 'coding') {
      const keyTerms = this.extractKeyTerms(question);
      const mentionedTerms = keyTerms.filter(term => 
        answer.answer.toLowerCase().includes(term.toLowerCase())
      );
      
      const termCoverage = mentionedTerms.length / keyTerms.length;
      feedback.technicalScore += termCoverage * 0.5;
      
      if (termCoverage >= 0.7) {
        feedback.strengths.push('Good coverage of key technical concepts');
      } else {
        feedback.improvements.push(`Consider mentioning: ${keyTerms.filter(t => 
          !mentionedTerms.includes(t)).join(', ')}`);
      }
    }
    
    // Communication analysis
    const sentences = answer.answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = answer.answer.length / sentences.length;
    
    if (avgSentenceLength > 15 && avgSentenceLength < 25) {
      feedback.communicationScore += 0.3;
      feedback.strengths.push('Clear and well-structured communication');
    } else {
      feedback.improvements.push('Work on sentence structure and clarity');
    }
    
    // STAR method check for behavioral questions
    if (question.type === 'behavioral') {
      const starElements = ['situation', 'task', 'action', 'result'];
      const starScore = starElements.filter(element =>
        answer.answer.toLowerCase().includes(element) ||
        this.detectSTARContent(answer.answer, element)
      ).length;
      
      feedback.communicationScore += (starScore / 4) * 0.5;
      
      if (starScore >= 3) {
        feedback.strengths.push('Good use of STAR method structure');
      } else {
        feedback.improvements.push('Structure your answer using STAR method (Situation, Task, Action, Result)');
      }
    }
    
    // Calculate overall scores
    feedback.technicalScore = Math.min(1, Math.max(0, feedback.technicalScore));
    feedback.communicationScore = Math.min(1, Math.max(0, feedback.communicationScore));
    feedback.overallReadiness = (feedback.technicalScore + feedback.communicationScore) / 2;
    
    // Generate next steps
    if (feedback.overallReadiness >= 0.8) {
      feedback.nextSteps.push('You\'re well-prepared! Focus on practicing under pressure');
    } else if (feedback.overallReadiness >= 0.6) {
      feedback.nextSteps.push('Good foundation. Practice more questions in weak areas');
    } else {
      feedback.nextSteps.push('Focus on fundamentals and structured answering techniques');
    }
    
    if (question.difficulty >= 4 && feedback.technicalScore < 0.6) {
      feedback.nextSteps.push('Review advanced concepts in ' + question.category);
    }
    
    return feedback;
  }
  
  /**
   * Adaptive difficulty adjustment based on performance
   */
  static adjustDifficulty(
    currentDifficulty: number,
    recentPerformance: number[], // Array of recent scores 0-1
    targetSuccessRate: number = 0.7
  ): number {
    if (recentPerformance.length < 3) return currentDifficulty;
    
    const avgPerformance = recentPerformance.reduce((sum, p) => sum + p, 0) / recentPerformance.length;
    const trend = this.calculateTrend(recentPerformance);
    
    let newDifficulty = currentDifficulty;
    
    if (avgPerformance > targetSuccessRate + 0.1 && trend > 0) {
      // Performing well and improving - increase difficulty
      newDifficulty = Math.min(5, currentDifficulty + 0.5);
    } else if (avgPerformance < targetSuccessRate - 0.1 && trend < 0) {
      // Performing poorly and declining - decrease difficulty
      newDifficulty = Math.max(1, currentDifficulty - 0.5);
    }
    
    return Math.round(newDifficulty * 2) / 2; // Round to nearest 0.5
  }
  
  /**
   * Generate mock interview session
   */
  static generateMockInterview(
    duration: number, // in minutes
    focusAreas: string[],
    difficulty: number,
    userHistory: InterviewSession[]
  ): InterviewQuestion[] {
    const questionsPerMinute = 0.15; // Approximately 6-7 minutes per question
    const targetQuestionCount = Math.floor(duration * questionsPerMinute);
    
    const personalizedQuestions = this.generatePersonalizedQuestions(
      userHistory,
      'Software Engineer', // Would be parameterized
      'Software Engineering',
      difficulty
    );
    
    // Filter by focus areas if specified
    let filteredQuestions = personalizedQuestions;
    if (focusAreas.length > 0) {
      filteredQuestions = personalizedQuestions.filter(q =>
        focusAreas.some(area => 
          q.category.toLowerCase().includes(area.toLowerCase()) ||
          q.skills.some(skill => skill.toLowerCase().includes(area.toLowerCase()))
        )
      );
    }
    
    // Ensure variety in question types
    const result: InterviewQuestion[] = [];
    const typeDistribution = {
      'technical': Math.floor(targetQuestionCount * 0.6),
      'behavioral': Math.floor(targetQuestionCount * 0.3), 
      'coding': Math.floor(targetQuestionCount * 0.1)
    };
    
    Object.entries(typeDistribution).forEach(([type, count]) => {
      const typeQuestions = filteredQuestions.filter(q => q.type === type);
      result.push(...typeQuestions.slice(0, count));
    });
    
    return this.shuffleArray(result).slice(0, targetQuestionCount);
  }
  
  /**
   * Track interview readiness score
   */
  static calculateReadinessScore(
    sessions: InterviewSession[],
    targetRole: string
  ): {
    overallScore: number;
    categoryBreakdown: Record<string, number>;
    recommendations: string[];
  } {
    if (sessions.length === 0) {
      return {
        overallScore: 0,
        categoryBreakdown: {},
        recommendations: ['Start practicing with basic interview questions']
      };
    }
    
    // Analyze performance by category
    const categoryPerformance = new Map<string, number[]>();
    
    sessions.forEach(session => {
      session.questions.forEach((question, index) => {
        const answer = session.answers[index];
        if (answer?.score) {
          if (!categoryPerformance.has(question.category)) {
            categoryPerformance.set(question.category, []);
          }
          categoryPerformance.get(question.category)!.push(answer.score);
        }
      });
    });
    
    const categoryBreakdown: Record<string, number> = {};
    let overallSum = 0;
    let totalCategories = 0;
    
    categoryPerformance.forEach((scores, category) => {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      categoryBreakdown[category] = Math.round(avgScore * 100);
      overallSum += avgScore;
      totalCategories++;
    });
    
    const overallScore = totalCategories > 0 ? 
      Math.round((overallSum / totalCategories) * 100) : 0;
    
    // Generate recommendations
    const recommendations: string[] = [];
    const weakCategories = Object.entries(categoryBreakdown)
      .filter(([, score]) => score < 70)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3);
    
    weakCategories.forEach(([category, score]) => {
      recommendations.push(`Focus on ${category} questions (current: ${score}%)`);
    });
    
    if (overallScore >= 85) {
      recommendations.push('You\'re interview-ready! Practice mock interviews to maintain sharpness');
    } else if (overallScore >= 70) {
      recommendations.push('Good progress! Focus on consistency and advanced topics');
    } else {
      recommendations.push('Build fundamentals with regular practice sessions');
    }
    
    return {
      overallScore,
      categoryBreakdown,
      recommendations
    };
  }
  
  // Helper methods
  
  private static analyzeWeakAreas(history: InterviewSession[]): Map<string, number> {
    const categoryScores = new Map<string, number[]>();
    
    history.forEach(session => {
      session.questions.forEach((question, index) => {
        const answer = session.answers[index];
        if (answer?.score !== undefined) {
          if (!categoryScores.has(question.category)) {
            categoryScores.set(question.category, []);
          }
          categoryScores.get(question.category)!.push(answer.score);
        }
      });
    });
    
    const weaknessScores = new Map<string, number>();
    categoryScores.forEach((scores, category) => {
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      // Higher weakness score for lower performance
      weaknessScores.set(category, 1 - avgScore);
    });
    
    return weaknessScores;
  }
  
  private static diversifyQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
    const result: InterviewQuestion[] = [];
    const usedCategories = new Set<string>();
    const maxPerCategory = 2;
    
    // First pass - one question per category
    questions.forEach(q => {
      if (!usedCategories.has(q.category)) {
        result.push(q);
        usedCategories.add(q.category);
      }
    });
    
    // Second pass - up to maxPerCategory per category
    const categoryCount = new Map<string, number>();
    questions.forEach(q => {
      const count = categoryCount.get(q.category) || 0;
      if (count < maxPerCategory && !result.includes(q)) {
        result.push(q);
        categoryCount.set(q.category, count + 1);
      }
    });
    
    return result;
  }
  
  private static extractKeyTerms(question: InterviewQuestion): string[] {
    // Simplified key term extraction - would use NLP in production
    const keyTermMap: Record<string, string[]> = {
      'JavaScript': ['closure', 'hoisting', 'prototype', 'async', 'Promise'],
      'System Design': ['scalability', 'database', 'cache', 'load balancer', 'API'],
      'Algorithms': ['time complexity', 'space complexity', 'O(n)', 'optimization'],
      'Arrays': ['hash map', 'two pointers', 'sliding window'],
      'Dynamic Programming': ['subproblem', 'memoization', 'bottom-up', 'optimal substructure']
    };
    
    return keyTermMap[question.category] || [];
  }
  
  private static detectSTARContent(answer: string, element: string): boolean {
    const indicators: Record<string, string[]> = {
      'situation': ['when', 'where', 'context', 'background', 'scenario'],
      'task': ['needed to', 'had to', 'goal was', 'objective', 'responsible for'],
      'action': ['I did', 'I implemented', 'I decided', 'I created', 'I worked'],
      'result': ['outcome', 'result', 'impact', 'achieved', 'improved', 'increased']
    };
    
    const elementIndicators = indicators[element] || [];
    return elementIndicators.some(indicator => 
      answer.toLowerCase().includes(indicator.toLowerCase())
    );
  }
  
  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression slope
    const n = values.length;
    const xSum = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, i) => sum + (i * val), 0);
    const xxSum = (n * (n - 1) * (2 * n - 1)) / 6; // 0^2 + 1^2 + ... + (n-1)^2
    
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    return slope;
  }
  
  private static shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}