#!/bin/bash

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database
npm run db:seed

# Build the Next.js app
npm run build