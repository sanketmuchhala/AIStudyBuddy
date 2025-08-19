#!/bin/bash

# Railway deployment script with service creation
echo "🚀 Deploying AIStudyBuddy to Railway..."

# Check Railway login
if ! railway whoami > /dev/null 2>&1; then
    echo "❌ Please login to Railway first: railway login"
    exit 1
fi

# Try to deploy with common service names
SERVICE_NAMES=("web" "app" "backend" "main" "production" "server")

for service in "${SERVICE_NAMES[@]}"; do
    echo "🔍 Trying to deploy to service: $service"
    if railway up --service "$service" --detach 2>/dev/null; then
        echo "✅ Successfully deployed to service: $service"
        
        # Get deployment URL
        echo "🌐 Getting deployment URL..."
        railway domain --service "$service" 2>/dev/null || echo "Domain will be available shortly"
        
        echo "🎉 Deployment completed!"
        exit 0
    fi
done

echo "⚠️  No existing services found. Please create a service manually:"
echo "1. Run: railway add"
echo "2. Select 'Empty Service'"
echo "3. Name it 'web'"
echo "4. Then run: railway up --service web"

exit 1