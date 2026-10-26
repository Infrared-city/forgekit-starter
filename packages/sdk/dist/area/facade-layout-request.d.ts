/**
 * The request text of `synthesizeFacadeLayout`: the kernel reads one JSON document. Split out
 * of `facade-layout.ts` for the 400-line cap (root `CLAUDE.md` rule 8); no behaviour change.
 */
import type { SynthesizeFacadeLayoutInput } from "./facade-layout.js";
export declare function buildRequest(input: SynthesizeFacadeLayoutInput): string;
