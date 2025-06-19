
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the Nuxt.js application
RUN pnpm run build

# Stage 2: Run the application
FROM node:lts-alpine AS runner

# Set working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/.output ./

# Install only production dependencies (if needed for your setup)
# You might not need this if your build output is self-contained
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install  --frozen-lockfile

# Set environment variables for production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Command to run the Nuxt.js application
CMD ["node", "./server/index.mjs"]
