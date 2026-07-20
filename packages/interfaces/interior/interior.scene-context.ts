/**
 * Module-level ref for sharing SceneRefs between InteriorCanvas and InteriorPanel.
 *
 * InteriorCanvas sets `sceneRefsRef.current` after useSceneSetup completes.
 * InteriorPanel reads it to pass to plugin sidebar panels.
 *
 * Follows the same pattern as `interior.model-ref.ts` which bridges
 * InteriorCanvas and ModelTreePanel.
 *
 * Combined with a reactive Zustand signal (`useInteriorStore.modelVersion`)
 * for re-render triggers, since module-level refs are not reactive.
 */

import type { SceneRefs } from './interior.types'

export const sceneRefsRef: { current: SceneRefs | null } = {
  current: null,
}
