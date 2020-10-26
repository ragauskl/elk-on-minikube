# docker build -t elk-api:latest .
FROM mhart/alpine-node:14

ADD ./dist ./dist
ADD ./package.json .
ADD ./package-lock.json .

RUN npm install --only=production
EXPOSE 80
ENTRYPOINT npm start
