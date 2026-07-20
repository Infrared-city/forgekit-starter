import type { GroundMaterialsViewport } from '../core/ground-materials.types'

/** Dependencies for the ground-materials panel UI component. */
export interface GroundMaterialsPanelDeps {
  /** Get the current buildings viewport from the map interface */
  getBuildingsViewport: () => GroundMaterialsViewport
  /** Set a named layer's visibility in the map interface */
  setLayer: (name: string, visible: boolean) => void
}
