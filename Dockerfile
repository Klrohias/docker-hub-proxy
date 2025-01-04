FROM node:20-alpine

ARG NPM_CONFIG_REGISTRY
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./src ./

EXPOSE 43213

CMD ["node", "index"]