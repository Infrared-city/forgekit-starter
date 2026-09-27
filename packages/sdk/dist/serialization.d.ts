export declare function toCamelCase(value: string): string;
export declare function toKebabCase(value: string): string;
export declare function setOwnKey(target: Record<string, unknown>, key: string, value: unknown): void;
/** Convert a legacy SDK input to API wire keys without changing entity ids. */
export declare function serializeToKebab(value: unknown): unknown;
/** Convert wire response keys to camel case without changing the input. */
export declare function deserializeToCamelCase(value: unknown): unknown;
