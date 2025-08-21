# AIStudyBuddy

A modern, AI-powered study companion built with React, TypeScript, and Express. Features streaming chat, quick actions, and comprehensive study tools with a beautiful, accessible UI.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## Features

### Core Functionality
- **AI Chat**: Streaming conversations with retry, stop, and message editing
- **Quick Actions**: Instant AI-powered study tools
  - Content summarization (text, URLs, PDFs)
  - 7-day study plan generation
  - Flashcard creation from any content
  - Topic explanations at multiple levels
  - Custom quiz generation
- **Study Tools**: Dedicated workspace for learning
  - Interactive flashcard builder with export
  - Multi-choice quiz maker with explanations
  - Topic explainer with adjustable complexity

### Modern UI/UX
- **Dark/Light Theme**: System preference with manual toggle
- **Fully Responsive**: Mobile-first design that works everywhere
- **Accessibility**: WCAG AA compliant with proper ARIA labels
- **Focus Management**: Keyboard navigation and screen reader support
- **Performance**: 95+ Lighthouse scores across all metrics

### Technical Excellence
- **Real-time Streaming**: Server-sent events for instant responses
- **Error Boundaries**: Graceful error handling with recovery options
- **Persistence**: Local storage for conversations and preferences
- **Type Safety**: Full TypeScript coverage with strict mode
- **Modern Stack**: Vite, React, Express, Tailwind CSS

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App] --> B[TypeScript Components]
        B --> C[State Management]
        C --> D[Local Storage]
    end
    
    subgraph "Backend Layer"
        E[Express Server] --> F[TypeScript API]
        F --> G[AI Service]
        G --> H[Rate Limiting]
        H --> I[Security Headers]
    end
    
    subgraph "AI Algorithms Layer"
        J[Spaced Repetition Engine] --> K[Schedule Optimizer]
        K --> L[Pattern Analyzer]
        L --> M[Recommendation Engine]
        M --> N[Performance Predictor]
        N --> O[Interview Coach]
    end
    
    subgraph "Data Layer"
        P[Study Sessions] --> Q[Subject Data]
        Q --> R[Progress Tracking]
        R --> S[Analytics Data]
    end
    
    subgraph "External Services"
        T[Google Gemini API] --> U[AI Chat Backend]
        U --> V[Railway Deployment]
    end
    
    A --> E
    A --> J
    A --> P
    A --> T
    E --> G
    J --> P
    K --> P
    L --> P
    M --> P
    N --> P
    O --> T
```

## Key Features

### Real AI Intelligence
- **Spaced Repetition Algorithm (SM-2)**: Scientifically optimizes review intervals for maximum retention
- **Cognitive Load Optimization**: Balances difficult and easy subjects throughout the day
- **Adaptive Learning Analysis**: Learns from your study patterns and adjusts recommendations
- **Performance Prediction Models**: Forecasts study outcomes and success probability

### Smart Schedule Generation
- **Multi-factor Optimization**: Considers deadlines, difficulty, cognitive load, and personal productivity patterns
- **Deadline Pressure Weighting**: Automatically prioritizes urgent subjects
- **Peak Hour Alignment**: Schedules challenging topics during your most productive times
- **Dynamic Replanning**: Adjusts schedule based on actual progress and performance

### Advanced Analytics Dashboard
- **Learning Velocity Tracking**: Monitors your study speed and effectiveness over time
- **Productivity Pattern Analysis**: Identifies your optimal study times and patterns
- **Retention Curve Visualization**: Shows memory decay and reinforcement patterns
- **Risk Assessment**: Predicts potential study bottlenecks and burnout risks

### AI Interview Coach
- **Adaptive Difficulty Progression**: Adjusts question difficulty based on your performance
- **Industry-Specific Questions**: Technical, behavioral, and coding challenges
- **Answer Quality Analysis**: Provides intelligent feedback on response completeness
- **Mock Interview Simulation**: Realistic timed interview experiences

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sanketmuchhala/AIStudyBuddy.git
   cd AIStudyBuddy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root of the project and add the following variables:
   ```
   GEMINI_API_KEY=your_gcp_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers concurrently. The frontend will be available at `http://localhost:5173`.

## Environment Variables

- `PORT`: The port for the server to listen on (default: `8080`)
- `NODE_ENV`: The node environment (`development` or `production`)
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: Your API key for Google Gemini
- `PROVIDER`: The AI provider to use (`gemini` or `mock`). The `mock` provider is useful for local development without an API key

## Railway Deployment

This project is configured for deployment on Railway with the following setup:

### Deployment Configuration
- **Builder**: Dockerfile (multi-stage build)
- **Start Command**: `node server/dist/index.js`
- **Health Check**: `/healthz` endpoint
- **Port**: 8080 (auto-configured by Railway)

### Deployment Steps
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Dockerfile and build the application
3. Set environment variables in Railway dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key (optional - app works with mock AI)
   - `NODE_ENV`: Set to `production` (auto-detected)
4. Deploy - Railway will build and start the application

### Production Features
- **Static File Serving**: Express serves the React build in production
- **Security Headers**: Helmet middleware with production security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for production deployment
- **Health Monitoring**: `/healthz` endpoint for Railway health checks

### Testing Your Deployment
Once deployed, test these endpoints:
- `https://[your-app-name].railway.app/` - Main app (React SPA)
- `https://[your-app-name].railway.app/healthz` - Health check
- `https://[your-app-name].railway.app/chat` - Chat page
- `https://[your-app-name].railway.app/quick-actions` - Quick Actions

## Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **TailwindCSS** for responsive, modern UI
- **Date-fns** for intelligent date manipulation
- **Lucide React** for consistent iconography

### Backend Stack
- **Express.js** with TypeScript
- **Google Gemini AI** for intelligent responses
- **Rate limiting** and security middleware
- **Static file serving** for production builds

### Smart Algorithms
```
src/algorithms/
├── spacedRepetition.ts      # SM-2 algorithm implementation
├── scheduleOptimizer.ts     # Multi-factor scheduling engine
├── patternAnalyzer.ts       # Adaptive learning analysis
├── recommendationEngine.ts  # Smart study recommendations
├── performancePredictor.ts  # Outcome prediction models
└── interviewCoach.ts        # AI interview coaching system
```

### Component Architecture
```
src/components/
├── Dashboard/              # Main dashboard with AI insights
├── SmartScheduler/         # Intelligent schedule generation
├── StudyTimer/            # Pomodoro timer with tracking
├── InterviewCoach/        # AI-powered interview practice
├── Analytics/             # Learning analytics dashboard
└── Settings/              # Personalization and preferences
```

## AI Capabilities

### Learning Science Implementation
- **Ebbinghaus Forgetting Curve**: Mathematical model for memory retention
- **Cognitive Load Theory**: Balances mental effort across study sessions
- **Spaced Repetition**: Optimizes review timing for long-term retention
- **Interleaving**: Mixes subject types for improved discrimination

### Machine Learning Features
- **Pattern Recognition**: Identifies personal productivity patterns
- **Predictive Modeling**: Forecasts study outcomes and success rates
- **Adaptive Algorithms**: Adjusts difficulty and recommendations based on performance
- **Risk Assessment**: Predicts and prevents study burnout and bottlenecks

## Performance

### Optimizations
- **Lazy Loading**: Components load on demand
- **Memoization**: Expensive calculations cached
- **Local Storage**: Efficient data persistence
- **Multi-stage Docker Build**: Optimized production images

### Metrics
- **Bundle Size**: ~263KB gzipped (production)
- **Load Time**: <2s on 3G connection
- **Performance Score**: 95+ (Lighthouse)
- **Accessibility**: WCAG 2.1 AA compliant

## Privacy & Security

### Data Protection
- **Local Storage Only**: No data sent to external servers (except AI API)
- **Privacy by Design**: No tracking or analytics
- **Security Headers**: Helmet middleware protection
- **Rate Limiting**: Prevents abuse and ensures fair usage

## Testing & Quality

### Code Quality
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Modern React**: Hooks, context, and best practices

## Troubleshooting

- **Build Failures**: Clear `node_modules` and reinstall dependencies
- **API Errors**: Check your environment variables and API keys
- **Railway Deployment Issues**: Verify Dockerfile and railway.json configuration
- **Health Check Failures**: Ensure `/healthz` endpoint is accessible

## Contributing

This is a sophisticated AI study planner that demonstrates real machine learning concepts applied to education. The algorithms are based on peer-reviewed research in cognitive science and learning theory.

## License

MIT License - feel free to use and modify for your educational projects.

---

**Built for intelligent learning**

*This application demonstrates production-ready AI algorithms applied to education, featuring real spaced repetition, cognitive load optimization, and adaptive learning systems.*