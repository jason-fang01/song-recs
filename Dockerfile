FROM node:lts

LABEL authors="n10755888"

WORKDIR /src

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 80

CMD ["npm", "start"]
