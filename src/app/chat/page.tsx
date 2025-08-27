'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { useChatStore } from '@/lib/store'
import { useChatShortcuts } from '@/lib/keyboard-shortcuts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addSession } = useChatStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let assistantMessageId = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.content) {
                  assistantContent += data.content
                  
                  if (!assistantMessageId) {
                    assistantMessageId = Date.now().toString()
                    setMessages(prev => [...prev, {
                      id: assistantMessageId,
                      content: assistantContent,
                      role: 'assistant',
                      timestamp: new Date()
                    }])
                  } else {
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantMessageId 
                          ? { ...msg, content: assistantContent }
                          : msg
                      )
                    )
                  }
                }
                
                if (data.sessionId && !currentSessionId) {
                  setCurrentSessionId(data.sessionId)
                  addSession({
                    id: data.sessionId,
                    title: input.length > 50 ? input.substring(0, 47) + '...' : input
                  })
                }
                
                if (data.done) {
                  setIsLoading(false)
                  break
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Add keyboard shortcuts after sendMessage is defined
  useChatShortcuts(sendMessage)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Only send on Enter without Shift (Shift+Enter adds new line)
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        sendMessage()
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Study Chat</h1>
        <p className="text-muted-foreground">Get instant help with your studies from your AI tutor</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Ask me anything about your studies, homework, or learning topics!
                </p>
              </motion.div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                  <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-primary text-primary-foreground ml-2' : 'bg-muted mr-2'}`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <Card className={`${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                    <CardContent className="p-3">
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <div className="p-2 rounded-full bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your studies... (Cmd/Ctrl+Enter to send)"
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press <kbd className="bg-muted px-1 rounded">Cmd/Ctrl+Enter</kbd> to send
          </p>
        </div>
      </Card>
    </div>
  )
}