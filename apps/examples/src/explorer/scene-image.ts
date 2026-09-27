// A plan drawing of the demo scene (ground, buildings, trees) on a canvas.
// It is the "base map" of the explorer: no map tiles, so it works offline.
import { type DemoScene, GROUND_CELL_M, GROUND_N } from '../demo/scene'
import { SCENE_SIZE_M } from '../demo/scene-layout'

/** Colour of each ground class, in the order of GROUND_LAYERS. */
export const GROUND_COLORS = ['#d9d6cf', '#6b6b70', '#9cc97f', '#6fa8dc', '#e3cf9a'] as const
export const GROUND_LABELS = ['Concrete, paving', 'Asphalt', 'Grass', 'Water', 'Sand'] as const

/** Pixels per metre of the drawings. */
export const PX_PER_M = 2

export function drawGround(ctx: CanvasRenderingContext2D, scene: DemoScene) {
  const px = GROUND_CELL_M * PX_PER_M
  for (let r = 0; r < GROUND_N; r++) {
    for (let c = 0; c < GROUND_N; c++) {
      ctx.fillStyle = GROUND_COLORS[scene.ground[r * GROUND_N + c]]
      // Row 0 is the south edge: draw it at the bottom.
      ctx.fillRect(c * px, (GROUND_N - 1 - r) * px, px, px)
    }
  }
}

export function drawBuildingsAndTrees(
  ctx: CanvasRenderingContext2D,
  scene: DemoScene,
  roofColor?: (id: string) => string | null,
  outlineOnly = false,
) {
  const H = SCENE_SIZE_M * PX_PER_M
  for (const b of scene.boxes) {
    const [x0, y0, x1, y1] = b.rect
    const shade = Math.round(235 - Math.min(60, b.height) * 1.6)
    ctx.fillStyle = roofColor?.(b.id) ?? `rgb(${shade},${shade - 4},${shade - 10})`
    ctx.fillRect(x0 * PX_PER_M, H - y1 * PX_PER_M, (x1 - x0) * PX_PER_M, (y1 - y0) * PX_PER_M)
    ctx.strokeStyle = '#3d3a36'
    ctx.lineWidth = 1.5
    ctx.strokeRect(x0 * PX_PER_M, H - y1 * PX_PER_M, (x1 - x0) * PX_PER_M, (y1 - y0) * PX_PER_M)
  }
  for (const t of scene.trees) {
    ctx.beginPath()
    ctx.arc(t.x * PX_PER_M, H - t.y * PX_PER_M, (t.crown / 2) * PX_PER_M, 0, 2 * Math.PI)
    if (!outlineOnly) {
      ctx.fillStyle = t.genus === 'Pinus' ? 'rgba(30,85,50,0.55)' : 'rgba(40,120,50,0.45)'
      ctx.fill()
    }
    ctx.strokeStyle = outlineOnly ? 'rgba(20,40,20,0.35)' : 'rgba(20,60,25,0.8)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

/** The whole plan: ground, then an optional result layer, then buildings and trees. */
export function planCanvas(
  scene: DemoScene,
  result?: HTMLCanvasElement | null,
  opts: { trees?: boolean; roofColor?: (id: string) => string | null } = {},
): HTMLCanvasElement {
  const size = SCENE_SIZE_M * PX_PER_M
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  drawGround(ctx, scene)
  if (result) {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(result, 0, 0, size, size)
  }
  const shown = opts.trees === false ? { ...scene, trees: [] } : scene
  drawBuildingsAndTrees(ctx, shown, opts.roofColor, Boolean(result))
  return canvas
}
