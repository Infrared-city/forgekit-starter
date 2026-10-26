/**
 * Tells whether one cell of a wire-dtype value array has a value. The check
 * runs on the host: it reads raw bits and computes no value, so a kernel call
 * per cell would cost more than this test.
 *
 * - `"i16"`: the `valid` bitmap says so (bit set = value).
 * - `"f16"`: the cell is raw half bits; a half NaN has all exponent bits set
 *   and a mantissa that is not zero.
 * - other types: the cell has a value when it is not NaN.
 *
 * @internal
 */
export declare function cellHasValue(dtype: "f16" | "f32" | "i16" | "f64", data: ArrayLike<number>, valid: Uint8Array | undefined, cell: number): boolean;
