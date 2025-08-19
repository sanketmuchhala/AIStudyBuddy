# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all package.json and package-lock.json files
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build client and server
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
