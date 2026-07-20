/**
 * Clip SDK-fetched ground-material layers to the user-drawn polygon.
 *
 * The SDK returns one bbox-clipped circle per tile, so adjacent tiles emit
 * overlapping features that bleed past the polygon outline. MaskExtension is
 * unreliable under interleaved MapboxOverlay (it relies on a render-to-texture
 * pass that does not survive Mapbox's shared GL context), so we pre-clip on
 * the data side instead. After this runs the display GeoJsonLayers can render
 * with a plain `filled:true`, no mask layer, no extensions.
 */
import { createTimeSlicer, type TimeSliceOpts } from '@forge-kit/geo-core'
import { flatten } from '@turf/flatten'
import { featureCollection } from '@turf/helpers'
import { intersect } from '@turf/intersect'
import type {
  Feature,
  FeatureCollection as GeoJsonFeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson'
import type { LooseFeatureCollection, LooseMaterialLayers } from './ground-materials.area-normalize'

/**
 * Clip every feature in `layers` against `polygon`. Features wholly outside
 * the polygon are dropped; features that straddle the boundary are trimmed.
 * MultiPolygons are flattened first so the clip works one ring at a time.
 *
 * Properties are preserved (incl. the `properties.material` stamped by
 * `normalizeSdkAreaLayers`). Returns a new `LooseMaterialLayers` map; inputs
 * are not mutated.
 */
export function clipAreaLayersToPolygon(
  layers: LooseMaterialLayers,
  polygon: Polygon,
): LooseMaterialLayers {
  const clipFeature = makeClipFeature(polygon)
  const out: LooseMaterialLayers = {}
  for (const [layerName, fc] of Object.entries(layers)) {
    const flattened = flattenLayer(fc)
    const clipped: Array<Record<string, unknown>> = []
    for (const feature of flattened) {
      const result = clipFeatureAgainst(feature, clipFeature)
      if (result) clipped.push(result)
    }
    out[layerName] = { type: 'FeatureCollection', features: clipped } as LooseFeatureCollection
  }
  return out
}

/**
 * Time-sliced twin of {@link clipAreaLayersToPolygon} — IDENTICAL output
 * (both share the per-feature `clipFeatureAgainst` step; a test pins
 * equality), but yields to the event loop between features so a large
 * site's `@turf/intersect` pass (the materials first-hydrate freeze) keeps
 * the viewport responsive. Returns `null` when aborted via
 * `opts.shouldAbort` (stale result — discard).
 */
export async function clipAreaLayersToPolygonChunked(
  layers: LooseMaterialLayers,
  polygon: Polygon,
  opts: TimeSliceOpts = {},
): Promise<LooseMaterialLayers | null> {
  const clipFeature = makeClipFeature(polygon)
  const slicer = createTimeSlicer(opts)
  const out: LooseMaterialLayers = {}
  for (const [layerName, fc] of Object.entries(layers)) {
    const flattened = flattenLayer(fc)
    const clipped: Array<Record<string, unknown>> = []
    for (const feature of flattened) {
      if (!(await slicer.checkpoint())) return null
      const result = clipFeatureAgainst(feature, clipFeature)
      if (result) clipped.push(result)
    }
    out[layerName] = { type: 'FeatureCollection', features: clipped } as LooseFeatureCollection
  }
  return out
}

// ── shared per-feature steps (sync + chunked clip MUST NOT drift) ───────────

function makeClipFeature(polygon: Polygon): Feature<Polygon> {
  return { type: 'Feature', properties: {}, geometry: polygon }
}

/** Flatten a layer's (possibly Multi)Polygon features to single polygons. */
function flattenLayer(fc: LooseFeatureCollection | undefined): Feature<Polygon | MultiPolygon>[] {
  const features = (fc?.features ?? []) as unknown as Feature<Polygon | MultiPolygon>[]
  if (features.length === 0) return []
  return flatten({
    type: 'FeatureCollection',
    features,
  } as GeoJsonFeatureCollection<Polygon | MultiPolygon>).features as Feature<
    Polygon | MultiPolygon
  >[]
}

/** Intersect ONE flattened feature against the clip polygon. Null = wholly
 *  outside (dropped) or degenerate geometry (skipped). */
function clipFeatureAgainst(
  feature: Feature<Polygon | MultiPolygon>,
  clipFeature: Feature<Polygon>,
): Record<string, unknown> | null {
  try {
    const result = intersect(featureCollection([feature as Feature<Polygon>, clipFeature]))
    if (result === null) return null
    return {
      ...(result as unknown as Record<string, unknown>),
      properties: { ...(feature.properties ?? {}) },
    }
  } catch {
    // degenerate geometry — skip
    return null
  }
}
