import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default user if it doesn't exist
  const defaultUser = await prisma.user.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Default User',
      email: 'user@example.com'
    }
  })

  console.log('Created default user:', defaultUser)

  // Create some sample flashcards
  const sampleCards = [
    {
      front: 'What is React?',
      back: 'A JavaScript library for building user interfaces',
      category: 'JavaScript'
    },
    {
      front: 'What does JSX stand for?',
      back: 'JavaScript XML - a syntax extension for JavaScript',
      category: 'JavaScript'
    },
    {
      front: 'What is the capital of France?',
      back: 'Paris',
      category: 'Geography'
    }
  ]

  for (const card of sampleCards) {
    const existingCard = await prisma.flashcard.findFirst({
      where: { 
        front: card.front,
        userId: 'default'
      }
    })

    if (!existingCard) {
      await prisma.flashcard.create({
        data: {
          front: card.front,
          back: card.back,
          category: card.category,
          userId: 'default'
        }
      })
    }
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })