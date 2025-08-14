# AI Study Buddy - Complete System Flow Chart

## 🏗️ System Architecture Overview

```mermaid
graph TB
    %% User Interface Layer
    subgraph "Frontend (React + Vite)"
        A[User Opens App] --> B[Main Dashboard]
        B --> C[AI Chat Button]
        B --> D[AI Study Assistant Button]
        B --> E[Study Timer]
        B --> F[Smart Scheduler]
        B --> G[Settings]
    end

    %% AI Components
    subgraph "AI Features"
        C --> H[AI Chat Interface]
        D --> I[Study Recommendations]
        H --> J[Send Message]
        I --> K[Generate Study Plan]
    end

    %% Backend Layer
    subgraph "Backend (Railway Deployment)"
        L[Railway Backend Server]
        M[PostgreSQL Database]
        N[Google Gemini AI API]
        
        L --> M
        L --> N
    end

    %% Data Flow
    J --> L
    K --> L
    L --> O[Store in Database]
    L --> P[Get AI Response]
    
    O --> M
    P --> N
    
    %% Database Tables
    subgraph "Database Schema"
        Q[Users Table]
        R[Chat Sessions Table]
        S[Chat Messages Table]
        T[Study Sessions Table]
        U[Interview Sessions Table]
        V[Interview Q&A Table]
    end
    
    M --> Q
    M --> R
    M --> S
    M --> T
    M --> U
    M --> V

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef ai fill:#fff3e0
    
    class A,B,C,D,E,F,G frontend
    class L,M,N backend
    class Q,R,S,T,U,V database
    class H,I,J,K,P ai
```

## 🔄 Detailed User Flow

```mermaid
flowchart TD
    Start([User Starts App]) --> CheckLocal{Local Development?}
    
    CheckLocal -->|Yes| LocalDev[localhost:5173/AIStudyBuddy/]
    CheckLocal -->|No| Production[GitHub Pages: sanketmuchhala.github.io/AIStudyBuddy/]
    
    LocalDev --> LoadApp[Load React Application]
    Production --> LoadApp
    
    LoadApp --> Dashboard[Main Dashboard]
    
    Dashboard --> UserAction{User Action}
    
    UserAction -->|AI Chat| AIChatFlow
    UserAction -->|Study Assistant| StudyAssistantFlow
    UserAction -->|Study Timer| TimerFlow
    UserAction -->|Smart Scheduler| SchedulerFlow
    
    %% AI Chat Flow
    subgraph AIChatFlow [AI Chat Flow]
        AC1[Open AI Chat Interface]
        AC2[User Types Message]
        AC3[Send to Railway Backend]
        AC4[Store in Database]
        AC5[Get Gemini AI Response]
        AC6[Store AI Response]
        AC7[Display Response]
    end
    
    %% Study Assistant Flow
    subgraph StudyAssistantFlow [Study Assistant Flow]
        SA1[Open Study Assistant]
        SA2[Select Subject & Progress]
        SA3[Generate Study Recommendations]
        SA4[Store Study Session]
        SA5[Display Personalized Plan]
    end
    
    %% Timer Flow
    subgraph TimerFlow [Study Timer Flow]
        T1[Set Study Timer]
        T2[Start Timer]
        T3[Track Study Session]
        T4[Save Session Data]
    end
    
    %% Scheduler Flow
    subgraph SchedulerFlow [Smart Scheduler Flow]
        S1[Add Study Tasks]
        S2[Set Deadlines]
        S3[Optimize Schedule]
        S4[Save Schedule]
    end
    
    %% Backend Processing
    AC3 --> Backend[Railway Backend Processing]
    SA3 --> Backend
    T4 --> Backend
    S4 --> Backend
    
    Backend --> Database[(PostgreSQL Database)]
    Backend --> AI[Google Gemini AI]
    
    AI --> Response[AI Response]
    Response --> Backend
    
    Database --> Store[Store All Data]
    Store --> Success[Success]
    
    %% Error Handling
    Backend --> Error{Error?}
    Error -->|Yes| ErrorHandling[Error Handling & Retry]
    Error -->|No| Success
    
    ErrorHandling --> Backend
```

## 🗄️ Database Schema Flow

```mermaid
erDiagram
    USERS {
        int id PK
        string user_id UK
        timestamp created_at
        timestamp last_active
    }
    
    CHAT_SESSIONS {
        int id PK
        string user_id FK
        string session_id UK
        string model
        timestamp created_at
        timestamp updated_at
    }
    
    CHAT_MESSAGES {
        int id PK
        string session_id FK
        string role
        text content
        timestamp timestamp
    }
    
    STUDY_SESSIONS {
        int id PK
        string user_id FK
        string subject
        int duration_minutes
        array topics
        int performance_rating
        text notes
        timestamp created_at
    }
    
    INTERVIEW_SESSIONS {
        int id PK
        string user_id FK
        string session_id UK
        text resume_text
        timestamp created_at
        timestamp updated_at
    }
    
    INTERVIEW_QA {
        int id PK
        string session_id FK
        int question_number
        text question
        text answer
        int score
        text feedback
        timestamp created_at
    }
    
    USERS ||--o{ CHAT_SESSIONS : "has"
    USERS ||--o{ STUDY_SESSIONS : "has"
    USERS ||--o{ INTERVIEW_SESSIONS : "has"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "contains"
    INTERVIEW_SESSIONS ||--o{ INTERVIEW_QA : "contains"
```

## 🚀 Deployment Flow

```mermaid
flowchart TD
    subgraph "Development"
        Dev[Local Development]
        Dev --> Test[Test Features]
        Test --> Commit[Git Commit]
    end
    
    subgraph "Backend Deployment (Railway)"
        Commit --> PushBackend[Push to GitHub]
        PushBackend --> Railway[Railway Auto-Deploy]
        Railway --> BuildBackend[Build Backend]
        BuildBackend --> DeployBackend[Deploy to Railway]
        DeployBackend --> Database[Setup PostgreSQL]
        Database --> BackendReady[Backend Ready]
    end
    
    subgraph "Frontend Deployment (GitHub Pages)"
        Commit --> PushFrontend[Push to GitHub]
        PushFrontend --> GitHubPages[GitHub Pages Build]
        GitHubPages --> DeployFrontend[Deploy to GitHub Pages]
        DeployFrontend --> FrontendReady[Frontend Ready]
    end
    
    BackendReady --> Production[Production Environment]
    FrontendReady --> Production
    
    Production --> Monitor[Monitor & Maintain]
```

## 🔧 API Endpoints Flow

```mermaid
flowchart LR
    subgraph "Frontend Requests"
        F1[AI Chat Request]
        F2[Study Recommendations]
        F3[Database Operations]
    end
    
    subgraph "Railway Backend"
        API1[POST /chat]
        API2[POST /study/recommendations]
        API3[POST /api/users]
        API4[POST /api/study-sessions]
        API5[POST /api/chat-sessions]
        API6[GET /api/users/:userId/stats]
    end
    
    subgraph "External Services"
        G1[Google Gemini AI]
        DB1[PostgreSQL Database]
    end
    
    F1 --> API1
    F2 --> API2
    F3 --> API3
    F3 --> API4
    F3 --> API5
    F3 --> API6
    
    API1 --> G1
    API2 --> G1
    API3 --> DB1
    API4 --> DB1
    API5 --> DB1
    API6 --> DB1
    
    G1 --> Response[AI Response]
    DB1 --> Data[Stored Data]
    
    Response --> Frontend[Return to Frontend]
    Data --> Frontend
```

## 📊 Data Flow Summary

### **1. User Interaction Flow:**
1. User opens app (localhost:5173 or GitHub Pages)
2. Interacts with AI features (Chat/Study Assistant)
3. Frontend sends requests to Railway backend
4. Backend processes with Google Gemini AI
5. Data stored in PostgreSQL database
6. Response returned to frontend

### **2. Deployment Flow:**
1. Code changes committed to GitHub
2. Railway auto-deploys backend
3. GitHub Pages builds frontend
4. Both services go live automatically

### **3. Database Flow:**
1. All user interactions stored in PostgreSQL
2. Chat sessions, study sessions, interview data
3. Analytics and progress tracking
4. Data persistence across sessions

### **4. AI Integration Flow:**
1. User input sent to Railway backend
2. Backend calls Google Gemini AI API
3. AI processes and responds
4. Response stored in database
5. Response displayed to user

## 🎯 Key Features:

- ✅ **Real-time AI Chat** with database storage
- ✅ **Personalized Study Recommendations**
- ✅ **Study Session Tracking**
- ✅ **Interview Preparation Tools**
- ✅ **Data Analytics & Progress Tracking**
- ✅ **Automatic Deployment** on Railway & GitHub Pages
- ✅ **Scalable PostgreSQL Database**
- ✅ **Production-ready Architecture**
