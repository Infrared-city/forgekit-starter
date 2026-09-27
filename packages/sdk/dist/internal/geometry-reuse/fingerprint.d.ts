/**
 * A cheap content fingerprint of a plain JSON value: a 64-bit hash (two
 * 32-bit lanes) over every key, string, number and array length, in the order
 * `JSON.stringify` writes them.
 *
 * It guards the memos keyed on a caller's object (the group identity memo,
 * `identity.ts`, and the prepared-site digest memo, `area/prepared-site.ts`,
 * D104). A caller can change such an object in place between two calls; the
 * memo then compares the fingerprint and computes the value again when the
 * content changed. The fingerprint is NOT an identity and is never sent: it
 * only decides whether a memoised value is still the value of the current
 * content. On F3 the walk takes about a fifth of the time of
 * `JSON.stringify` and SHA-256 of the same value (D182).
 *
 * `undefined` when the value is not plain JSON (a class instance, a `toJSON`,
 * a getter, a function, a cycle): the caller then must not use the memo.
 * An accessor at an ARRAY index is not checked: one descriptor read per
 * element makes the walk as slow as no memo (565 against 160 ms a warm F3
 * site key). Such an array is not JSON data, and the area path reads each
 * input more than once with or without this memo, so a value that changes
 * between reads is not a supported input (D182). The same holds for a Proxy
 * whose traps answer two reads differently: there is no trust boundary here,
 * because the caller who writes such a Proxy also writes the payload.
 */
export declare function contentFingerprint(value: unknown): string | undefined;
