// Added by scripts/build-wasm.mjs --threads (D205). It REPLACES the
// `workerHelpers.js` that wasm-bindgen-rayon ships for browsers: that file
// spawns Web Workers and reads `self` when it is imported, and Node has
// neither on the main thread. This one spawns `node:worker_threads` workers
// of the same kind: each one instantiates the SAME compiled module on the
// SAME shared memory, says it is ready, and then serves the rayon pool until
// the process ends. The workers are unref'd, so an idle pool never keeps a
// process alive.
import { Worker, parentPort, workerData } from "node:worker_threads";

const TAG = "infraredRayonWorker";
const READY = "infrared_rayon_worker_ready";

// A worker of this pool: its data carries the tag. Any other thread that
// imports the glue (the main thread, a caller's own worker) skips this.
// A promise chain, not a top-level await: the glue imports this file, and a
// module cycle through a pending top-level await would never finish.
// The module and the shared memory come as a message after the spawn, as
// in wasm-bindgen-rayon's own helper.
if (workerData?.[TAG] === true) {
  parentPort.once("message", ({ init, receiver }) => {
    import("../../../infrared-core.js").then(async (glue) => {
      await glue.default(init);
      parentPort.postMessage(READY);
      try {
        glue.wbg_rayon_start_worker(receiver);
      } catch (error) {
        // `wbg_rayon_start_worker` serves the pool for the life of the
        // process and never returns; ANY throw here (in practice a kernel
        // panic, which traps: the threaded build aborts on panic) means the
        // pool has lost a thread. The main thread may be blocked in a kernel
        // call waiting for it, where no event, error or rejection can reach
        // it. The only alternative to a silent hang is to end the process,
        // with one structured line on stderr (written synchronously).
        lost(error);
      }
    }).catch((error) => {
      // The glue did not load or initialize: say so, so the start fails
      // with the reason instead of waiting for a READY that never comes.
      // The worker then ends, which the start also sees.
      parentPort.postMessage({ failed: String(error?.stack ?? error) });
    });
  });
}

/** A pool thread is gone: one structured line on stderr, then end the process. */
function lost(error) {
  process._rawDebug(JSON.stringify({
    event: "infrared_core_worker_failed", outcome: "process_aborted",
    error: String(error?.stack ?? error),
  }));
  // SIGKILL on every platform: a host `SIGABRT` handler could catch a
  // softer signal, and the process would then go on with a broken pool.
  process.kill(process.pid, "SIGKILL");
}

// Kept so the workers stay reachable while the pool lives.
let workers;

export async function startWorkers(module, memory, builder) {
  const count = builder.numThreads();
  if (count === 0) throw new Error("num_threads must be > 0.");
  // `receiver()` is a POINTER into the shared memory
  // (`*const Receiver<ThreadBuilder>` in wasm-bindgen-rayon 1.3), a plain
  // number, not a `MessagePort`: it needs no transfer list. The module and
  // the shared memory are cloned by `postMessage` as they are.
  const receiver = builder.receiver();
  if (typeof receiver !== "number") throw new Error("expected a receiver pointer from wasm-bindgen-rayon");
  const start = { init: { module_or_path: module, memory }, receiver };
  const spawned = [];
  // Until EVERY worker is ready, the error or exit of ANY worker, ready or
  // not, fails the start (a catchable error): a pool built on a lost worker
  // would wait for it forever.
  let failStart;
  const failed = new Promise((_, reject) => { failStart = reject; });
  const fail = (error) => failStart(new Error("an Infrared core worker failed to start", { cause: error }));
  const ready = Promise.all(Array.from({ length: count }, () => new Promise((resolve) => {
    // A spawn that throws (a thread or resource limit) fails the start the
    // same way, and the cleanup below ends the workers spawned before it.
    let worker;
    try {
      // A worker inherits the parent's `execArgv`. `--input-type` (a
      // `node -e` parent) is refused for a worker's module entry, and the
      // whole pool would fail to start: drop it.
      // Both spellings: `--input-type=module` and `--input-type module`.
      const execArgv = process.execArgv.filter((flag, at, all) =>
        !flag.startsWith("--input-type") && all[at - 1] !== "--input-type");
      worker = new Worker(new URL(import.meta.url), { workerData: { [TAG]: true }, execArgv });
    } catch (error) {
      fail(error);
      return;
    }
    spawned.push(worker);
    worker.on("error", fail);
    worker.on("exit", (code) => fail(new Error(`exit code ${code}`)));
    worker.once("message", (message) => {
      if (message !== READY) {
        return fail(new Error(message?.failed ?? `unexpected message ${String(message)}`));
      }
      worker.unref();
      resolve(worker);
    });
    worker.postMessage(start);
  })));
  try {
    workers = await Promise.race([ready, failed]);
  } catch (error) {
    // End every worker, so a failed start leaves no thread that keeps the
    // process alive; their exits must not count as a lost pool thread.
    for (const worker of spawned) worker.removeAllListeners();
    await Promise.allSettled(spawned.map((worker) => worker.terminate()));
    throw error;
  }
  // From here a lost worker leaves the pool one thread short, and the next
  // parallel kernel call would wait for it forever: end the process, as a
  // failure caught inside the worker does.
  for (const worker of workers) {
    worker.removeAllListeners("error");
    worker.removeAllListeners("exit");
    worker.once("error", (error) => lost(error));
    worker.once("exit", (code) => lost(new Error(`exit code ${code}`)));
  }
  builder.build();
}
