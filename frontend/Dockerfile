# Multi-stage build for Next.js Frontend
# STAGE 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install native build dependencies for Alpine Linux
RUN apk add --no-cache libc6-compat python3 make g++

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# STAGE 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# IMPORTANT: Set a placeholder for NEXT_PUBLIC_POCKETBASE_URL during build
# This will be overridden at runtime using the public runtime config approach
ARG NEXT_PUBLIC_POCKETBASE_URL
ENV NEXT_PUBLIC_POCKETBASE_URL=${NEXT_PUBLIC_POCKETBASE_URL}

# Build the application with dynamic rendering (skip static generation)
RUN npm run build

# STAGE 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3669

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown nextjs:nodejs /docker-entrypoint.sh

# Switch to non-root user
USER nextjs

EXPOSE 3669

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application using entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]