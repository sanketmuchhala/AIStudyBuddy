# Deployment Guide

## Quick Deploy to Vercel

### 1. One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsanketmuchhala%2FAIStudyBuddy&env=DEEPSEEK_API_KEY&envDescription=DeepSeek%20API%20Key%20for%20AI%20features&envLink=https%3A%2F%2Fplatform.deepseek.com%2Fusage)

### 2. Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### 3. Environment Variables

Set these environment variables in your Vercel dashboard:

- `DEEPSEEK_API_KEY` - Your DeepSeek API key from https://platform.deepseek.com/usage

### 4. Database Setup

The database will be automatically set up during deployment using:
- SQLite database with Prisma ORM
- Automatic migrations and seeding
- Default user and sample flashcards

### 5. Post-Deployment

After deployment:
1. Visit your Vercel URL
2. Test the flashcards functionality 
3. Create new flashcards and start learning!

## Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/sanketmuchhala/AIStudyBuddy.git
   cd AIStudyBuddy
   npm install
   ```

2. **Environment variables**
   ```bash
   echo "DEEPSEEK_API_KEY=your_api_key_here" > .env.local
   ```

3. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Features Ready for Production

✅ **AI Chat** - Streaming DeepSeek conversations  
✅ **Interview Prep** - Resume parsing and question generation  
✅ **Flashcards** - SM-2 spaced repetition algorithm  
✅ **Study Timer** - Pomodoro technique with tracking  
✅ **Dark Mode** - System preference detection  
✅ **Responsive Design** - Works on all devices  

All features are fully functional and production-ready!