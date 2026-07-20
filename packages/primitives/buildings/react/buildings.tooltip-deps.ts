import type { DeckGLRef } from '@deck.gl/react'
import type { DotBimMesh } from '../core/buildings.sdk-types'

/** Dependencies injected from the composition root / plugin for the building tooltip. */
export interface BuildingTooltipDeps {
  deckRef: React.RefObject<DeckGLRef | null>
  origin: [number, number]
  buildings: Record<string, DotBimMesh> | undefined
  selectedMeshId: string | null
  dragState: { isDragging: boolean }
  selectMesh: (id: string | null) => void
  computeMeshCentroid: (mesh: DotBimMesh) => { x: number; y: number; z: number }
  metersToLatLng: (
    meters: { x: number; y: number },
    origin: [number, number],
  ) => { lat: number; lng: number }
}
