FROM node:lts

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm i
COPY . .

ENTRYPOINT ["./entrypoint.sh"]
