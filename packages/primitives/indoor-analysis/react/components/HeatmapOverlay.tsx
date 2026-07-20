/**
 * HeatmapOverlay -- React component wrapper around useHeatmapOverlay.
 *
 * Conforms to the InteriorPlugin Overlay signature:
 *   Overlay: React.ComponentType<{ sceneRefs: SceneRefs }>
 *
 * Renders nothing visually (the overlay is added imperatively to the Three.js
 * scene by the hook). This component exists solely to mount the hook within
 * the InteriorCanvas component tree.
 */

import type { SceneRefs } from '@forge-kit/plugin-contracts'
import type { IndoorAnalysisDeps } from '../../plugin'
import { useHeatmapOverlay } from '../hooks/useHeatmapOverlay'

export function HeatmapOverlay({
  sceneRefs,
  deps,
}: {
  sceneRefs: SceneRefs
  deps: IndoorAnalysisDeps
}) {
  useHeatmapOverlay(sceneRefs, deps)
  return null
}
