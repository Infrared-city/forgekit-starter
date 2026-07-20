/**
 * Async (time-sliced) tree-mesh merge for the vegetation render path.
 *
 * `mergeVegetationMeshes` used to run synchronously in the plugin's useMemo —
 * one uncapped pass over every tree (plus per-tree normals) on the render
 * tick, freezing dense AOIs on load. This runs the chunked twin instead,
 * with stale-while-revalidate semantics: the previous merge stays rendered
 * until the new one is ready; an in-flight merge is aborted (and its result
 * discarded) when the input changes or the component unmounts.
 */
import { useEffect, useState } from 'react'
import type { MergedVegetationGeometry } from '../core/vegetation.merge-geometry'
import { mergeVegetationMeshesChunked } from '../core/vegetation.merge-geometry'
import type { DotBimMesh } from '../core/vegetation.sdk-types'

export interface VegetationGeometrySnapshot {
  merged: MergedVegetationGeometry | null
  /** True while a merge is in flight — distinguishes "empty/stale because
   *  still computing" from "no trees loaded". */
  isComputing: boolean
}

export function useAsyncVegetationGeometry(
  meshes: DotBimMesh[] | null | undefined,
): VegetationGeometrySnapshot {
  const [merged, setMerged] = useState<MergedVegetationGeometry | null>(null)
  const [isComputing, setIsComputing] = useState(false)

  useEffect(() => {
    if (!meshes || meshes.length === 0) {
      // Matches the old useMemo contract: no meshes → null → zero layers.
      setMerged(null)
      setIsComputing(false)
      return
    }
    let cancelled = false
    setIsComputing(true)
    void mergeVegetationMeshesChunked(meshes, { shouldAbort: () => cancelled }).then((result) => {
      if (cancelled || !result) return
      setMerged(result)
      setIsComputing(false)
    })
    return () => {
      cancelled = true
    }
  }, [meshes])

  return { merged, isComputing }
}
