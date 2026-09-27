/**
 * Ordered concurrency, one worker pool.
 *
 * Its own module so the geodata layer can use it without importing the
 * service layer (and with it the gateway transport and the credential
 * resolver) into the credential-free public-data entry point.
 */
/**
 * Run an ordered list with a fixed concurrency ceiling.
 *
 * The output is indexed by the INPUT position, never by completion order:
 * the callers that read public data assemble documents whose feature order
 * is part of the contract, so a faster answer must not overtake a slower
 * one in the result.
 */
export async function mapLimit(values, limit, operation) {
    if (!Number.isSafeInteger(limit) || limit < 1)
        throw new TypeError("maxWorkers must be positive");
    const output = new Array(values.length);
    let next = 0;
    async function worker() {
        while (next < values.length) {
            const index = next++;
            output[index] = await operation(values[index], index);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
    return output;
}
