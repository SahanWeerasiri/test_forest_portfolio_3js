# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN rm -f package-lock.json
RUN npm i 
RUN npm run build