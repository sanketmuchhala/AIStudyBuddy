# Multi-stage Dockerfile for Railway deployment
# Stage 1: Build client
FROM node:18-alpine as client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./
RUN npm ci --only=production

# Copy client source and build
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine as server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server source and build
COPY server/ ./
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built server
COPY --from=server-builder /app/server/dist ./dist

# Copy built client
COPY --from=client-builder /app/client/dist ./client/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]