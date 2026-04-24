FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Fresh install inside Linux container — avoids macOS lockfile binary mismatch
# for lightningcss, tailwindcss-oxide, and other platform-specific packages
RUN npm ci
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
