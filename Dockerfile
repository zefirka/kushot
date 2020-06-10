FROM node:12
WORKDIR /app

ADD . /app
RUN npm install --only=prod
CMD npm start