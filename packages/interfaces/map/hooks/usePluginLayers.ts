import type { MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'
import type { Layer } from 'deck.gl'
import { useMemo } from 'react'

/**
 * Composes DeckGL layers from an array of MapPlugin instances.
 *
 * Each plugin can optionally provide a `layers(context)` function that returns
 * an array of DeckGL layers. This hook flat-maps all plugin layers into a
 * single array suitable for passing to DeckGL.
 *
 * This is the CANONICAL location for usePluginLayers (not duplicated in shared).
 */
export function usePluginLayers(plugins: MapPlugin[], context: MapPluginContext): Layer[] {
  return useMemo(() => {
    return plugins.flatMap((p) => p.layers?.(context) ?? [])
  }, [plugins, context])
}
