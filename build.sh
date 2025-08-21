#!/bin/bash

echo "🚀 Starting Vercel build for AIStudyBuddy..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci

# Build server
echo "🔧 Building server..."
cd server
npm ci
npm run build
cd ..

# Build client
echo "🎨 Building client..."
cd client
npm ci
npm run build
cd ..

echo "✅ Build completed successfully!"
