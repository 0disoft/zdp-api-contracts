export function resolveRequestMetadataHeaders(contract, serviceId) {
    const scoped = contract.serviceRequestMetadataHeaders;
    return scoped && Object.hasOwn(scoped, serviceId)
        ? scoped[serviceId] ?? contract.requestMetadataHeaders
        : contract.requestMetadataHeaders;
}
//# sourceMappingURL=request-metadata-headers.js.map