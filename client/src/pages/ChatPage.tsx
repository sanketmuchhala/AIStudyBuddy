import { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, RotateCcw, Copy, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/components/ui/theme-provider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamAbort, setStreamAbort] = useState<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aistudybuddy-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const conversations = parsed.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          lastUpdated: new Date(conv.lastUpdated)
        }));
        setConversations(conversations);
        
        if (conversations.length > 0 && !activeConversationId) {
          setActiveConversationId(conversations[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }
  }, [activeConversationId]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('aistudybuddy-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversations, streamingMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      lastUpdated: new Date(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const addMessage = (conversationId: string, message: Omit<Message, 'id'>) => {
    const messageWithId = {
      ...message,
      id: Date.now().toString(),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, messageWithId],
              lastUpdated: new Date(),
              title: conv.messages.length === 0 ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : conv.title
            }
          : conv
      )
    );

    return messageWithId.id;
  };

  const updateMessage = (conversationId: string, messageId: string, content: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId ? { ...msg, content, streaming: false } : msg
              ),
              lastUpdated: new Date()
            }
          : conv
      )
    );
  };

  const removeMessage = (conversationId: string, messageId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.filter(msg => msg.id !== messageId)
            }
          : conv
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;

    let conversationId = activeConversationId;
    
    // Create new conversation if none exists
    if (!conversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
        messages: [],
        lastUpdated: new Date(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      conversationId = newConversation.id;
      setActiveConversationId(conversationId);
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    addMessage(conversationId, userMessage);

    // Add assistant message placeholder
    const assistantMessageId = addMessage(conversationId, {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
    });

    setInput('');
    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    // Start streaming
    let fullContent = '';
    const { abort } = apiClient.createChatStream(
      input.trim(),
      conversationId,
      (chunk) => {
        fullContent += chunk;
        updateMessage(conversationId!, assistantMessageId, fullContent);
      },
      (error: ApiError) => {
        setIsStreaming(false);
        setStreamingMessageId(null);
        setStreamAbort(null);
        
        updateMessage(conversationId!, assistantMessageId, 
          `Error: ${error.message}. Please try again.`
        );
        
        toast({
          title: 'Chat Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      () => {
        setIsStreaming(false);
        setStreamingMessageId(null);
        setStreamAbort(null);
        
        // Mark message as complete
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === assistantMessageId ? { ...msg, streaming: false } : msg
                  )
                }
              : conv
          )
        );
      }
    );

    setStreamAbort(() => abort);
  };

  const stopStreaming = () => {
    if (streamAbort) {
      streamAbort();
      setIsStreaming(false);
      setStreamingMessageId(null);
      setStreamAbort(null);
    }
  };

  const retryLastMessage = () => {
    const activeConversation = conversations.find(conv => conv.id === activeConversationId);
    if (!activeConversation || activeConversation.messages.length < 2) return;

    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      // Remove the last assistant message if it exists
      const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        removeMessage(activeConversationId!, lastMessage.id);
      }
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard.',
    });
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Conversations Sidebar */}
      <div className="w-80 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button onClick={createNewConversation} size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-sm">Start chatting to create one!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all hover:shadow-md group ${
                  activeConversationId === conversation.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveConversationId(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">
                        {conversation.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {conversation.messages.length} messages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.lastUpdated.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 rounded-t-lg">
              {activeConversation.messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-sm">Ask me anything about your studies!</p>
                </div>
              ) : (
                activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex group ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-8'
                          : 'bg-background border mr-8'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                components={{
                                  code({ className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !className?.includes('language-');
                                    
                                    return !isInline && match ? (
                                      <SyntaxHighlighter
                                        style={theme === 'dark' ? oneDark as any : oneLight as any}
                                        language={match[1]}
                                        PreTag="div"
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                              {message.streaming && (
                                <div className="mt-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <span className="text-xs text-muted-foreground">AI is typing...</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {message.role}
                        </Badge>
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-background border rounded-lg p-4 mr-8">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-background p-4">
              <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    disabled={isStreaming}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSubmit(e);
                      }
                    }}
                    className="min-h-[44px]"
                  />
                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    Press Ctrl+Enter to send
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isStreaming ? (
                    <Button
                      type="button"
                      onClick={stopStreaming}
                      variant="destructive"
                      size="sm"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        onClick={retryLastMessage}
                        variant="outline"
                        size="sm"
                        disabled={!activeConversation || activeConversation.messages.length < 2}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                      <Button
                        type="submit"
                        disabled={!input.trim() || isStreaming}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to AI Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Start a new conversation or select an existing one from the sidebar.
                </p>
                <Button onClick={createNewConversation}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}