# AI Study Buddy

An AI-powered study companion built with Next.js and TypeScript. Features include intelligent chat assistance, interview preparation, spaced repetition flashcards, and a Pomodoro timer.

<img width="1680" height="1050" alt="Screenshot 2025-09-13 at 11 08 53 PM" src="https://github.com/user-attachments/assets/19d911a3-fa6f-4f9a-a3ca-370917614b23" />
<img width="1680" height="1050" alt="Screenshot 2025-09-13 at 11 08 57 PM" src="https://github.com/user-attachments/assets/335a8e58-581f-485e-a745-52e9d3111c11" />
<img width="1680" height="1050" alt="Screenshot 2025-09-13 at 11 09 00 PM" src="https://github.com/user-attachments/assets/c01e1acc-90c1-44d5-a70f-931a28a95a26" />
<img width="1680" height="1050" alt="Screenshot 2025-09-13 at 11 09 05 PM" src="https://github.com/user-attachments/assets/6c5e587b-5bc7-4ebe-84ed-bc4bf8401d7d" />
<img width="1680" height="1050" alt="Screenshot 2025-09-13 at 11 09 10 PM" src="https://github.com/user-attachments/assets/6046bef5-1aaa-4fc9-ab4a-38b96aff5798" />
<img width="1680" height="1050" alt="Screenshot 2025-09-13 at 11 08 48 PM" src="https://github.com/user-attachments/assets/de25594a-b1ea-48c1-acfb-27ca3f04c07c" />


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
