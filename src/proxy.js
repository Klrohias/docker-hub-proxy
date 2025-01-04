import { Readable } from 'node:stream';

function proxyMakeHeaders(originalHeaders, rewriteHeaders) {
    if (!rewriteHeaders) return originalHeaders;

    const headers = {};
    for (const key in originalHeaders) {
        const lowerCaseKey = key.toLowerCase();
        if (lowerCaseKey in rewriteHeaders) {
            const rewrite = rewriteHeaders[lowerCaseKey];
            headers[key] = typeof rewrite === 'function'
                ? rewrite(originalHeaders[key])
                : rewrite;
        } else {
            headers[key] = originalHeaders[key];
        }
    }

    return headers;
}

export function defaultProxiedHeadersFrom(req) {
    return {
        'X-Real-IP': req.ip,
        'X-Forward-For': req.ip,
        'X-Forward-Proto': req.protocol
    };
}

export async function reversedProxy(output, { targetUrl, requestHeaders, requestRewriteHeaders, responseRewriteHeaders, fetchOptions }) {
    const outgoingHeaders = proxyMakeHeaders(requestHeaders, requestRewriteHeaders);
    const response = await fetch(targetUrl, { ...fetchOptions, headers: outgoingHeaders });
    const responseHeaders = Object.fromEntries(response.headers);
    const ingoingHeaders = proxyMakeHeaders(responseHeaders, responseRewriteHeaders);

    output.writeHead(response.status, ingoingHeaders);
    Readable.fromWeb(response.body).pipe(output);
}