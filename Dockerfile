# Dead Drop backend container image for Railway deployment
FROM node:20-alpine AS base

WORKDIR /app/backend

# Install dependencies first to leverage Docker layer caching
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source
COPY backend/ ./

ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_FILE_PATH=/data/dead-drop-data.json

# Provide a mount point for persistent JSON storage
VOLUME /data

EXPOSE 4000

CMD ["node", "server.js"]
