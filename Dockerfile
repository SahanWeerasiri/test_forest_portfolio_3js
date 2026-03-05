# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN rm -f package-lock.json
RUN npm i
RUN npm run build

# Runtime stage
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 80
CMD ["npm", "start"]