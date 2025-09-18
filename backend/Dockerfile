# Backend Dockerfile
FROM node:20-bookworm-slim

WORKDIR /app

# System deps for native modules and Prisma (OpenSSL)
RUN apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
		 python3 make g++ openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies separately for caching
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci || npm install

# Copy source
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build (tsc output goes to dist)
RUN npm run build || npx tsc

EXPOSE 3000
CMD ["npm", "run", "start"]
