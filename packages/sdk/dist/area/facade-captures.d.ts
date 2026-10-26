import { type WasmCore } from "../internal/core.js";
type KernelStore = InstanceType<WasmCore["CaptureStore"]>;
/**
 * The facade captures of one client, in one capture store.
 *
 * @category Facade layout
 */
export declare class FacadeCaptures {
    private kernel;
    private readonly asked;
    private readonly lost;
    get store(): KernelStore;
    /** The number of jobs that hold a capture. */
    get jobCount(): number;
    /** The bytes held: the distinct captures and the syntheses made from them. */
    get heldBytes(): number;
    /** Keep the capture of an accepted job. `cellTris`: the run asked for the per-cell triangles. */
    remember(jobId: string, capture: Uint8Array, cellTris: boolean): void;
    /** Release a job's capture that no merge will use. */
    forget(jobId: string): void;
    /** Whether the capture of this accepted job was not kept (the store refused it). */
    lostCapture(jobId: string): boolean;
    /** Release every capture of a schedule you will not merge. */
    forgetSchedule(schedule: {
        readonly jobs: ReadonlyMap<string, {
            readonly jobId?: string | undefined;
        }>;
    }): void;
    /** Whether any of these jobs asked for the per-cell triangles. */
    wantsCellTris(jobIds: ReadonlyArray<string | undefined>): boolean;
    /** Free the held captures. Call it when you are done with the client. */
    free(): void;
}
export {};
