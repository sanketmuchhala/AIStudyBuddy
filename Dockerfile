# Optimized Dockerfile for Railway deployment
FROM node:18-alpine

WORKDIR /app

# Set memory-efficient npm settings
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_PROGRESS=false
ENV NODE_OPTIONS="--max_old_space_size=1024"

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy all package files first
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies with memory optimization
RUN npm ci --prefer-offline --no-audit --progress=false && \
    cd client && npm ci --prefer-offline --no-audit --progress=false && \
    cd ../server && npm ci --prefer-offline --no-audit --progress=false && \
    npm cache clean --force

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build client
RUN cd client && npm run build

# Build server  
RUN cd server && npm run build

# Remove dev dependencies and source files to save space
RUN cd client && npm prune --production && rm -rf src/ && \
    cd ../server && npm prune --production && rm -rf src/ && \
    npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Change ownership
RUN chown -R appuser:nodejs /app

USER appuser

# Expose port
EXPOSE 8080

# Simplified health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the application
CMD ["node", "server/dist/index.js"]