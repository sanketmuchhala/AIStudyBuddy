#!/bin/bash

# AI Study Buddy - Railway Full-Stack Deployment Script
# This script deploys both frontend and backend to Railway

echo "🚀 Starting Railway full-stack deployment for AI Study Buddy..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

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

# Set environment variables for AI functionality
echo "🔧 Setting up environment variables..."

echo "Setting default AI provider to mock (you can change this later)..."
railway variables set PROVIDER=mock
railway variables set NODE_ENV=production

echo ""
echo "⚠️  IMPORTANT: Set your AI API keys in Railway dashboard:"
echo "1. Go to your Railway project dashboard"
echo "2. Navigate to Variables tab"
echo "3. Add your API keys:"
echo "   - GEMINI_API_KEY (for Google Gemini)"
echo "   - OPENAI_API_KEY (for OpenAI)"
echo "4. Set PROVIDER to 'gemini' or 'openai' (currently set to 'mock')"
echo ""

# Deploy the application
echo "🚀 Deploying full-stack application to Railway..."
railway up

# Get the deployment URL
echo "📋 Getting deployment URL..."
DEPLOYMENT_URL=$(railway domain)

echo "✅ Deployment complete!"
echo "🌐 Your full-stack app is available at: $DEPLOYMENT_URL"
echo ""
echo "📝 Next steps:"
echo "1. Visit Railway dashboard to set your AI API keys"
echo "2. Change PROVIDER variable from 'mock' to 'gemini' or 'openai'"
echo "3. Test the app at: $DEPLOYMENT_URL"
echo "4. Test health endpoint: $DEPLOYMENT_URL/healthz"
echo ""
echo "🔧 Useful commands:"
echo "🔧 View logs: railway logs"
echo "🔧 Redeploy: railway up"
echo "🔧 Open dashboard: railway open"
