# Build stage
FROM node:22-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY swagger.json ./

RUN npm ci

COPY src/ src/

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/swagger.json ./

RUN npm cache clean --force

CMD [ "npm", "run", "start:prod" ] 