#!/bin/bash

# Railway Deployment Script for AI Study Buddy Backend
# This script helps deploy the backend to Railway

echo "🚀 Starting Railway deployment for AI Study Buddy Backend..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd ai-chat-backend

# Check if we're logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Initialize Railway project if not already done
if [ ! -f "railway.json" ]; then
    echo "📁 Initializing Railway project..."
    railway init
fi

# Link to existing project if needed
echo "🔗 Linking to Railway project..."
railway link

# Set environment variables
echo "🔧 Setting up environment variables..."

# Prompt for Google API key
read -p "Enter your Google Gemini API key: " GOOGLE_API_KEY
railway variables set GOOGLE_API_KEY="$GOOGLE_API_KEY"

# Set allowed origin (update this with your actual frontend URL)
read -p "Enter your frontend URL (e.g., https://your-app.vercel.app): " FRONTEND_URL
railway variables set ALLOWED_ORIGIN="$FRONTEND_URL"

# Optional: Set auth token for security
read -p "Do you want to set an API auth token? (y/n): " SET_AUTH
if [ "$SET_AUTH" = "y" ]; then
    read -p "Enter your API auth token: " API_AUTH_TOKEN
    railway variables set API_AUTH_TOKEN="$API_AUTH_TOKEN"
fi

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
echo "📋 Getting deployment URL..."
DEPLOYMENT_URL=$(railway domain)

echo "✅ Deployment complete!"
echo "🌐 Your backend is available at: $DEPLOYMENT_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update the API_BASE_URL in src/services/aiService.ts with: $DEPLOYMENT_URL"
echo "2. Test the health endpoint: $DEPLOYMENT_URL/health"
echo "3. Deploy your frontend to your preferred platform"
echo ""
echo "🔧 To view logs: railway logs"
echo "🔧 To redeploy: railway up"
echo "🔧 To open dashboard: railway open"
