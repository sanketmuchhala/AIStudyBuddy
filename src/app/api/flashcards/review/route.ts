import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

// SM-2 spaced repetition algorithm implementation
function calculateNextReview(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let newEaseFactor = easeFactor
  let newRepetitions = repetitions
  let newInterval = interval

  if (quality >= 3) {
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(newInterval * newEaseFactor)
    }
    newRepetitions += 1
  } else {
    newRepetitions = 0
    newInterval = 1
  }

  newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flashcardId, quality } = body

    if (!flashcardId || quality === undefined) {
      return Response.json({ error: 'Flashcard ID and quality are required' }, { status: 400 })
    }

    if (quality < 0 || quality > 5) {
      return Response.json({ error: 'Quality must be between 0 and 5' }, { status: 400 })
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId }
    })

    if (!flashcard) {
      return Response.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    const { repetitions, easeFactor, interval } = calculateNextReview(
      quality,
      flashcard.repetitions,
      flashcard.easeFactor,
      flashcard.interval
    )

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + interval)

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        repetitions,
        easeFactor,
        interval,
        nextReviewDate,
        lastReviewedAt: new Date(),
        difficulty: quality < 3 ? Math.min(flashcard.difficulty + 1, 5) : Math.max(flashcard.difficulty - 1, 0)
      }
    })

    return Response.json(updatedFlashcard)
  } catch (error) {
    console.error('Review flashcard error:', error)
    return Response.json({ error: 'Failed to review flashcard' }, { status: 500 })
  }
}