FROM alpine:latest

ARG NPM_CONFIG_REGISTRY
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY

WORKDIR /app

COPY package.json ./

RUN apk add --no-cache --update nodejs npm && \
    npm install
COPY ./src ./

EXPOSE 43213
CMD ["node", "index"]