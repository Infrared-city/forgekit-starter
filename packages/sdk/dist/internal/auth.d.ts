/** Request authentication kept in TypeScript, outside shared WASM state. */
export type InfraredSurface = "platform" | "webapp" | "grasshopper" | "revit" | "qgis" | "arcgis" | "sketchup" | "archicad" | "script" | "cli";
export interface AuthOptions {
    readonly apiKey?: string;
    readonly token?: string;
    readonly getToken?: () => string | Promise<string>;
    readonly surface?: InfraredSurface;
}
export type AuthHeaders = Readonly<Record<string, string>>;
export type AuthResolver = () => Promise<AuthHeaders>;
/** Internal pre-dispatch signal that a dynamic credential selected another cache partition. */
export declare class AuthPartitionChangedError extends Error {
    readonly name = "AuthPartitionChangedError";
    constructor();
}
/** Build an authentication resolver that evaluates dynamic JWTs per request. */
export declare function buildAuthResolver(options: AuthOptions): AuthResolver;
