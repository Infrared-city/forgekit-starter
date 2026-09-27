/**
 * A geometry group whose wire text the KERNEL writes: one group of a facade
 * batch's body, selected from the prepared site by `Site.facadeFrames`
 * (`area/site-facade.ts`), the value Python carries as `RawJson`.
 *
 * The host never builds or parses the group. Three readers take it as it is:
 * `jsonWireBytes` writes its bytes into the JSON body, the reuse path takes
 * its canonical bytes and kernel hash as the group identity, and the binary
 * guard reads the batch's target ids. The bytes are written on the first ask
 * — the submission of that job — so a plan or a preview writes no body.
 *
 * Its own fields are private, so `Object.keys` of a kernel group is empty and
 * no host walk mistakes it for a mesh map; every reader that needs its
 * content asks {@link groupHasContent} or the group itself. `JSON.stringify`
 * of a body holding one writes the same content (`toJSON`).
 */
const EMPTY = { bytes: new TextEncoder().encode("{}"), hash: undefined };
export class KernelGroup {
    #text;
    #load;
    #empty;
    #ids;
    /**
     * `empty`: the group holds no mesh, known from the plan without writing it
     * (its text is `{}`). `ids`: a batch's `geometries`, the targets it counted.
     */
    constructor(load, empty, ids) {
        this.#load = load;
        this.#empty = empty;
        this.#ids = ids;
    }
    /** True when the group holds no mesh. */
    get empty() {
        return this.#empty;
    }
    /** The target ids of a batch's `geometries`, or `undefined` for other groups. */
    get ids() {
        return this.#ids;
    }
    /** The kernel's text, written on the first ask and kept. */
    text() {
        if (this.#text === undefined)
            this.#text = this.#empty ? EMPTY : this.#load();
        return this.#text;
    }
    /**
     * The group as a JavaScript value, parsed from the kernel's text. The SDK's
     * own writers never ask (`jsonWireBytes` writes the bytes); a caller that
     * logs or stringifies a prepared body gets the same content.
     */
    toJSON() {
        return JSON.parse(new TextDecoder().decode(this.text().bytes));
    }
}
/** True for a group that holds something: a non-empty map or kernel group. */
export function groupHasContent(value) {
    if (value instanceof KernelGroup)
        return !value.empty;
    return value !== null && typeof value === "object" && !Array.isArray(value) &&
        Object.keys(value).length > 0;
}
