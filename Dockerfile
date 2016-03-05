FROM node:5.7.1

RUN apt-get update && apt-get install -y libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev build-essential g++
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app

EXPOSE 8888
CMD ["npm", "start"]
