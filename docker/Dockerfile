# syntax=docker/dockerfile:1

# ============================================
# Base stage - Install dependencies
# ============================================
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ============================================
# Development stage - Hot reload
# ============================================
FROM base AS development
WORKDIR /app

# Copy all source files
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Start dev server
CMD ["bun", "run", "dev"]

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
RUN bun run build

# ============================================
# Production stage - Minimal runtime
# ============================================
FROM oven/bun:1-slim AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"

# Start server
CMD ["bun", "server.js"]

