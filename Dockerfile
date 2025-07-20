# Multi-stage Dockerfile for ChainHive
# Optimized for Render deployment

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY app.js ./

# Build frontend
RUN npm run build

# Stage 2: Production backend
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chainhive -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source
COPY api/ ./api/
COPY middleware/ ./middleware/
COPY services/ ./services/
COPY utils/ ./utils/
COPY config/ ./config/
COPY nodit-service.js ./
COPY healthcheck.js ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./public
COPY --from=frontend-builder /app/index.html ./public/
COPY --from=frontend-builder /app/app.js ./public/

# Change ownership to nodejs user
RUN chown -R chainhive:nodejs /app
USER chainhive

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "api/server.js"]