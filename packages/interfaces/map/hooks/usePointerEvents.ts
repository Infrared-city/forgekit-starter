import { useEffect } from 'react'

/**
 * Manages pointer-events on DeckGL's overlay elements when ground materials mode is active.
 *
 * DeckGL renders: <div#deckgl-wrapper> -> <canvas#deckgl-overlay> + <div(Map)>
 * The overlay canvas sits on top of the Map and intercepts pointer events.
 * Setting pointer-events:none on both the canvas and wrapper, then
 * pointer-events:auto on the .mapboxgl-map container, lets events reach
 * MapboxDraw while DeckGL's EventManager still processes bubbled events
 * for pan/zoom via its controller.
 */
export function usePointerEvents(isGroundMaterialsActive: boolean): void {
  useEffect(() => {
    if (!isGroundMaterialsActive) return

    const apply = () => {
      const overlay = document.getElementById('deckgl-overlay')
      const wrapper = document.getElementById('deckgl-wrapper')
      const mapContainer = document.querySelector('.mapboxgl-map') as HTMLElement | null

      if (overlay) overlay.style.pointerEvents = 'none'
      if (wrapper) wrapper.style.pointerEvents = 'none'
      if (mapContainer) mapContainer.style.pointerEvents = 'auto'
    }

    // Apply immediately (elements exist from React render) and also after
    // a short delay to catch any async DeckGL canvas initialization.
    apply()
    const timerId = setTimeout(apply, 200)

    return () => {
      clearTimeout(timerId)
      const overlay = document.getElementById('deckgl-overlay')
      const wrapper = document.getElementById('deckgl-wrapper')
      const mapContainer = document.querySelector('.mapboxgl-map') as HTMLElement | null
      if (overlay) overlay.style.pointerEvents = ''
      if (wrapper) wrapper.style.pointerEvents = ''
      if (mapContainer) mapContainer.style.pointerEvents = ''
    }
  }, [isGroundMaterialsActive])
}
