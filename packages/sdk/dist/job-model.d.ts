/** The job data model: the shapes a caller sees (`Job`, `JobStatus`,
 * `PreparedSubmission`) and the two pure guards that read them.
 *
 * Split out of `jobs.ts` (rule 8, 400-line cap) by a pure move: that file
 * keeps the service, this one keeps the shapes the service moves around.
 * `jobs.ts` re-exports every public name from here, so the package surface
 * is unchanged.
 *
 * Type-only imports by construction — this module pulls in no runtime
 * dependency, so it adds no edge to the import graph `jobs.ts` sits in.
 */
import type { PreparedBinary } from "./internal/binary-submission.js";
import type { ArtifactLimits, TileArtifact } from "./internal/binary-artifact.js";
import type { TreeBoxSubstitution } from "./internal/tree-boxes.js";
import type { BinaryAcknowledgement } from "./job-options.js";
export declare const JobStatus: {
    readonly Pending: "pending";
    readonly Running: "running";
    readonly Succeeded: "succeeded";
    readonly Failed: "failed";
    readonly Unknown: "unknown";
};
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
export interface Job {
    readonly jobId: string;
    readonly modelName: string;
    readonly status: JobStatus;
    readonly requestedAt: string;
    readonly startedAt?: string;
    readonly finishedAt?: string;
    readonly resultsUrl?: string;
    readonly error?: string;
    readonly binary?: BinaryAcknowledgement;
    /**
     * What the tree -> box substitution did for THIS job, or absent when it did
     * nothing (D70). Client-side only: it is filled in from the kernel's own
     * answer at submission, never parsed from a response and never sent. A
     * caller reads it to see that a binary wind or PWC run carried boxes where
     * it asked for trees.
     */
    readonly treeBoxes?: TreeBoxSubstitution;
}
/** A validated and mesh-packed request body that is ready for transport. */
export interface PreparedSubmission {
    readonly analysisType: string;
    readonly body: Readonly<Record<string, unknown>>;
    /** Stable host scope for compatible geometry history. */
    readonly reuseScope?: string;
    readonly transport: "json" | "binary";
    /**
     * The tile's binary artifact from the prepared site (D101), for a body an
     * area plan built; a direct submission has none and the kernel encodes the
     * body itself. `boxTrees` is the live capability's answer for the model.
     */
    readonly artifact?: (boxTrees: boolean, limits: ArtifactLimits) => TileArtifact;
    /**
     * The exact JSON wire text of `body`, when the kernel wrote it (a
     * daylight-factor part, `daylightPartBody`, D221), or the text this SDK
     * already wrote once to plan the parts. The JSON route sends these bytes
     * instead of writing `body` again; `body` stays for every reader that needs
     * a value. A direct submission has none.
     */
    readonly json?: () => Uint8Array;
    /**
     * An interior binary part, already prepared (D228): the scene archive
     * (shared with every other part of the same run) and this part's own
     * control, both built by the kernel (`interiorArtifact`, `daylightPartBody`
     * — `parts/interior-binary.ts`). Set only on a daylight-factor part the
     * live capability routed to the binary transport; `submitPrepared` sends
     * it with `resultFormat: "json"` instead of taking the outdoor route's
     * `artifact`/`body` path. Absent on every other submission.
     */
    readonly interiorBinary?: PreparedBinary;
    /** The result family an interior binary part asks for (D234); unset = `"json"`. */
    readonly interiorResultFormat?: "irbf" | "json";
}
/** Attach the substitution record to a job the binary route just accepted.
 *
 * Client-side only (D70): the server neither sends nor reads it, so it is
 * merged in here rather than parsed out of the acknowledgement. The record
 * lives on the PREPARED BINARY, because that is the object built after the
 * capability document decided whether to box at all.
 */
export declare function withTreeBoxes(job: Job, binary: PreparedBinary | undefined): Job;
export declare function requireJobId(jobId: string): string;
