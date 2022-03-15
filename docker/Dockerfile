FROM node:16

EXPOSE 3003

WORKDIR /code

ENV PORT 3003

RUN git clone https://github.com/stevenwsinha/tic-tac-toe.git /code

RUN npm install

CMD ["node", "index.js"]