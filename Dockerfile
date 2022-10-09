FROM node:16

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3005

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get -y install google-chrome-stable

CMD [ "node", "index.js" ]