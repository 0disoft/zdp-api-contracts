// Authentication, cookies and HTTP transport headers belong to their dedicated contracts.
const RESERVED_REQUEST_HEADERS = new Set([
    'authorization', 'proxy-authorization', 'proxy-authenticate', 'cookie', 'set-cookie',
    'accept', 'accept-encoding', 'content-type', 'content-length', 'content-encoding',
    'host', 'connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'te', 'trailer', 'upgrade'
]);
export function isReservedRequestHeaderName(name) {
    return RESERVED_REQUEST_HEADERS.has(name.toLowerCase());
}
//# sourceMappingURL=http-header-name.js.map