import { NextRequest } from 'next/server'
import { deepseek } from '@/lib/deepseek'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get or create chat session
    let chatSession
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      })
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          title: message.length > 50 ? message.substring(0, 47) + '...' : message,
          userId: 'default'
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        content: message,
        role: 'user',
        chatSessionId: chatSession.id
      }
    })

    // Build conversation history for DeepSeek
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an AI Study Buddy, a helpful assistant focused on education, learning, and academic support. Provide clear, educational responses and help users with their studies. Use markdown formatting when appropriate.'
      },
      ...chatSession.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Create streaming response
    const encoder = new TextEncoder()
    let assistantResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of deepseek.chatCompletionStream(messages)) {
            assistantResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }

          // Save assistant response to database
          await prisma.chatMessage.create({
            data: {
              content: assistantResponse,
              role: 'assistant',
              chatSessionId: chatSession.id
            }
          })

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sessionId: chatSession.id, done: true })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}