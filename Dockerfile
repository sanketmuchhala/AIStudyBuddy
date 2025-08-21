# Multi-stage build for Railway deployment
FROM node:18-alpine AS base

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production && \
    cd client && npm ci && \
    cd ../server && npm ci

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Build server
RUN cd server && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=appuser:nodejs /app/server/package*.json ./server/
COPY --from=builder --chown=appuser:nodejs /app/client/dist ./client/dist

# Install only production dependencies
RUN cd server && npm ci --only=production

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/healthz || exit 1

# Start the application
CMD ["node", "server/dist/index.js"]
