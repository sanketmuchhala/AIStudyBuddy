# AI Study Buddy

An AI-powered study companion built with Next.js and TypeScript. Features include intelligent chat assistance, interview preparation, spaced repetition flashcards, and a Pomodoro timer.

## Features

- AI chat assistant powered by DeepSeek API with streaming responses
- Interview preparation with resume parsing and question generation
- Spaced repetition flashcards using the SM-2 algorithm
- Pomodoro study timer with session tracking
- Dark/light mode with responsive design

## Quick Start

1. Clone and install dependencies:
   ```bash
   git clone <repository-url>
   cd AIStudyBuddy
   npm install
   ```

2. Set up environment variables:
   ```bash
   echo "DEEPSEEK_API_KEY=your_api_key_here" > .env.local
   ```

3. Initialize database:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- Next.js 15 with App Router and TypeScript
- Tailwind CSS and shadcn/ui components
- Prisma ORM with SQLite database
- DeepSeek API for AI features
- Framer Motion for animations

## Deployment

Deploy to Vercel by connecting your GitHub repository. Set the `DEEPSEEK_API_KEY` environment variable in your Vercel dashboard.

## License

MIT License
