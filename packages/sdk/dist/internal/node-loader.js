import { readFile } from "node:fs/promises";
export async function packagedCoreBytes(path = new URL("../../generated/infrared-core_bg.wasm", import.meta.url)) {
    const file = await readFile(path);
    const bytes = new Uint8Array(file.byteLength);
    bytes.set(file);
    return bytes;
}
