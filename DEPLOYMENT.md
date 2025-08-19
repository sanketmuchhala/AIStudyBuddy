# Deployment Guide 🚀

This guide covers deploying AIStudyBuddy to Railway, including environment setup, CI/CD configuration, and troubleshooting.

## 📋 Prerequisites

- Node.js 18 or higher
- Git repository on GitHub
- Railway account ([railway.app](https://railway.app))
- Optional: OpenAI API key for full AI functionality

## 🛤️ Railway Deployment

### Quick Deploy (Recommended)

1. **Fork this repository** to your GitHub account

2. **Deploy to Railway** with one click:
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/AIStudyBuddy)

3. **Configure environment variables** in Railway dashboard:
   ```env
   NODE_ENV=production
   PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Deploy**: Railway will automatically build and deploy your application

### Manual Railway Setup

#### Step 1: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Link to existing project (if you have one)
railway link [project-id]
```

#### Step 2: Configure Environment Variables

In Railway dashboard or via CLI:

```bash
# Required variables
railway variables set NODE_ENV=production
railway variables set PROVIDER=openai
railway variables set OPENAI_API_KEY=your_key_here

# Optional variables
railway variables set PORT=8080
```

#### Step 3: Deploy

```bash
# Deploy current branch
railway up

# Deploy specific service
railway up --service=your-service-id
```

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` |
| `PORT` | Server port | No | `8080` |
| `PROVIDER` | AI provider (`openai` or `mock`) | Yes | `mock` |
| `OPENAI_API_KEY` | OpenAI API key | Only if `PROVIDER=openai` | - |

## 🐳 Docker Deployment

### Building the Image

```bash
# Build production image
docker build -t aistudybuddy:latest .

# Run with environment variables
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PROVIDER=openai \
  -e OPENAI_API_KEY=your_key \
  aistudybuddy:latest
```

## 🔄 CI/CD Pipeline

The repository includes a CI/CD pipeline that:

1. **Tests** code on multiple Node.js versions
2. **Builds** Docker image for validation
3. **Deploys** to Railway on main branch pushes

#### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Railway authentication token |
| `RAILWAY_SERVICE_ID` | Your Railway service ID |

## 🔍 Health Checks & Monitoring

### Health Check Endpoint

```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-08-19T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "ai": "available"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**: Clear node_modules and reinstall
2. **API Errors**: Check environment variables and API keys
3. **Frontend Loading Issues**: Verify static files are built properly

### Debug Mode

```env
NODE_ENV=development
LOG_LEVEL=debug
```

View logs:
```bash
railway logs --follow
```

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/AIStudyBuddy/issues)
- 📧 Email: support@aistudybuddy.com

**Happy Deploying! 🚀**