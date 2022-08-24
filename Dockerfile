FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn run build

FROM node:16-alpine AS server
WORKDIR /app
COPY package* ./
RUN yarn install --production
COPY --from=builder ./app/public ./public
COPY --from=builder ./app/build ./build
EXPOSE 8080
CMD ["yarn", "start"]