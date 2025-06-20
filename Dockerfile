# ---- Base Stage ----
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Production Dependencies Stage ----
# This stage needs prisma CLI to run migrations
FROM base AS production-deps
COPY pnpm-lock.yaml ./
COPY package.json ./
# Install ALL dependencies here, as prisma CLI is a devDependency
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- Build Stage ----
FROM deps AS build
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# ---- Production Stage ----
FROM node:20-slim AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app

# We need the full node_modules from production-deps to run migrations
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

# Copy the entrypoint script
COPY docker/docker-entrypoint.sh .
# Ensure it's executable inside the container
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

# The ENTRYPOINT is the script that runs first
ENTRYPOINT ["./docker-entrypoint.sh"]

# The CMD is the command that gets passed to the entrypoint script
CMD ["node", ".output/server/index.mjs"]
