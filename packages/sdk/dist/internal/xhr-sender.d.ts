/**
 * The browser and web-worker body sender (#556): `XMLHttpRequest`, whose
 * `upload.onprogress` reports the bytes the connection took. See
 * `body-sender.ts` for why this, and not a streamed `fetch` body.
 */
import type { BodySender } from "./body-sender.js";
export declare const xhrSender: BodySender;
