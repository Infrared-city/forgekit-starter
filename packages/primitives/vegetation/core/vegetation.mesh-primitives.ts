/**
 * Low-level trunk + canopy geometry builders. Pure functions — mutate the
 * passed `coords` / `indices` / `colors` arrays in place. Pulled out of
 * `vegetation.mesh-builder.ts` to keep that file under the 400-line cap.
 *
 * All shapes are emitted in a +Z-up local frame with the tree base sitting
 * at z=0. Per-vertex colors are pushed alongside positions so the merged
 * mesh layer can render brown trunks + green canopies with a single
 * `SimpleMeshLayer` (the mesh's `colors` attribute modulates `getColor`).
 *
 * Vertical offset (terrain lift for Google 3D Tiles) is applied at the
 * layer's `coordinateOrigin[2]` — never here. Mesh builders always emit
 * at z=0 ground so the offset is single-sourced and the same mesh data
 * works on both flat-earth and photogrammetry-elevated frames.
 */

/** Per-vertex colors as RGB tuples (0–255). Brown trunk, vivid green canopy. */
export const TRUNK_COLOR: readonly [number, number, number] = [120, 76, 44]
export const CANOPY_COLOR: readonly [number, number, number] = [70, 140, 56]

/**
 * Push a closed cylinder representing the trunk: bottom ring, top ring,
 * sides, and both caps. CCW outward winding so default back-face culling
 * works. Returns nothing — mutates `coords` / `indices` / `colors`.
 */
export function pushTrunk(
  coords: number[],
  indices: number[],
  colors: number[],
  trunkRadius: number,
  trunkHeight: number,
  segments: number,
): void {
  const N = segments
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2
    coords.push(Math.cos(theta) * trunkRadius, Math.sin(theta) * trunkRadius, 0)
    colors.push(TRUNK_COLOR[0], TRUNK_COLOR[1], TRUNK_COLOR[2])
  }
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2
    coords.push(Math.cos(theta) * trunkRadius, Math.sin(theta) * trunkRadius, trunkHeight)
    colors.push(TRUNK_COLOR[0], TRUNK_COLOR[1], TRUNK_COLOR[2])
  }
  const trunkBottomCenter = 2 * N
  coords.push(0, 0, 0)
  colors.push(TRUNK_COLOR[0], TRUNK_COLOR[1], TRUNK_COLOR[2])
  const trunkTopCenter = 2 * N + 1
  coords.push(0, 0, trunkHeight)
  colors.push(TRUNK_COLOR[0], TRUNK_COLOR[1], TRUNK_COLOR[2])

  for (let i = 0; i < N; i++) {
    const a = i
    const b = (i + 1) % N
    const c = N + i
    const d = N + ((i + 1) % N)
    indices.push(a, b, c, b, d, c)
  }
  for (let i = 0; i < N; i++) {
    const a = i
    const b = (i + 1) % N
    indices.push(trunkBottomCenter, b, a)
  }
  for (let i = 0; i < N; i++) {
    const a = N + i
    const b = N + ((i + 1) % N)
    indices.push(trunkTopCenter, a, b)
  }
}

/**
 * Push a low-poly UV-sphere canopy with 3 latitude bands × `segments`
 * longitude bands. Sphere CENTER sits at `centerZ`, RADIUS `canopyRadius`
 * (same horizontal + vertical so the canopy reads as a round tree-top,
 * not a flattened or stretched lollipop). Caller controls placement.
 */
export function pushSphereCanopy(
  coords: number[],
  indices: number[],
  colors: number[],
  baseStart: number,
  canopyRadius: number,
  centerZ: number,
  segments: number,
  color: readonly [number, number, number],
): void {
  pushEllipsoidCanopy(
    coords,
    indices,
    colors,
    baseStart,
    canopyRadius,
    canopyRadius,
    centerZ,
    segments,
    color,
  )
}

/**
 * Ellipsoid canopy — the sphere generalized to independent horizontal
 * (`radiusXY`) and vertical (`radiusZ`) radii. Vertex/index layout is
 * IDENTICAL to the sphere's (the sphere delegates here), so downstream
 * vertex-count assumptions hold for every archetype. Used directly for the
 * 'columnar' archetype (stretched crown: cypress/poplar).
 */
export function pushEllipsoidCanopy(
  coords: number[],
  indices: number[],
  colors: number[],
  baseStart: number,
  radiusXY: number,
  radiusZ: number,
  centerZ: number,
  segments: number,
  color: readonly [number, number, number],
): void {
  const latBands = 3
  const longBands = segments
  const ringStarts: number[] = []
  let cursor = baseStart

  coords.push(0, 0, centerZ - radiusZ)
  colors.push(color[0], color[1], color[2])
  const bottomPole = cursor
  cursor++

  for (let lat = 1; lat < latBands; lat++) {
    const phi = (lat / latBands) * Math.PI
    const z = centerZ - Math.cos(phi) * radiusZ
    const r = Math.sin(phi) * radiusXY
    ringStarts.push(cursor)
    for (let lon = 0; lon < longBands; lon++) {
      const theta = (lon / longBands) * Math.PI * 2
      coords.push(Math.cos(theta) * r, Math.sin(theta) * r, z)
      colors.push(color[0], color[1], color[2])
      cursor++
    }
  }

  coords.push(0, 0, centerZ + radiusZ)
  colors.push(color[0], color[1], color[2])
  const topPole = cursor
  cursor++

  const firstRing = ringStarts[0]
  for (let lon = 0; lon < longBands; lon++) {
    const a = firstRing + lon
    const b = firstRing + ((lon + 1) % longBands)
    indices.push(bottomPole, a, b)
  }
  for (let lat = 0; lat < ringStarts.length - 1; lat++) {
    const ringA = ringStarts[lat]
    const ringB = ringStarts[lat + 1]
    for (let lon = 0; lon < longBands; lon++) {
      const a = ringA + lon
      const b = ringA + ((lon + 1) % longBands)
      const c = ringB + lon
      const d = ringB + ((lon + 1) % longBands)
      indices.push(a, b, d, a, d, c)
    }
  }
  const lastRing = ringStarts[ringStarts.length - 1]
  for (let lon = 0; lon < longBands; lon++) {
    const a = lastRing + lon
    const b = lastRing + ((lon + 1) % longBands)
    indices.push(topPole, b, a)
  }
}

/**
 * Cone canopy for the 'conical' archetype (conifer): base ring `radius` at
 * `baseZ`, apex at `topZ`, closed with a base cap. Same in-place push
 * contract as the other canopy builders.
 */
export function pushConeCanopy(
  coords: number[],
  indices: number[],
  colors: number[],
  baseStart: number,
  radius: number,
  baseZ: number,
  topZ: number,
  segments: number,
  color: readonly [number, number, number],
): void {
  const N = segments
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2
    coords.push(Math.cos(theta) * radius, Math.sin(theta) * radius, baseZ)
    colors.push(color[0], color[1], color[2])
  }
  const apex = baseStart + N
  coords.push(0, 0, topZ)
  colors.push(color[0], color[1], color[2])
  const baseCenter = baseStart + N + 1
  coords.push(0, 0, baseZ)
  colors.push(color[0], color[1], color[2])

  for (let i = 0; i < N; i++) {
    const a = baseStart + i
    const b = baseStart + ((i + 1) % N)
    indices.push(a, b, apex) // side
    indices.push(baseCenter, b, a) // base cap (facing down)
  }
}
