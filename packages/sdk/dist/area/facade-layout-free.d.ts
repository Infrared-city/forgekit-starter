/**
 * Releasing a {@link FacadeLayout}'s wasm handle (TS stress test 2026-10-05,
 * a large dense-city fixture, 817 buildings, grid 3 m): 10 sequential
 * `synthesizeFacadeLayout()` calls in one Node process raised RSS 1.2 ->
 * 3.0 GB, +150-230 MB per call, never plateauing. `FacadeLayout` kept its
 * wasm-bindgen handle (the whole rebuilt layout, held in wasm linear memory)
 * alive forever and never freed it.
 *
 * `HandleGuard` below is the shared release logic `facade-layout.ts` uses:
 * an idempotent `free()`, plus a GC backstop for a caller that drops every
 * reference to a {@link FacadeLayout} without calling it. The backstop is
 * NOT the fix by itself -- wasm's linear memory is invisible to V8's GC
 * heuristics, so a tight loop like the stress test can run for a long time
 * before V8 ever schedules the GC pass that would run it. Call `free()` (or
 * use `using`) in any long-running process; see `docs/UPGRADING.md`, "Call
 * free() in long-running servers".
 */
/** The wasm-held layout: `.fields()` reads it, `.toBytes()` exports THAT
 * SAME held layout -- never a second synthesis pass (issue #707 "toBytes()
 * crash", D254). `.free()` is wasm-bindgen's own generated destructor
 * (every wasm-bindgen class gets one, and wasm-bindgen itself also installs
 * a `FinalizationRegistry` for it -- but see this module's docs for why
 * that alone is not enough here). */
export interface WasmFacadeLayoutHandle {
    fields(): unknown;
    toBytes(): Uint8Array;
    surfaceRenderBuffers(columns: unknown): unknown;
    free(): void;
}
/** One `FacadeLayout`'s wasm-handle lifecycle: registers the GC backstop
 * above and makes `free()` idempotent, whether called explicitly, via
 * `[Symbol.dispose]`, or (eventually, unreliably) by the backstop itself. */
export declare class HandleGuard {
    private readonly owner;
    private readonly handle;
    private freed;
    constructor(owner: object, handle: WasmFacadeLayoutHandle);
    get isFreed(): boolean;
    free(): void;
}
