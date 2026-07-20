/**
 * Cooperative time-slicing for per-item CPU loops on render-adjacent hot
 * paths (city-scale geometry merges, polygon filters, turf clipping). Pure
 * CPU with no natural await points freezes the viewport for its full
 * duration when run synchronously; a worker is often the WRONG tool because
 * the inputs are plain `number[]`/GeoJSON objects and structured-cloning
 * them across a worker boundary costs about as much main-thread time as the
 * work itself. Instead, loops call `checkpoint()` per item and yield to the
 * event loop every `sliceMs` of work, keeping input/paint responsive while
 * the result builds.
 *
 * Home: geo-core is the one shared primitive-core package (buildings,
 * vegetation, ground-materials already depend on it). Extracted from the
 * per-package copies once a third consumer appeared.
 */

export interface TimeSliceOpts {
  /** Yield to the event loop after ~this many ms of work. Default 12 (under
   *  one 60 Hz frame). `0` forces a yield at every checkpoint (tests). */
  sliceMs?: number
  /** Polled at each checkpoint — return `true` to abandon the computation
   *  (the caller receives `null`). Wire to effect-cleanup cancellation. */
  shouldAbort?: () => boolean
  /** Injectable yield for tests. Default: a MessageChannel macrotask hop —
   *  unlike setTimeout(0) it dodges the nested-timer 4 ms clamp. */
  yieldNow?: () => Promise<void>
}

const macrotaskYield = () =>
  new Promise<void>((resolve) => {
    const ch = new MessageChannel()
    ch.port1.onmessage = () => {
      ch.port1.close()
      resolve()
    }
    ch.port2.postMessage(null)
  })

export interface TimeSlicer {
  /** Call once per loop iteration. Yields when the slice budget is spent.
   *  Resolves `false` when the computation should abort. */
  checkpoint(): Promise<boolean>
}

export function createTimeSlicer(opts: TimeSliceOpts = {}): TimeSlicer {
  const sliceMs = opts.sliceMs ?? 12
  const yieldNow = opts.yieldNow ?? macrotaskYield
  const shouldAbort = opts.shouldAbort
  let sliceStart = performance.now()
  return {
    async checkpoint() {
      if (shouldAbort?.()) return false
      if (performance.now() - sliceStart >= sliceMs) {
        await yieldNow()
        sliceStart = performance.now()
        if (shouldAbort?.()) return false
      }
      return true
    },
  }
}
