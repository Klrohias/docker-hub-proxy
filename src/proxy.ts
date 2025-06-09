import { Readable } from 'node:stream';
import { type ReadableStream } from 'node:stream/web'
import { DEVELOPMENT } from '@/config';

type HeaderValue = string[] | string;

export interface OriginalHeaders {
    [key: string]: HeaderValue;
}

export interface RewriteHeaders {
    [key: string]: HeaderValue | ((value: HeaderValue) => HeaderValue);
}

function proxyMakeHeaders(originalHeaders: OriginalHeaders, rewriteHeaders: RewriteHeaders) {
    if (!rewriteHeaders) return originalHeaders;

    const headers: OriginalHeaders = {};
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

export function forwardedHeaders(req): OriginalHeaders {
    return {
        'X-Real-IP': req.ip,
        'X-Forward-For': req.ip,
        'X-Forward-Proto': req.protocol
    };
}

export async function reversedProxy(
    output: any,
    { targetUrl, requestHeaders, requestRewriteHeaders, responseRewriteHeaders, fetchOptions }: {
        targetUrl: string | URL | globalThis.Request;
        requestHeaders?: OriginalHeaders;
        requestRewriteHeaders?: RewriteHeaders;
        responseRewriteHeaders?: RewriteHeaders;
        fetchOptions?: any;
    }) {
    const outgoingHeaders = proxyMakeHeaders(requestHeaders, requestRewriteHeaders);
    
    if (DEVELOPMENT) {
        console.log('[DEVELOPMENT] Request headers:', outgoingHeaders);
    }
    
    const response = await fetch(targetUrl, { ...fetchOptions, headers: outgoingHeaders });
    const responseHeaders = Object.fromEntries(response.headers);
    const ingoingHeaders = proxyMakeHeaders(responseHeaders, responseRewriteHeaders);
    
    if (DEVELOPMENT) {
        console.log('[DEVELOPMENT] Response headers: ', ingoingHeaders);
    }
    
    output.writeHead(response.status, ingoingHeaders);
    
    if (DEVELOPMENT.includes && DEVELOPMENT.includes(ingoingHeaders['content-type'])) {
        const text = await response.text();
        console.log('[DEVELOPMENT] Response text:', text);
        output.end(text);
        return;
    }
    
    Readable.fromWeb(response.body as ReadableStream).pipe(output);
}