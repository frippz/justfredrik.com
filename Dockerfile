FROM node:10.16-alpine

WORKDIR /web

RUN npm install -g yarn@1.17.3
