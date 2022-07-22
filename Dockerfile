FROM node:14

RUN mkdir -p /app/src

WORKDIR /app/src

COPY package.json .

RUN yarn

RUN npm rebuild bcrypt --build-from-source

COPY . .

WORKDIR /app/src/muffin-utils

RUN yarn

RUN yarn build

RUN yarn link

WORKDIR /app/src

RUN yarn link muffin-utils

RUN yarn build

EXPOSE 8545

EXPOSE 8546

CMD ["yarn", "serve"]
