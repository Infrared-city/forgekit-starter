/**
 * Async (time-sliced) filter + merge for the buildings render path.
 *
 * `filterBuildingsByPolygon` + `mergeBuildings` used to run synchronously in
 * `useBuildingsMapPlugin` useMemos — two full passes over every building in
 * the city on the SAME render tick, the top main-thread freeze on project
 * open / scenario switch (100k+ buildings). This hook runs the chunked twins
 * instead, yielding to the event loop between buildings.
 *
 * Semantics:
 *  - **Two independent stages, like the original memos** — the polygon
 *    filter is keyed ONLY on (buildings, polygon); the merge re-runs on
 *    transform changes WITHOUT re-filtering. Gizmo drags mutate transforms
 *    per pointer frame — fusing the stages would re-test polygon membership
 *    for every building on every drag frame.
 *  - **Consistent snapshot incl. origin** — `buildings`, `mergedGeometry`
 *    AND `origin` all come from the SAME computation. Geometry positions are
 *    METER_OFFSETS relative to the polygon origin they were computed
 *    against; pairing a stale mesh with a live origin would render the whole
 *    city displaced during the stale window after a polygon redraw.
 *  - **Stale-while-revalidate** — on input change the previous snapshot stays
 *    rendered until the new one is ready (no flicker to empty). An explicit
 *    null/undefined input resets synchronously (project switch clears the
 *    store first, so no cross-scenario ghosting). `isComputing` tells
 *    callers "empty/stale because still computing" apart from "nothing to
 *    show" (first load has no prior snapshot to keep).
 *  - **Abort on change/unmount** — an in-flight stage is cancelled via the
 *    slicer's `shouldAbort` and its result discarded. NOTE: during a drag on
 *    a huge city each frame restarts the merge, so the mesh can lag the
 *    gizmo until the drag pauses — the old code kept them in lockstep by
 *    freezing the main thread every frame instead.
 */
import type { Polygon as GeoJsonPolygon } from 'geojson'
import { useEffect, useState } from 'react'
import type { MergedGeometry } from '../core/buildings.merge-geometry'
import { mergeBuildingsChunked } from '../core/buildings.merge-geometry'
import {
  computeOriginFromPolygon,
  filterBuildingsByPolygonChunked,
} from '../core/buildings.mesh-utils'
import type { DotBimMesh } from '../core/buildings.sdk-types'
import type { BuildingTransform } from '../core/buildings.transforms'

export interface BuildingsGeometrySnapshot {
  /** Polygon-filtered buildings — same object identities as the store's. */
  buildings: Record<string, DotBimMesh> | undefined
  /** Merged geometry built from exactly `buildings`. */
  mergedGeometry: MergedGeometry | null
  /** [lng, lat] SW-corner origin of the polygon `buildings` was filtered
   *  against — the frame the merged METER_OFFSETS positions belong to.
   *  `[0, 0]` placeholder while empty (zero layers emitted anyway). */
  origin: [number, number]
  /** True while a filter or merge is in flight — distinguishes "empty/stale
   *  because still computing" from "nothing to show". */
  isComputing: boolean
}

const EMPTY: Omit<BuildingsGeometrySnapshot, 'isComputing'> = {
  buildings: undefined,
  mergedGeometry: null,
  origin: [0, 0],
}

/** Stage-1 output: filtered set + the origin it was filtered against. */
interface FilterStage {
  filtered: Record<string, DotBimMesh>
  origin: [number, number]
}

export function useAsyncBuildingsGeometry(
  storeBuildings: Record<string, DotBimMesh> | null | undefined,
  effectivePolygon: GeoJsonPolygon | null,
  buildingTransforms: Record<string, BuildingTransform>,
  /** When true, render EVERY building in the store instead of culling to
   *  `effectivePolygon` — for BYO uploads, whose store set IS exactly the user's
   *  intended geometry (the polygon may be a smaller centered analysis AOI, and
   *  culling to it would hide the buildings the user uploaded outside it). The
   *  origin still derives from `effectivePolygon`, so meter-offset positions stay
   *  correct for buildings inside AND outside the AOI. The polygon filter exists
   *  to trim a city-wide FETCHED set to the drawn area — it must not fire on a
   *  set the user supplied wholesale. */
  opts?: { renderAll?: boolean },
): BuildingsGeometrySnapshot {
  const [stage, setStage] = useState<FilterStage | null>(null)
  const [snapshot, setSnapshot] = useState<Omit<BuildingsGeometrySnapshot, 'isComputing'>>(EMPTY)
  const [filtering, setFiltering] = useState(false)
  const [merging, setMerging] = useState(false)

  // Stage 1 — polygon filter. Keyed ONLY on (buildings, polygon): transform
  // churn (per-frame during gizmo drags) must never re-run this pass.
  useEffect(() => {
    if (!storeBuildings || !effectivePolygon) {
      // Mid-draw + null-polygon gate: reset synchronously (matches the old
      // useMemo behavior — zero layers emitted).
      setStage(null)
      setSnapshot(EMPTY)
      setFiltering(false)
      return
    }
    let cancelled = false
    setFiltering(true)
    const origin = computeOriginFromPolygon(effectivePolygon)
    // renderAll (BYO uploads): skip the polygon cull entirely — the store set is
    // the user's whole model. The origin comes from `effectivePolygon`, so the
    // CALLER must pass the polygon the meshes were baked against — the site
    // BOUNDARY, NOT the analysis AOI (they're baked once against the boundary and
    // never re-baked; an AOI origin displaces the whole cluster off-screen —
    // render trace 2026-07-15, fixed at the map-plugins call site).
    if (opts?.renderAll) {
      setStage({ filtered: storeBuildings, origin })
      setFiltering(false)
      return () => {
        cancelled = true
      }
    }
    void filterBuildingsByPolygonChunked(storeBuildings, effectivePolygon, {
      shouldAbort: () => cancelled,
    }).then((filtered) => {
      if (cancelled || !filtered) return
      setStage({ filtered, origin })
      setFiltering(false)
    })
    return () => {
      cancelled = true
    }
  }, [storeBuildings, effectivePolygon, opts?.renderAll])

  // Stage 2 — merge. Re-runs on transform changes against the CURRENT
  // filtered set; publishes the consistent (buildings, geometry, origin)
  // snapshot only when complete.
  useEffect(() => {
    if (!stage) return
    let cancelled = false
    setMerging(true)
    void mergeBuildingsChunked(stage.filtered, buildingTransforms, {
      shouldAbort: () => cancelled,
    }).then((mergedGeometry) => {
      if (cancelled || !mergedGeometry) return
      setSnapshot({ buildings: stage.filtered, mergedGeometry, origin: stage.origin })
      setMerging(false)
    })
    return () => {
      cancelled = true
    }
  }, [stage, buildingTransforms])

  return { ...snapshot, isComputing: filtering || merging }
}
