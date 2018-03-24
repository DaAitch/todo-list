FROM node:carbon

WORKDIR /usr/src/app

COPY ./lib/server.tar.gz .
RUN mkdir server \
    && (cd server && tar xzf ../server.tar.gz) \
    && rm server.tar.gz

COPY ./lib/client.tar.gz .
RUN mkdir client \
    && (cd client && tar xzf ../client.tar.gz) \
    && rm client.tar.gz

RUN mkdir ssl
COPY ./lib/cert.pem ./ssl/cert.pem
COPY ./lib/key.pem ./ssl/key.pem

RUN mkdir /usr/src/app/server/logs

ENV TODOLIST_MONGO_URL=mongodb://mongo:27017
ENV TODOLIST_MONGO_DB=todolist
ENV TODOLIST_DOCUMENT_DIR=/usr/src/app/client
ENV TODOLIST_BIND_HOST=0.0.0.0
ENV TODOLIST_BIND_PORT=8080
ENV TODOLIST_SSL_CERT=/usr/src/app/ssl/cert.pem
ENV TODOLIST_SSL_KEY=/usr/src/app/ssl/key.pem
ENV TODOLIST_SSL_PASSPHRASE=todo

EXPOSE 8080
ENTRYPOINT [ "node", "server/src/app.js" ]