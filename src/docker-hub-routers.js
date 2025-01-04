import { DOCKER_HUB_REGISTRY, SERVER_URL, PROXY_URL, DOCKER_HUB_AUTH, DOCKER_REGISTRY_SERVICE } from './config.js';
import { defaultProxiedHeadersFrom, reversedProxy } from './proxy.js';
import { socksDispatcher } from 'fetch-socks';
import * as url from 'node:url';
import express from 'express';
import { ProxyAgent } from 'undici';
import { reportException } from './utils.js';

function makeProxyDispatcher(url) {
    const proxyUrl = new URL(url);

    if (proxyUrl.protocol == 'http:' || proxyUrl.protocol == 'https:') {
        return new ProxyAgent(url);
    }

    if (proxyUrl.protocol == 'socks:' || proxyUrl.protocol == 'socks5:' || proxyUrl.protocol == 'socks4:') {
        return socksDispatcher({
            type: proxyUrl.protocol == 'socks4' ? 4 : 5,
            host: proxyUrl.hostname,
            port: Number.parseInt(proxyUrl.port),

            ...(proxyUrl.username ? { userId: proxyUrl.username } : {}),
            ...(proxyUrl.password ? { password: proxyUrl.password } : {}),
        });
    }

    console.warn(`Unrecognized proxy ${url}`);
}

const dispatcher = makeProxyDispatcher(PROXY_URL);
const router = express.Router();

const dockerRegistryHostname = new URL(DOCKER_HUB_REGISTRY).hostname;
const dockerAuthHostname = new URL(DOCKER_HUB_REGISTRY).hostname;

router.get('/auth/token', async (req, res) => {
    console.log('PROXIED TOKEN');

    try {
        const queryString = url.parse(req.url).query;

        await reversedProxy(res, {
            targetUrl: `${DOCKER_HUB_AUTH}?${queryString}`,
            requestHeaders: {
                ...req.headers,
                ...defaultProxiedHeadersFrom(req)
            },
            requestRewriteHeaders: {
                'host': dockerAuthHostname
            },
            fetchOptions: { dispatcher }
        });
    } catch (err) {
        reportException(res, err);
    }
});

router.use(async (req, res) => {
    const url = new URL(DOCKER_HUB_REGISTRY + req.url);

    console.log('PROXIED TO', url.toString());

    try {
        await reversedProxy(res, {
            targetUrl: url,
            requestHeaders: {
                ...req.headers,
                ...defaultProxiedHeadersFrom(req)
            },
            requestRewriteHeaders: {
                'host': dockerRegistryHostname
            },
            responseRewriteHeaders: {
                'www-authenticate': _ => `Bearer realm="${SERVER_URL}/auth/token",service="${DOCKER_REGISTRY_SERVICE}"`
            },
            fetchOptions: { dispatcher }
        });
    } catch (err) {
        reportException(res, err);
    }
});

export default router;
