FROM node:22-alpine
WORKDIR /app
COPY contracts ./contracts
COPY web/package.json web/package-lock.json ./web/
WORKDIR /app/web
RUN npm install

RUN rm -rf node_modules/@radarstock/contracts \
  && mkdir -p node_modules/@radarstock/contracts

COPY web ./
EXPOSE 3000
CMD ["npm", "run", "dev"]