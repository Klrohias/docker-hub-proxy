# Builder
FROM alpine:latest AS builder

ARG NPM_CONFIG_REGISTRY
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY

WORKDIR /app

COPY . . 

RUN apk add --no-cache --update nodejs npm && \
    npm install && \
    node esbuild.build.mjs

# Production
FROM alpine:latest AS prod

RUN apk add --no-cache --update nodejs
COPY --from=builder /app/dist/bundle.js .

EXPOSE 43213
CMD ["node", "bundle"]