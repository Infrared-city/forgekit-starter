/** The statuses whose `Response` must have no body. */
const NULL_BODY_STATUS = new Set([101, 204, 205, 304]);
function responseHeaders(raw) {
    const headers = new Headers();
    for (const line of raw.split(/\r?\n/)) {
        const colon = line.indexOf(":");
        if (colon <= 0)
            continue;
        try {
            headers.append(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
        }
        catch {
            // A header the Fetch API refuses is not one this SDK reads.
        }
    }
    return headers;
}
function sameUrl(a, b) {
    try {
        return new URL(a).href === new URL(b).href;
    }
    catch {
        return a === b;
    }
}
export const xhrSender = {
    // A redirect is followed, and the body sent again, before this code sees
    // it: `bodySenderFor` gives this sender only a body that is safe to resend.
    observesProgress: true,
    send(request, progress) {
        return new Promise((resolve, reject) => {
            if (request.signal.aborted) {
                reject(new Error("request stopped"));
                return;
            }
            const xhr = new XMLHttpRequest();
            const total = request.body.byteLength;
            const onAbort = () => xhr.abort();
            const settled = () => request.signal.removeEventListener("abort", onAbort);
            xhr.open(request.method, request.url);
            xhr.responseType = "arraybuffer";
            // No cookies or HTTP auth go to another origin. XHR still sends them to
            // the page's own origin, so `bodySenderFor` never gives it one.
            xhr.withCredentials = false;
            request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));
            xhr.upload.onprogress = (event) => progress.progress(event.loaded);
            xhr.upload.onload = () => progress.progress(total);
            xhr.onload = () => {
                settled();
                progress.finished();
                // XHR follows a redirect itself. Answer as a browser `fetch` with
                // `redirect: "manual"` does: status 0, never the redirected answer.
                if (xhr.responseURL !== "" && !sameUrl(xhr.responseURL, request.url)) {
                    resolve(Response.error());
                    return;
                }
                const body = NULL_BODY_STATUS.has(xhr.status) ? null : xhr.response;
                try {
                    resolve(new Response(body, {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: responseHeaders(xhr.getAllResponseHeaders()),
                    }));
                }
                catch (error) {
                    reject(error);
                }
            };
            xhr.onerror = () => {
                settled();
                reject(new Error("the request failed"));
            };
            xhr.onabort = () => {
                settled();
                reject(new Error("request stopped"));
            };
            request.signal.addEventListener("abort", onAbort, { once: true });
            xhr.send(request.body);
        });
    },
};
