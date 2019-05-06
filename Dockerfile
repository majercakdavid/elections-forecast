FROM node:10.14.2
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm install -g pm2
CMD npm run start-prod
EXPOSE 3000
