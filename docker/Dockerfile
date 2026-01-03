# syntax=docker/dockerfile:1

# ============================================
# Base stage - Install dependencies
# ============================================
FROM node:20-slim AS base
WORKDIR /app

# Install bun for faster installs
RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ============================================
# Builder stage - Build production bundle
# ============================================
FROM base AS builder
WORKDIR /app

# Copy source files
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ============================================
# Production stage - Minimal runtime
# ============================================
FROM node:20-slim AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/db/migrations ./src/db/migrations

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"

# Start server
CMD ["node", "server.js"]
