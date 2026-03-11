# Dockerfile
FROM node:20

WORKDIR /apps

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/auth/package.json ./packages/auth/package.json

RUN npm install

EXPOSE 3000
