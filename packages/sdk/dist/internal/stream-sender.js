/** Bytes per pulled block; progress is reported once per block. */
const BLOCK_BYTES = 64 * 1024;
export function streamSender(fetcher) {
    return {
        observesProgress: true,
        async send(request, progress) {
            const body = request.body;
            const total = body.byteLength;
            let offset = 0;
            const stream = new ReadableStream({
                pull(controller) {
                    // The connection took every block offered before this pull.
                    progress.progress(offset);
                    if (offset >= total) {
                        controller.close();
                        return;
                    }
                    const end = Math.min(offset + BLOCK_BYTES, total);
                    controller.enqueue(body.subarray(offset, end));
                    offset = end;
                },
            }, { highWaterMark: 0 });
            const headers = new Headers(request.headers);
            headers.set("content-length", String(total));
            const init = {
                method: request.method,
                headers,
                body: stream,
                duplex: "half",
                credentials: request.credentials,
                redirect: "manual",
                signal: request.signal,
            };
            const response = await fetcher(request.url, init);
            // An answer before the last pull (an early 413, an S3 error) ends the send.
            progress.finished();
            return response;
        },
    };
}
