// Turning a result into what the explorer shows: a coloured canvas for the
// plan and the 3D ground, the mean per building, and the value at a point.
import type { DemoScene } from '../demo/scene'
import { SCENE_SIZE_M } from '../demo/scene-layout'
import { type ColorScale, gridToCanvas } from './colors'
import { classColor } from './Legend'
import { type DemoResult, type FacadeResult, isRoof } from './results'

export function colorCanvas(r: DemoResult, scale: ColorScale): HTMLCanvasElement | null {
  if (r.kind !== 'grid') return null
  if (!r.legend) return gridToCanvas(r.values, r.rows, r.cols, scale)
  // Classes: value i means legend[i]; colour by the class letter.
  const canvas = gridToCanvas(r.values, r.rows, r.cols, { ramp: 'wind', min: 0, max: 1 })
  const ctx = canvas.getContext('2d')
  const img = ctx?.getImageData(0, 0, r.cols, r.rows)
  if (!ctx || !img) return canvas
  for (let row = 0; row < r.rows; row++) {
    for (let c = 0; c < r.cols; c++) {
      const v = r.values[row * r.cols + c]
      if (Number.isNaN(v)) continue
      const o = ((r.rows - 1 - row) * r.cols + c) * 4
      img.data.set(classColor(r.legend[v] ?? ''), o)
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

/** Mean value on each building's walls or roofs (facade results), by building id. */
export function buildingMeans(r: FacadeResult, part: 'walls' | 'roofs'): Map<string, number> {
  const sums = new Map<string, [number, number]>()
  for (const [key, s] of Object.entries(r.surfaces)) {
    if (isRoof(s) !== (part === 'roofs')) continue
    const id = key.slice(0, key.lastIndexOf('/'))
    const acc = sums.get(id) ?? [0, 0]
    for (const v of s.values) {
      if (v === null) continue
      acc[0] += v
      acc[1]++
    }
    sums.set(id, acc)
  }
  return new Map([...sums].map(([id, [sum, n]]) => [id, n ? sum / n : Number.NaN]))
}

export function valueAt(r: DemoResult, scene: DemoScene, x: number, y: number): number | null {
  if (r.kind === 'grid') {
    const v =
      r.values[
        Math.floor((y * r.rows) / SCENE_SIZE_M) * r.cols + Math.floor((x * r.cols) / SCENE_SIZE_M)
      ]
    return Number.isNaN(v) ? null : v
  }
  const b = scene.boxes.find(({ rect: [x0, y0, x1, y1] }) => x >= x0 && x < x1 && y >= y0 && y < y1)
  // The plan map shows the roofs, so a building reads its roof value.
  const v = b ? buildingMeans(r, 'roofs').get(b.id) : undefined
  return v === undefined || Number.isNaN(v) ? null : v
}
