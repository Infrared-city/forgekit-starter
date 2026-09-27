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
export declare function mapLimit<T, R>(values: readonly T[], limit: number, operation: (value: T, index: number) => Promise<R>): Promise<R[]>;
