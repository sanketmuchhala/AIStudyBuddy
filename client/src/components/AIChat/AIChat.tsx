import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy, Settings, X, Loader2 } from 'lucide-react';
import { aiService, AIMessage } from '../../services/aiService';
import config from '../../config/environment';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiBase, setApiBase] = useState(config.apiBaseUrl);
  const [authToken, setAuthToken] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkConnection = async () => {
    console.log('Checking AI service connection...');
    try {
      const connected = await aiService.healthCheck();
      console.log('AI service connection status:', connected);
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Health check failed:', error);
      setIsConnected(false);
      return false;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    console.log('Sending message to AI service:', userMessage.content);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage({ prompt: userMessage.content });
      console.log('AI service response:', response);
      
      // Handle both error and successful responses
      let responseText = response.text;
      
      if (response.error || !responseText || responseText.trim() === '') {
        // Use fallback response if there's an error or empty response
        responseText = response.error || 
          "I'm having trouble connecting to my AI service right now. Please try again in a moment. " +
          "In the meantime, I can suggest checking your study schedule or adding new subjects to track your progress!";
      }

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update connection status if successful
      if (responseText && !response.error) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide helpful fallback based on user input
      let fallbackResponse = "I'm having trouble connecting right now. ";
      const input_lower = userMessage.content.toLowerCase();
      
      if (input_lower.includes('study') || input_lower.includes('learn')) {
        fallbackResponse += "While I can't connect to my AI service, I recommend using the Smart Scheduler to plan your study sessions, or check out the Analytics tab to see your progress!";
      } else if (input_lower.includes('schedule') || input_lower.includes('plan')) {
        fallbackResponse += "Try using the AI Scheduler tab to automatically plan your study sessions based on your subjects and available time.";
      } else if (input_lower.includes('help') || input_lower.includes('question')) {
        fallbackResponse += "You can use the different tabs in the app: Dashboard for overview, Smart Scheduler for planning, Study Timer for tracking sessions, and Analytics for insights.";
      } else {
        fallbackResponse += "Please try again in a moment, or explore the other features in the app while I reconnect.";
      }
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const updateApiSettings = () => {
    aiService.setApiBase(apiBase);
    aiService.setAuthToken(authToken || null);
    setShowSettings(false);
    checkConnection();
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h2>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <button
                onClick={checkConnection}
                className="px-2 py-0.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                title="Test Connection"
              >
                Test
              </button>
            </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
              title="Close AI Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://your-railway-app.railway.app"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Auth Token (optional)
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Bearer token"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={updateApiSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Ask me anything about your studies!</p>
              <p className="text-sm mt-2">I can help with explanations, practice questions, study plans, and more.</p>
              <button
                onClick={() => {
                  const testMessage = "Hello! Can you help me study?";
                  setInput(testMessage);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Test Message
              </button>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-5 h-5 mt-0.5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
