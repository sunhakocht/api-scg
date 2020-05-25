FROM node:10.16.3

WORKDIR /app

COPY . /app

RUN yarn install

CMD ["yarn","dev"]
