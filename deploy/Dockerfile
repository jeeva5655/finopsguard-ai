# FinOpsGuard AI - Unified Production Container for AWS App Runner
FROM node:22-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production
COPY backend/ ./backend/
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "backend/server.js"]
