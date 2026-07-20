/**
 * Re-export of the shared time-slicer — the implementation moved to
 * `@forge-kit/geo-core` when ground-materials became the third consumer
 * (per this module's own extract-on-third-copy rule). Path kept so the
 * package barrel and existing imports stay stable.
 */
export { createTimeSlicer, type TimeSliceOpts, type TimeSlicer } from '@forge-kit/geo-core'
