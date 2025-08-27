import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  // Create a default user
  const defaultUser = await prisma.user.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Demo User',
      email: 'demo@example.com',
    },
  })

  // Create sample flashcards
  await prisma.flashcard.createMany({
    data: [
      {
        front: 'What is React?',
        back: 'A JavaScript library for building user interfaces, particularly web applications.',
        category: 'Programming',
        userId: defaultUser.id,
      },
      {
        front: 'What does API stand for?',
        back: 'Application Programming Interface - a set of protocols and tools for building software applications.',
        category: 'Programming',
        userId: defaultUser.id,
      },
      {
        front: 'What is machine learning?',
        back: 'A subset of AI that enables computers to learn and improve from experience without being explicitly programmed.',
        category: 'AI/ML',
        userId: defaultUser.id,
      },
    ],
  })

  // Create sample interview session
  const interviewSession = await prisma.interviewSession.create({
    data: {
      role: 'Frontend Developer',
      company: 'Tech Corp',
      resumeText: 'Experienced frontend developer with 3+ years in React, TypeScript, and modern web technologies.',
      userId: defaultUser.id,
    },
  })

  // Create sample interview questions
  await prisma.interviewQuestion.createMany({
    data: [
      {
        question: 'Tell me about your experience with React.',
        type: 'technical',
        suggestedAnswer: 'I have 3+ years of experience building scalable React applications...',
        interviewSessionId: interviewSession.id,
      },
      {
        question: 'Describe a challenging project you worked on.',
        type: 'behavioral',
        starFramework: JSON.stringify({
          situation: 'Working on a complex e-commerce platform',
          task: 'Implement real-time inventory updates',
          action: 'Used WebSockets and optimistic updates',
          result: 'Reduced page load times by 40%'
        }),
        interviewSessionId: interviewSession.id,
      },
    ],
  })

  // Create study streak
  await prisma.studyStreak.upsert({
    where: { userId: defaultUser.id },
    update: {},
    create: {
      userId: defaultUser.id,
      currentDays: 5,
      longestDays: 15,
      lastStudied: new Date(),
    },
  })

  console.log('Database seeded successfully!')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })