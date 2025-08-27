// SM-2 Spaced Repetition Algorithm Implementation
// Based on SuperMemo SM-2 algorithm

export interface ReviewData {
  repetitions: number
  easeFactor: number
  interval: number
  nextReviewDate: Date
}

export interface FlashcardStats {
  id: string
  repetitions: number
  easeFactor: number
  interval: number
  difficulty: number
  lastReviewedAt?: Date
  nextReviewDate: Date
}

/**
 * Calculate the next review parameters based on SM-2 algorithm
 * @param quality - Quality of recall (0-5):
 *   0: Complete blackout
 *   1: Incorrect response; correct one remembered
 *   2: Incorrect response; correct one seemed easy to recall
 *   3: Correct response recalled with serious difficulty
 *   4: Correct response after hesitation
 *   5: Perfect response
 * @param repetitions - Number of consecutive correct responses
 * @param easeFactor - Current ease factor (default: 2.5)
 * @param interval - Current interval in days
 * @returns Updated review parameters
 */
export function calculateNextReview(
  quality: number,
  repetitions: number,
  easeFactor: number = 2.5,
  interval: number = 1
): ReviewData {
  let newEaseFactor = easeFactor
  let newRepetitions = repetitions
  let newInterval = interval

  // Update ease factor based on quality
  newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  // Ensure ease factor doesn't go below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  // Calculate new interval and repetitions based on quality
  if (quality >= 3) {
    // Correct response
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(newInterval * newEaseFactor)
    }
    newRepetitions += 1
  } else {
    // Incorrect response - reset repetitions and set interval to 1
    newRepetitions = 0
    newInterval = 1
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate
  }
}

/**
 * Get cards that are due for review
 * @param cards - Array of flashcard stats
 * @returns Array of cards due for review
 */
export function getDueCards(cards: FlashcardStats[]): FlashcardStats[] {
  const now = new Date()
  return cards.filter(card => new Date(card.nextReviewDate) <= now)
}

/**
 * Sort cards by review priority
 * Cards with earlier due dates and higher difficulty get higher priority
 * @param cards - Array of flashcard stats
 * @returns Sorted array of cards
 */
export function prioritizeCards(cards: FlashcardStats[]): FlashcardStats[] {
  return cards.sort((a, b) => {
    // First, sort by due date (earlier dates first)
    const dateA = new Date(a.nextReviewDate)
    const dateB = new Date(b.nextReviewDate)
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime()
    }
    
    // If due dates are the same, prioritize higher difficulty
    return b.difficulty - a.difficulty
  })
}

/**
 * Get study statistics for a set of cards
 * @param cards - Array of flashcard stats
 * @returns Statistics object
 */
export function getStudyStats(cards: FlashcardStats[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const dueCards = getDueCards(cards)
  const reviewedToday = cards.filter(card => {
    if (!card.lastReviewedAt) return false
    const reviewDate = new Date(card.lastReviewedAt)
    const reviewDateOnly = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate())
    return reviewDateOnly.getTime() === today.getTime()
  })

  const difficulties = cards.reduce((acc, card) => {
    if (card.difficulty <= 1) acc.easy++
    else if (card.difficulty <= 3) acc.medium++
    else acc.hard++
    return acc
  }, { easy: 0, medium: 0, hard: 0 })

  return {
    totalCards: cards.length,
    dueForReview: dueCards.length,
    reviewedToday: reviewedToday.length,
    difficulties,
    averageEaseFactor: cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length || 2.5,
    longestStreak: Math.max(...cards.map(card => card.repetitions), 0)
  }
}

/**
 * Estimate study time for a review session
 * @param cardCount - Number of cards to review
 * @param averageTimePerCard - Average time per card in seconds (default: 10)
 * @returns Estimated time in minutes
 */
export function estimateStudyTime(cardCount: number, averageTimePerCard: number = 10): number {
  return Math.ceil((cardCount * averageTimePerCard) / 60)
}

/**
 * Get the next review interval for a new card
 * @returns Initial review data for a new card
 */
export function getInitialReviewData(): ReviewData {
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + 1) // Review again tomorrow

  return {
    repetitions: 0,
    easeFactor: 2.5,
    interval: 1,
    nextReviewDate
  }
}

/**
 * Calculate retention rate based on review history
 * @param reviews - Array of quality scores from recent reviews
 * @returns Retention rate as a percentage (0-100)
 */
export function calculateRetentionRate(reviews: number[]): number {
  if (reviews.length === 0) return 0
  
  const successfulReviews = reviews.filter(quality => quality >= 3).length
  return Math.round((successfulReviews / reviews.length) * 100)
}

/**
 * Get difficulty label based on difficulty score
 * @param difficulty - Difficulty score (0-5)
 * @returns Difficulty label
 */
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 1) return 'Easy'
  if (difficulty <= 3) return 'Medium'
  return 'Hard'
}

/**
 * Get difficulty color class based on difficulty score
 * @param difficulty - Difficulty score (0-5)
 * @returns CSS class string for difficulty color
 */
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 1) return 'bg-green-500'
  if (difficulty <= 3) return 'bg-yellow-500'
  return 'bg-red-500'
}