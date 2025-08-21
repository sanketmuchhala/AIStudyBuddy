# Railway Full-Stack Deployment Guide

## ✅ Pre-deployment Checklist

Your AI Study Buddy application is now ready for Railway deployment! Here's what has been fixed:

### Fixed Issues:
- ✅ Railway configuration updated for full-stack deployment
- ✅ Server routes properly configured for AI API compatibility  
- ✅ Health endpoint aligned between server and Railway config
- ✅ Build process optimized for Railway
- ✅ Client configuration set for same-origin API calls
- ✅ TypeScript errors resolved
- ✅ Node.js version specified in package.json

## 🚀 Quick Deployment Steps

### Option 1: Using the Deploy Script
```bash
./deploy-railway.sh
```

### Option 2: Manual Deployment

1. **Install Railway CLI** (if not already installed):
```bash
npm install -g @railway/cli
```

2. **Login to Railway**:
```bash
railway login
```

3. **Initialize/Link Project**:
```bash
railway init
# Or if you have an existing project:
railway link
```

4. **Set Environment Variables**:
```bash
# Set AI provider (start with mock, change later)
railway variables set PROVIDER=mock
railway variables set NODE_ENV=production

# Add your AI API keys via Railway dashboard
# GEMINI_API_KEY or GOOGLE_API_KEY
# OPENAI_API_KEY (optional)
```

5. **Deploy**:
```bash
railway up
```

6. **Get Your URL**:
```bash
railway domain
```

## 🔧 Post-Deployment Configuration

### 1. Set AI API Keys
1. Go to your Railway project dashboard
2. Click on "Variables" tab
3. Add your API keys:
   - `GEMINI_API_KEY` (for Google Gemini AI)
   - `OPENAI_API_KEY` (for OpenAI - optional)
4. Change `PROVIDER` from `mock` to `gemini` or `openai`

### 2. Test Your Deployment

Test the health endpoint:
```bash
curl https://your-app-url.railway.app/healthz
```

Expected response:
```json
{"status":"ok"}
```

Test the AI chat endpoint:
```bash
curl -X POST https://your-app-url.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello! Test the AI functionality."}'
```

## 🎯 What's Deployed

Your Railway deployment includes:

### Frontend (Client):
- ✅ React application with AI chat interface
- ✅ Study tools and dashboard
- ✅ Built and served as static files
- ✅ Configured for same-origin API calls

### Backend (Server):
- ✅ Express.js API server
- ✅ AI service with Gemini/OpenAI support
- ✅ Chat endpoints (regular and streaming)
- ✅ Health monitoring
- ✅ CORS configured for production

### API Endpoints Available:
- `GET /healthz` - Health check
- `POST /api/chat` - AI chat
- `POST /api/chat/stream` - Streaming AI chat
- `POST /api/quick/*` - Quick actions

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Railway logs: `railway logs`
   - Ensure Node.js version compatibility

2. **AI Not Working**:
   - Verify API keys are set in Railway dashboard
   - Check `PROVIDER` variable is set to correct value
   - Test with `PROVIDER=mock` first

3. **CORS Issues**:
   - Should not occur with same-origin deployment
   - Check server CORS configuration if needed

4. **Static Files Not Serving**:
   - Verify client build completed successfully
   - Check server is serving static files from `client/dist`

### Useful Railway Commands:
```bash
# View logs
railway logs

# Redeploy
railway up

# Open dashboard
railway open

# Check status
railway status

# View variables
railway variables
```

## 🎉 Success!

Your AI Study Buddy is now live on Railway! 

- Full-stack application ✅
- AI features ready (once API keys are configured) ✅
- Scalable and production-ready ✅

Access your app at your Railway URL and start using the AI-powered study features!