/** One POST. An HTTP error answer is returned, not thrown. */
export async function dispatchKeyed(options) {
    return options.gateway.requestBytesWithHeaders(options.endpointPath, {
        method: "POST",
        headers: options.headers,
        body: options.body,
        acceptHttpErrors: true,
        ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
}
