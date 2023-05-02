FROM node:19-alpine
WORKDIR /app
COPY . .
RUN yarn install
WORKDIR /app/client
RUN yarn install
RUN yarn build
CMD ["node", "index.js"]
EXPOSE 4001
