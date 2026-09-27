import { createHash } from "node:crypto";
import { setSha256Native } from "./geometry-reuse/canonical.js";
// Each Node entry registers the digest in the module state it uses. It is
// preferred over WebCrypto (see `sha256HexParts`).
setSha256Native((parts) => {
    const hash = createHash("sha256");
    for (const part of parts)
        hash.update(part);
    return hash.digest("hex");
});
