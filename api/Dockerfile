FROM node:22-alpine
WORKDIR /app
COPY contracts ./contracts
WORKDIR /app/contracts
RUN npm ci

WORKDIR /app
COPY api/package.json api/package-lock.json ./api/
WORKDIR /app/api
RUN npm install

RUN rm -rf node_modules/@radarstock/contracts \
  && mkdir -p node_modules/@radarstock/contracts \
  && cp -a /app/contracts/. node_modules/@radarstock/contracts/

COPY api ./
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev"]
