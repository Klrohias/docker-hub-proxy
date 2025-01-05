import process from 'node:process';
const { DHPROXY_UPSTREAM, DHPROXY_ROOT, DHPROXY_PORT } = process.env;

const PORT = DHPROXY_PORT ? Number.parseInt(DHPROXY_PORT) : 43213;
const PROXY_URL = DHPROXY_UPSTREAM;
const DOCKER_HUB_REGISTRY = 'https://registry-1.docker.io';
const DOCKER_HUB_AUTH = 'https://auth.docker.io/token';
const DOCKER_REGISTRY_SERVICE = 'registry.docker.io';
const SERVER_URL = DHPROXY_ROOT;

export { PORT, PROXY_URL, DOCKER_HUB_REGISTRY, SERVER_URL, DOCKER_HUB_AUTH, DOCKER_REGISTRY_SERVICE };
