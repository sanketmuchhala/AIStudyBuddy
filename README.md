# AI Study Buddy

A modern, AI-powered study companion built with Next.js, featuring intelligent chat assistance, interview preparation, spaced repetition flashcards, and Pomodoro timer functionality.

![AI Study Buddy Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=AI+Study+Buddy+Dashboard)

## ✨ Features

### 🤖 AI Chat Assistant
- **DeepSeek-powered conversations** for instant study help
- **Streaming responses** with real-time typing effect
- **Markdown support** with syntax highlighting for code
- **Session persistence** with conversation history
- **Keyboard shortcuts** (Cmd/Ctrl+Enter to send)

### 🎯 Interview Preparation
- **Resume upload & parsing** (PDF/TXT support)
- **AI-generated interview questions** tailored to your role
- **Behavioral question frameworks** (STAR method)
- **Practice mode** with timed sessions
- **Question categorization** (Technical, Behavioral, Situational)

### 📚 Spaced Repetition Flashcards
- **SM-2 algorithm implementation** for optimal learning
- **Difficulty-based review scheduling** 
- **Performance tracking** with retention statistics
- **Category organization** for different subjects
- **Keyboard shortcuts** (1-4 for rating, Space to flip)

### ⏰ Pomodoro Study Timer
- **Customizable focus sessions** (15-60 minutes)
- **Automatic break reminders** (short & long breaks)
- **Study streak tracking** with daily goals
- **Session notes** and subject tracking
- **Sound notifications** and visual progress

### 🎨 Beautiful UI/UX
- **Dark/Light mode** with system preference detection
- **Responsive design** for all devices
- **Smooth animations** with Framer Motion
- **Accessible components** with proper ARIA labels
- **Modern design** with shadcn/ui components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AIStudyBuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   echo "DEEPSEEK_API_KEY=sk-f112d2aa4cb348c7872e2af02b17989a" > .env.local
   ```

4. **Initialize database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations

### UI Components
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling with validation

### Backend & Database
- **Prisma** - Type-safe database ORM
- **SQLite** - Local database for development
- **Zod** - Schema validation
- **DeepSeek API** - AI chat completions

### State Management
- **Zustand** - Lightweight state management
- **React Context** - Theme and global state

## 🗄️ Database Schema

The app uses SQLite with Prisma ORM. Key entities:

- **User** - User profiles and settings
- **ChatSession & ChatMessage** - Chat history storage
- **Flashcard** - Spaced repetition cards with SM-2 data
- **InterviewSession & InterviewQuestion** - Interview prep data
- **StudySession & StudyStreak** - Study tracking and gamification

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables**
   - Go to your Vercel dashboard
   - Add `DEEPSEEK_API_KEY` to environment variables
   - Redeploy

### Environment Variables
- `DEEPSEEK_API_KEY` - Your DeepSeek API key for AI features

## ⌨️ Keyboard Shortcuts

### Global
- `Alt + 1-6` - Quick navigation between pages
- `Cmd/Ctrl + K` - Command palette (coming soon)

### Chat
- `Cmd/Ctrl + Enter` - Send message

### Flashcards
- `Space` - Flip card
- `1` - Rate as "Again" 
- `2` - Rate as "Hard"
- `3` - Rate as "Good"
- `4` - Rate as "Easy"

### Study Timer  
- `Space` - Start/pause timer
- `Escape` - Stop timer
- `R` - Reset timer

## 🔧 Configuration

### Pomodoro Settings
- Default focus time: 25 minutes
- Short break: 5 minutes  
- Long break: 15 minutes
- Customizable in Settings page

### Spaced Repetition
- Algorithm: SM-2 (SuperMemo 2)
- Quality scale: 0-5
- Minimum ease factor: 1.3
- Initial interval: 1 day

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [DeepSeek](https://deepseek.com/) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Vercel](https://vercel.com/) for deployment platform
- [Prisma](https://prisma.io/) for database management
- [SM-2 Algorithm](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm) for spaced repetition

---

Built with ❤️ for better learning experiences
