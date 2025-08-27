import { NextRequest } from 'next/server'
import { deepseek } from '@/lib/deepseek'
import { prisma } from '@/lib/db'

interface GenerateRequest {
  role: string
  company?: string
  resumeText?: string
  experienceLevel: 'entry' | 'mid' | 'senior'
  questionCount: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { role, company, resumeText, experienceLevel, questionCount = 10 } = body

    if (!role) {
      return Response.json({ error: 'Role is required' }, { status: 400 })
    }

    // Create interview session
    const session = await prisma.interviewSession.create({
      data: {
        role,
        company: company || '',
        resumeText: resumeText || '',
        userId: 'default'
      }
    })

    // Generate questions using DeepSeek
    const prompt = `Generate ${questionCount} interview questions for a ${experienceLevel}-level ${role} position${company ? ` at ${company}` : ''}.

${resumeText ? `Based on this resume:\n${resumeText}\n\n` : ''}

Create a mix of:
- Technical questions (40%)
- Behavioral questions (40%) 
- Situational questions (20%)

For each question, provide:
1. The question text
2. Question type (technical/behavioral/situational)
3. Difficulty level (easy/medium/hard)
4. A suggested answer or approach
5. For behavioral questions, provide STAR framework guidance

Return the response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "type": "technical|behavioral|situational",
    "difficulty": "easy|medium|hard",
    "suggestedAnswer": "Answer or approach",
    "starFramework": "For behavioral questions only: JSON object with situation, task, action, result"
  }
]`

    const response = await deepseek.chatCompletion([{
      role: 'user',
      content: prompt
    }])

    const content = response.choices[0].message.content
    let questions: Record<string, unknown>[] = []

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: parse the response manually if JSON extraction fails
        questions = parseQuestionsFromText(content, questionCount)
      }
    } catch (parseError) {
      console.error('Failed to parse generated questions:', parseError)
      questions = parseQuestionsFromText(content, questionCount)
    }

    // Save questions to database
    const savedQuestions = await Promise.all(
      questions.slice(0, questionCount).map(async (q, index) => {
        const question = await prisma.interviewQuestion.create({
          data: {
            question: q.question || `Sample question ${index + 1}`,
            type: q.type || 'technical',
            difficulty: q.difficulty || 'medium',
            suggestedAnswer: q.suggestedAnswer || '',
            starFramework: typeof q.starFramework === 'object' ? JSON.stringify(q.starFramework) : q.starFramework || null,
            interviewSessionId: session.id
          }
        })
        return question
      })
    )

    return Response.json({
      sessionId: session.id,
      questions: savedQuestions,
      generatedCount: savedQuestions.length
    })
  } catch (error) {
    console.error('Interview generation error:', error)
    return Response.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}

function parseQuestionsFromText(content: string, count: number) {
  // Fallback parser for when JSON extraction fails
  const questions = []
  const lines = content.split('\n').filter(line => line.trim())
  
  for (let i = 0; i < Math.min(count, lines.length); i++) {
    const line = lines[i].trim()
    if (line && !line.startsWith('```') && !line.startsWith('[') && !line.startsWith(']')) {
      questions.push({
        question: line.replace(/^\d+\.?\s*/, ''), // Remove numbering
        type: i % 3 === 0 ? 'technical' : i % 3 === 1 ? 'behavioral' : 'situational',
        difficulty: 'medium',
        suggestedAnswer: 'Consider your experience and provide specific examples.',
        starFramework: null
      })
    }
  }
  
  return questions.slice(0, count)
}