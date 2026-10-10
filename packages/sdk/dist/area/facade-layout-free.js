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
const handleRegistry = new FinalizationRegistry((handle) => {
    handle.free();
});
/** One `FacadeLayout`'s wasm-handle lifecycle: registers the GC backstop
 * above and makes `free()` idempotent, whether called explicitly, via
 * `[Symbol.dispose]`, or (eventually, unreliably) by the backstop itself. */
export class HandleGuard {
    owner;
    handle;
    freed = false;
    constructor(owner, handle) {
        this.owner = owner;
        this.handle = handle;
        handleRegistry.register(owner, handle, owner);
    }
    get isFreed() {
        return this.freed;
    }
    free() {
        if (this.freed)
            return;
        this.freed = true;
        handleRegistry.unregister(this.owner);
        this.handle.free();
    }
}
