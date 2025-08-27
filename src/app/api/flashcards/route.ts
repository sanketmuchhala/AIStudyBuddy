import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: 'default' },
      orderBy: { nextReviewDate: 'asc' }
    })
    return Response.json(flashcards)
  } catch (error) {
    console.error('Get flashcards error:', error)
    return Response.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { front, back, category } = body

    if (!front || !back) {
      return Response.json({ error: 'Front and back text are required' }, { status: 400 })
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        front,
        back,
        category: category || 'General',
        userId: 'default'
      }
    })

    return Response.json(flashcard)
  } catch (error) {
    console.error('Create flashcard error:', error)
    return Response.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}