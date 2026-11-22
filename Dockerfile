# Stage 1: build the static site.
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
ARG RELEASE_VERSION
ENV BUILD_VERSION=$RELEASE_VERSION
RUN pnpm build

# Stage 2: serve it. Coolify takes its upstream port from the image's EXPOSE lines,
# so keep this on the nginx default (80) and don't EXPOSE anything else.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
