// AI Chat Frontend Application
class AIChat {
  constructor() {
    // Configuration
    this.API_BASE = 'https://your-railway-url.railway.app'; // Replace with your Railway URL
    this.API_AUTH_TOKEN = null; // Set from settings panel
    this.TURNSTILE_SITE_KEY = 'YOUR_TURNSTILE_SITE_KEY'; // Replace if using Turnstile
    
    // State
    this.state = {
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      messages: [],
      system: '',
      streaming: false,
      connected: true
    };
    
    // Presets for different use cases
    this.presets = {
      general: {
        name: 'General Chat',
        template: '{prompt}'
      },
      summarize: {
        name: 'Summarize',
        template: 'Please provide a clear and concise summary of the following text:\n\n{prompt}'
      },
      rewrite: {
        name: 'Rewrite (Friendlier)',
        template: 'Please rewrite the following text to make it more friendly, approachable, and engaging while maintaining the core message:\n\n{prompt}'
      },
      keypoints: {
        name: 'Key Points',
        template: 'Please extract the key points from the following text and present them as a bulleted list:\n\n{prompt}'
      }
    };
    
    this.init();
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.loadState();
    this.updateUI();
    this.checkConnection();
    
    // Initialize syntax highlighting
    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }
    
    console.log('🤖 AI Chat initialized');
  }
  
  bindElements() {
    // Header elements
    this.modelSelect = document.getElementById('modelSelect');
    this.temperatureSlider = document.getElementById('temperatureSlider');
    this.temperatureValue = document.getElementById('temperatureValue');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.clearBtn = document.getElementById('clearBtn');
    
    // Settings panel
    this.settingsPanel = document.getElementById('settingsPanel');
    this.systemPrompt = document.getElementById('systemPrompt');
    this.apiToken = document.getElementById('apiToken');
    this.apiBase = document.getElementById('apiBase');
    this.settingsClose = document.getElementById('settingsClose');
    this.exportBtn = document.getElementById('exportBtn');
    
    // Chat elements
    this.chatMessages = document.getElementById('chatMessages');
    this.typingIndicator = document.getElementById('typingIndicator');
    
    // Input elements
    this.presetSelect = document.getElementById('presetSelect');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.tokenCount = document.getElementById('tokenCount');
    this.connectionStatus = document.getElementById('connectionStatus');
    
    // Toast container
    this.toastContainer = document.getElementById('toastContainer');
  }
  
  bindEvents() {
    // Header controls
    this.modelSelect.addEventListener('change', (e) => {
      this.state.model = e.target.value;
      this.saveState();
      this.loadMessages(); // Load messages for this model
    });
    
    this.temperatureSlider.addEventListener('input', (e) => {
      this.state.temperature = parseFloat(e.target.value);
      this.temperatureValue.textContent = this.state.temperature;
      this.saveState();
    });
    
    this.settingsBtn.addEventListener('click', () => {
      this.toggleSettings();
    });
    
    this.clearBtn.addEventListener('click', () => {
      this.clearChat();
    });
    
    // Settings panel
    this.settingsClose.addEventListener('click', () => {
      this.toggleSettings(false);
    });
    
    this.systemPrompt.addEventListener('input', (e) => {
      this.state.system = e.target.value;
      this.saveState();
    });
    
    this.apiToken.addEventListener('input', (e) => {
      this.API_AUTH_TOKEN = e.target.value || null;
    });
    
    this.apiBase.addEventListener('input', (e) => {
      this.API_BASE = e.target.value;
    });
    
    this.exportBtn.addEventListener('click', () => {
      this.exportChat();
    });
    
    // Input handling
    this.presetSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        this.applyPreset(e.target.value);
        e.target.value = ''; // Reset selection
      }
    });
    
    this.messageInput.addEventListener('input', () => {
      this.updateTokenCount();
      this.autoResize();
    });
    
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.settingsPanel.contains(e.target) && 
          !this.settingsBtn.contains(e.target) && 
          !this.settingsPanel.classList.contains('hidden')) {
        this.toggleSettings(false);
      }
    });
  }
  
  loadState() {
    try {
      // Load global settings
      const globalState = localStorage.getItem('aiChat_global');
      if (globalState) {
        const parsed = JSON.parse(globalState);
        this.state.model = parsed.model || this.state.model;
        this.state.temperature = parsed.temperature || this.state.temperature;
        this.state.system = parsed.system || this.state.system;
        this.API_BASE = parsed.apiBase || this.API_BASE;
      }
      
      // Load messages for current model
      this.loadMessages();
      
    } catch (error) {
      console.warn('Failed to load state:', error);
    }
  }
  
  loadMessages() {
    try {
      const messagesKey = `aiChat_messages_${this.state.model}`;
      const saved = localStorage.getItem(messagesKey);
      this.state.messages = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load messages:', error);
      this.state.messages = [];
    }
  }
  
  saveState() {
    try {
      // Save global settings
      const globalState = {
        model: this.state.model,
        temperature: this.state.temperature,
        system: this.state.system,
        apiBase: this.API_BASE
      };
      localStorage.setItem('aiChat_global', JSON.stringify(globalState));
      
      // Save messages for current model
      const messagesKey = `aiChat_messages_${this.state.model}`;
      localStorage.setItem(messagesKey, JSON.stringify(this.state.messages));
      
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }
  
  updateUI() {
    // Update header controls
    this.modelSelect.value = this.state.model;
    this.temperatureSlider.value = this.state.temperature;
    this.temperatureValue.textContent = this.state.temperature;
    this.systemPrompt.value = this.state.system;
    this.apiBase.value = this.API_BASE;
    
    // Update send button state
    this.sendBtn.disabled = this.state.streaming;
    
    // Render messages
    this.renderMessages();
    
    // Update token count
    this.updateTokenCount();
    
    // Auto-resize input
    this.autoResize();
  }
  
  renderMessages() {
    const container = this.chatMessages;
    
    // Clear existing messages (except welcome)
    const existingMessages = container.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Hide welcome message if there are messages
    const welcomeMessage = container.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.style.display = this.state.messages.length > 0 ? 'none' : 'block';
    }
    
    // Render each message
    this.state.messages.forEach((message, index) => {
      this.renderMessage(message, index);
    });
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  renderMessage(message, index) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.role}`;
    messageEl.setAttribute('data-index', index);
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (message.role === 'assistant') {
      // Render markdown for assistant messages
      bubble.innerHTML = this.renderMarkdown(message.content);
      
      // Add copy button
      const actions = document.createElement('div');
      actions.className = 'message-actions';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => this.copyToClipboard(message.content);
      
      actions.appendChild(copyBtn);
      bubble.appendChild(actions);
      
      // Highlight code blocks
      setTimeout(() => {
        if (typeof hljs !== 'undefined') {
          bubble.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
          });
        }
      }, 0);
    } else {
      // Plain text for user messages
      bubble.textContent = message.content;
    }
    
    messageEl.appendChild(bubble);
    this.chatMessages.appendChild(messageEl);
  }
  
  renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
      return marked.parse(text);
    }
    // Fallback: simple formatting
    return text
      .replace(/\n/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
  
  async sendMessage() {
    const text = this.messageInput.value.trim();
    if (!text || this.state.streaming) return;
    
    // Add user message
    const userMessage = { role: 'user', content: text };
    this.state.messages.push(userMessage);
    
    // Clear input
    this.messageInput.value = '';
    this.updateTokenCount();
    this.autoResize();
    
    // Update UI
    this.renderMessage(userMessage, this.state.messages.length - 1);
    this.scrollToBottom();
    
    // Start streaming
    this.state.streaming = true;
    this.updateUI();
    this.showTyping(true);
    
    try {
      await this.streamResponse(text);
    } catch (error) {
      console.error('Send message error:', error);
      this.showToast('Failed to send message', 'error');
      
      // Remove the user message if sending failed
      this.state.messages.pop();
      this.renderMessages();
    } finally {
      this.state.streaming = false;
      this.showTyping(false);
      this.updateUI();
      this.saveState();
    }
  }
  
  async streamResponse(prompt) {
    const assistantMessage = { role: 'assistant', content: '' };
    this.state.messages.push(assistantMessage);
    
    const messageIndex = this.state.messages.length - 1;
    this.renderMessage(assistantMessage, messageIndex);
    
    try {
      // Try streaming first
      await this.fetchStream(prompt, messageIndex);
    } catch (error) {
      console.warn('Streaming failed, falling back to non-streaming:', error);
      
      try {
        // Fallback to non-streaming
        await this.fetchChat(prompt, messageIndex);
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }
  
  async fetchStream(prompt, messageIndex) {
    const requestBody = {
      prompt,
      model: this.state.model,
      temperature: this.state.temperature,
      system: this.state.system || undefined
    };
    
    // Add Turnstile token if enabled
    if (this.TURNSTILE_SITE_KEY && this.TURNSTILE_SITE_KEY !== 'YOUR_TURNSTILE_SITE_KEY') {
      const turnstileToken = await this.getTurnstileToken();
      if (turnstileToken) {
        requestBody.turnstileToken = turnstileToken;
      }
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.API_AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${this.API_AUTH_TOKEN}`;
    }
    
    const response = await fetch(`${this.API_BASE}/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'unknown', message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            if (data.error) {
              throw new Error(data.message || 'Stream error');
            }
            
            if (data.delta) {
              this.state.messages[messageIndex].content += data.delta;
              this.updateMessageDisplay(messageIndex);
            }
            
            if (data.done) {
              return;
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE data:', parseError);
          }
        }
      }
    }
  }
  
  async fetchChat(prompt, messageIndex) {
    const requestBody = {
      prompt,
      model: this.state.model,
      temperature: this.state.temperature,
      system: this.state.system || undefined
    };
    
    // Add Turnstile token if enabled
    if (this.TURNSTILE_SITE_KEY && this.TURNSTILE_SITE_KEY !== 'YOUR_TURNSTILE_SITE_KEY') {
      const turnstileToken = await this.getTurnstileToken();
      if (turnstileToken) {
        requestBody.turnstileToken = turnstileToken;
      }
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.API_AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${this.API_AUTH_TOKEN}`;
    }
    
    const response = await fetch(`${this.API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'unknown', message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    this.state.messages[messageIndex].content = result.text;
    this.updateMessageDisplay(messageIndex);
  }
  
  updateMessageDisplay(messageIndex) {
    const messageEl = this.chatMessages.querySelector(`[data-index="${messageIndex}"]`);
    if (messageEl) {
      const bubble = messageEl.querySelector('.message-bubble');
      const message = this.state.messages[messageIndex];
      
      // Preserve actions if they exist
      const actions = bubble.querySelector('.message-actions');
      
      bubble.innerHTML = this.renderMarkdown(message.content);
      
      if (actions) {
        bubble.appendChild(actions);
      } else if (message.role === 'assistant') {
        // Add copy button if it doesn't exist
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => this.copyToClipboard(message.content);
        
        actionsDiv.appendChild(copyBtn);
        bubble.appendChild(actionsDiv);
      }
      
      // Highlight code blocks
      if (typeof hljs !== 'undefined') {
        bubble.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
        });
      }
      
      this.scrollToBottom();
    }
  }
  
  async getTurnstileToken() {
    return new Promise((resolve) => {
      if (typeof turnstile !== 'undefined') {
        turnstile.render('#turnstileContainer', {
          sitekey: this.TURNSTILE_SITE_KEY,
          callback: resolve
        });
      } else {
        resolve(null);
      }
    });
  }
  
  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;
    
    const currentText = this.messageInput.value.trim();
    if (!currentText) return;
    
    const processedText = preset.template.replace('{prompt}', currentText);
    this.messageInput.value = processedText;
    this.updateTokenCount();
    this.autoResize();
    this.messageInput.focus();
  }
  
  updateTokenCount() {
    const text = this.messageInput.value;
    // Rough estimation: 1 token ≈ 4 characters
    const tokenCount = Math.ceil(text.length / 4);
    this.tokenCount.textContent = tokenCount;
    
    // Update color based on usage
    const usage = tokenCount / 2000;
    if (usage > 0.9) {
      this.tokenCount.style.color = 'var(--error-color)';
    } else if (usage > 0.7) {
      this.tokenCount.style.color = 'var(--warning-color)';
    } else {
      this.tokenCount.style.color = 'var(--text-muted)';
    }
  }
  
  autoResize() {
    const textarea = this.messageInput;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + 'px';
  }
  
  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  showTyping(show) {
    this.typingIndicator.classList.toggle('hidden', !show);
    if (show) {
      this.scrollToBottom();
    }
  }
  
  toggleSettings(show) {
    if (show === undefined) {
      show = this.settingsPanel.classList.contains('hidden');
    }
    this.settingsPanel.classList.toggle('hidden', !show);
  }
  
  clearChat() {
    if (confirm('Clear all messages? This cannot be undone.')) {
      this.state.messages = [];
      this.saveState();
      this.renderMessages();
      this.showToast('Chat cleared', 'success');
    }
  }
  
  exportChat() {
    const data = {
      model: this.state.model,
      temperature: this.state.temperature,
      system: this.state.system,
      messages: this.state.messages,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${this.state.model}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast('Chat exported', 'success');
  }
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard', 'success');
    } catch (error) {
      console.warn('Failed to copy:', error);
      this.showToast('Failed to copy', 'error');
    }
  }
  
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    this.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  async checkConnection() {
    try {
      const response = await fetch(`${this.API_BASE}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      this.state.connected = response.ok;
    } catch (error) {
      this.state.connected = false;
      console.warn('Connection check failed:', error);
    }
    
    this.updateConnectionStatus();
  }
  
  updateConnectionStatus() {
    const statusDot = this.connectionStatus.querySelector('.status-dot');
    const statusText = this.connectionStatus.querySelector('.status-text');
    
    if (this.state.connected) {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Connected';
    } else {
      statusDot.className = 'status-dot error';
      statusText.textContent = 'Disconnected';
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aiChat = new AIChat();
});