/** Split out of `merge.ts` for the 400-line cap: what the area merges share. */
export function throwable(error) {
    return error instanceof Error ? error : new Error(String(error));
}
