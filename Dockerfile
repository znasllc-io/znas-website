FROM node:20-slim AS builder
WORKDIR /app
COPY package.json ./
# Use `npm install` (not `npm ci`) inside the Linux container. The
# package-lock.json is generated on macOS (Apple Silicon) and pins
# darwin-arm64 / darwin-x64 native binaries for lightningcss and
# @tailwindcss/oxide. `npm ci` is strict and refuses to deviate from
# the lockfile, so it would NOT install the linux-x64-gnu variants
# needed in this container, causing `Cannot find module 'lightningcss.linux-...'`
# at build time. `npm install` resolves platform-appropriate optional
# deps, which is what we need here. Reproducibility tradeoff is
# acceptable since the source of truth for deps is package.json.
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone server + static assets + public files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy proposal data (read at runtime by API routes)
COPY --from=builder /app/data ./data

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
