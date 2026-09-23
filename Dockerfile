# Stage 1: Builder
FROM node:24-slim AS builder
WORKDIR /app

# Copy package.json & lock file first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app and build
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:24-slim AS runner
WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Copy only the traced production server and static assets.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# The custom HTTPS server loads Next directly and needs its compiled runtime
# modules, which are not always included by standalone tracing.
COPY --from=builder /app/node_modules/next/dist/compiled ./node_modules/next/dist/compiled

# Copy server scripts
COPY server-https.js ./server-https.js
COPY entrypoint-https.sh ./entrypoint-https.sh
RUN chmod +x ./entrypoint-https.sh

EXPOSE 3000

# Entrypoint for docker run / docker-compose
CMD ["/bin/sh", "/app/entrypoint-https.sh"]
