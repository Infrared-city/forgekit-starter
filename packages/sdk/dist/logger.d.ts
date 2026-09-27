export interface Logger {
    readonly debug: (...args: unknown[]) => void;
    readonly info: (...args: unknown[]) => void;
    readonly warn: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
}
export declare const silentLogger: Logger;
export declare const consoleLogger: Logger;
