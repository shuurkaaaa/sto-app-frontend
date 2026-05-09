# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# Install deps (cached layer)
COPY package*.json ./
RUN npm install

# Copy Prisma schema first so we can generate the client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source
COPY . .

EXPOSE 5000

# Sync schema (creates any missing tables) then run the server
CMD ["sh", "-c", "mkdir -p /app/data && npx prisma db push --accept-data-loss --skip-generate && node index.js"]
