FROM node:20-alpine as build

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .
COPY shared/ ../shared

RUN npm run build


