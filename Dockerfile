# Dockerfile for School Attendance & Workforce OS
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Build frontend and server assets
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src

# Install tsx runner for clean TypeScript server execution
RUN npm install -g tsx

EXPOSE 3000

CMD ["tsx", "server.ts"]
