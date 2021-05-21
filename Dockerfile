# Zadanie 5.2

FROM node

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

CMD node Zadanko2.js

EXPOSE 4000