FROM node:12
WORKDIR /app

ADD . /app
RUN npm install
CMD npm start