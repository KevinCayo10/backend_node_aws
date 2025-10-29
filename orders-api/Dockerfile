FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY prisma ./prisma

EXPOSE 3002

CMD ["npm", "run", "start"]


