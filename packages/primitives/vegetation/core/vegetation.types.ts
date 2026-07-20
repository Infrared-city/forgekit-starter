/** Pure types shared between core and react layers. */

export interface Viewport {
  latitude: number
  longitude: number
}

/** Default tree colour as RGB (used by the mesh layer when no override provided). */
export const VEGETATION_DEFAULT_COLOR: [number, number, number] = [80, 140, 60]
