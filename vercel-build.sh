#!/bin/bash

echo "🚀 Starting Vercel build for AIStudyBuddy..."

# Install dependencies
echo "📦 Installing dependencies..."
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
