FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS production
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]

FROM base AS development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
