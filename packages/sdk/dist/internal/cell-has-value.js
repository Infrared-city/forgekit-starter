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
export function cellHasValue(dtype, data, valid, cell) {
    switch (dtype) {
        case "i16":
            return ((valid[cell >> 3] >> (cell & 7)) & 1) === 1;
        case "f16":
            return (data[cell] & 0x7fff) <= 0x7c00;
        default:
            return !Number.isNaN(data[cell]);
    }
}
