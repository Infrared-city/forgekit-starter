// The 3D view (three.js): terrain with the hill, buildings, trees, and the
// result drawn on the ground (or on the walls, for the facade analysis).
// Scene metres: x east, y north, z up. three.js: x east, y up, z = -north.
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { DemoScene } from '../demo/scene'
import { terrainHeight } from '../demo/scene'
import { SCENE_SIZE_M } from '../demo/scene-layout'
import { type MapTip, type Note, noteHtml } from './annotations'
import { type ColorScale, colorOf } from './colors'
import type { FacadeResult } from './results'

const S = SCENE_SIZE_M

function terrain(ground: HTMLCanvasElement): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(S, S, 128, 128)
  geo.rotateX(-Math.PI / 2)
  geo.translate(S / 2, 0, -S / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), -pos.getZ(i)))
  geo.computeVertexNormals()
  const tex = new THREE.CanvasTexture(ground)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex }))
}

function buildings(scene: DemoScene): THREE.Group {
  const group = new THREE.Group()
  const mat = new THREE.MeshLambertMaterial({ color: '#ebe7df' })
  const edges = new THREE.LineBasicMaterial({ color: '#8a857c' })
  for (const b of scene.boxes) {
    const [x0, y0, x1, y1] = b.rect
    const geo = new THREE.BoxGeometry(x1 - x0, b.height, y1 - y0)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set((x0 + x1) / 2, b.height / 2, -(y0 + y1) / 2)
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edges)
    lines.position.copy(mesh.position)
    group.add(mesh, lines)
  }
  return group
}

function trees(scene: DemoScene): THREE.Group {
  const group = new THREE.Group()
  const trunkMat = new THREE.MeshLambertMaterial({ color: '#6b4f33' })
  const leaf = new THREE.MeshLambertMaterial({ color: '#4f8a3c' })
  const needle = new THREE.MeshLambertMaterial({ color: '#2f5d3a' })
  const trunk = new THREE.CylinderGeometry(0.25, 0.35, 1, 6)
  const ball = new THREE.SphereGeometry(0.5, 12, 8)
  const cone = new THREE.ConeGeometry(0.5, 1, 10)
  for (const t of scene.trees) {
    const z0 = terrainHeight(t.x, t.y)
    const crownBase = t.height * 0.35
    const stem = new THREE.Mesh(trunk, trunkMat)
    stem.scale.set(1, crownBase + 1, 1)
    stem.position.set(t.x, z0 + (crownBase + 1) / 2, -t.y)
    const pine = t.genus === 'Pinus'
    const crown = new THREE.Mesh(pine ? cone : ball, pine ? needle : leaf)
    const h = t.height - crownBase
    const w = t.genus === 'Populus' ? t.crown * 0.8 : t.crown
    crown.scale.set(w, h, w)
    crown.position.set(t.x, z0 + crownBase + h / 2, -t.y)
    group.add(stem, crown)
  }
  return group
}

/** Every facade sensor cell as two coloured triangles; `userData.values` = value per triangle. */
function facadeMesh(result: FacadeResult, scale: ColorScale): THREE.Mesh {
  const pos: number[] = []
  const col: number[] = []
  const values: number[] = []
  for (const s of Object.values(result.surfaces)) {
    const g = s.gridSize
    for (let j = 0; j < s.nv; j++) {
      for (let i = 0; i < s.nu; i++) {
        const v = s.values[j * s.nu + i]
        if (v === null || v === undefined) continue
        const c = colorOf(scale, v).map((x) => x / 255)
        const p = (a: number, b: number) => {
          const x = s.origin[0] + (a * s.uAxis[0] + b * s.vAxis[0]) * g
          const y = s.origin[1] + (a * s.uAxis[1] + b * s.vAxis[1]) * g
          const z = s.origin[2] + (a * s.uAxis[2] + b * s.vAxis[2]) * g
          return [x, z, -y]
        }
        for (const q of [
          p(i, j),
          p(i + 1, j),
          p(i + 1, j + 1),
          p(i, j),
          p(i + 1, j + 1),
          p(i, j + 1),
        ]) {
          pos.push(...q)
          col.push(...c)
        }
        values.push(v, v)
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }),
  )
  mesh.userData.values = values
  return mesh
}

/** What the mouse points at: a place on the site (metres) and, on a wall or roof, its value. */
export interface Hit3D {
  x: number
  y: number
  /** Set when the mouse is on a facade or roof sensor cell. */
  value?: number
}

function dispose(obj: THREE.Object3D) {
  obj.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
      o.geometry.dispose()
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      for (const m of mats) {
        ;(m as THREE.MeshLambertMaterial).map?.dispose()
        m.dispose()
      }
    }
  })
}

interface Props {
  scene: DemoScene
  ground: HTMLCanvasElement
  facades?: { result: FacadeResult; scale: ColorScale } | null
  /** Annotation pins, as on the plan map. */
  notes?: ReadonlyArray<Note & { tip: MapTip | null }>
  /** The mouse moved over the scene (null: off the site or left the view). */
  onHover?: (hit: Hit3D | null) => void
  /** Tooltip for the point under the mouse. */
  tip?: MapTip | null
}

/** Where a pin sits in 3D: on the roof of a building, else on the terrain (three.js axes). */
function anchor(scene: DemoScene, x: number, y: number): THREE.Vector3 {
  const b = scene.boxes.find(({ rect: [x0, y0, x1, y1] }) => x >= x0 && x < x1 && y >= y0 && y < y1)
  return new THREE.Vector3(x, (b ? b.height : terrainHeight(x, y)) + 1, -y)
}

export function Scene3D({ scene, ground, facades, notes = [], onHover, tip }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const labels = useRef<HTMLDivElement>(null)
  // Pin anchors in 3D and their label elements, placed on every render.
  const pins = useRef<Array<{ at: THREE.Vector3; node: HTMLElement }>>([])
  const hover = useRef(onHover)
  hover.current = onHover
  const [at, setAt] = useState<{ x: number; y: number; flip: boolean } | null>(null)
  const world = useRef<{ root: THREE.Scene; render: () => void } | null>(null)
  const content = useRef<THREE.Group | null>(null)

  useEffect(() => {
    const host = el.current
    if (!host) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    host.appendChild(renderer.domElement)
    const root = new THREE.Scene()
    root.background = new THREE.Color('#e9eef2')
    root.add(new THREE.HemisphereLight('#ffffff', '#8d8a80', 1.6))
    const sun = new THREE.DirectionalLight('#ffffff', 1.4)
    sun.position.set(-200, 400, 150)
    root.add(sun)
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 5000)
    camera.position.set(-230, 430, 260)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(S / 2, 0, -S / 2)
    controls.maxPolarAngle = Math.PI / 2.1
    const place = new THREE.Vector3()
    const render = () => {
      renderer.render(root, camera)
      const w = host.clientWidth
      const h = host.clientHeight
      for (const { at, node } of pins.current) {
        place.copy(at).project(camera)
        const visible = place.z < 1 && Math.abs(place.x) <= 1.05 && Math.abs(place.y) <= 1.05
        node.style.display = visible ? '' : 'none'
        node.style.transform = `translate(${((place.x + 1) / 2) * w}px, ${((1 - place.y) / 2) * h}px)`
      }
    }
    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
      render()
    }
    controls.addEventListener('change', render)

    // Hover: cast a ray from the mouse; the nearest terrain, building or sensor cell wins.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let frame = 0
    const pick = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = renderer.domElement.getBoundingClientRect()
        ndc.set(
          ((e.clientX - box.left) / box.width) * 2 - 1,
          -((e.clientY - box.top) / box.height) * 2 + 1,
        )
        ray.setFromCamera(ndc, camera)
        const hits = content.current ? ray.intersectObjects(content.current.children, true) : []
        const first = hits.find((h) => h.object instanceof THREE.Mesh)
        if (!first) {
          hover.current?.(null)
          setAt(null)
          return
        }
        // A wall or roof cell lies on its building's face: prefer it when it is as near.
        const cell = hits.find(
          (h) =>
            h.object.userData.values && h.distance - first.distance < 0.5 && h.faceIndex != null,
        )
        const p = (cell ?? first).point
        const x = p.x
        const y = -p.z
        if (x < 0 || y < 0 || x >= S || y >= S) {
          hover.current?.(null)
          setAt(null)
          return
        }
        const value =
          cell && cell.faceIndex != null
            ? (cell.object.userData.values as number[])[cell.faceIndex]
            : undefined
        hover.current?.({ x, y, value })
        const cx = e.clientX - box.left
        setAt({ x: cx, y: e.clientY - box.top, flip: cx > box.width / 2 })
      })
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      hover.current?.(null)
      setAt(null)
    }
    renderer.domElement.addEventListener('pointermove', pick)
    renderer.domElement.addEventListener('pointerleave', leave)
    controls.update()
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    world.current = { root, render }
    resize()
    return () => {
      cancelAnimationFrame(frame)
      renderer.domElement.removeEventListener('pointermove', pick)
      renderer.domElement.removeEventListener('pointerleave', leave)
      observer.disconnect()
      controls.dispose()
      if (content.current) dispose(content.current)
      renderer.dispose()
      host.removeChild(renderer.domElement)
      world.current = null
    }
  }, [])

  useEffect(() => {
    const w = world.current
    if (!w) return
    if (content.current) {
      w.root.remove(content.current)
      dispose(content.current)
    }
    const group = new THREE.Group()
    group.add(terrain(ground), buildings(scene), trees(scene))
    if (facades) group.add(facadeMesh(facades.result, facades.scale))
    content.current = group
    w.root.add(group)
    w.render()
  }, [scene, ground, facades])

  useEffect(() => {
    const box = labels.current
    if (!box) return
    box.innerHTML = ''
    pins.current = notes.map((n) => {
      const node = document.createElement('div')
      node.innerHTML = noteHtml(n)
      box.appendChild(node)
      return { at: anchor(scene, n.x, n.y), node }
    })
    world.current?.render()
  }, [notes, scene])

  return (
    <div ref={el} className="scene-3d" data-testid="scene-3d">
      <div ref={labels} className="notes-3d" />
      {tip && at && (
        <div className={`map-tip${at.flip ? ' flip' : ''}`} style={{ left: at.x, top: at.y }}>
          {tip.color && <i style={{ background: tip.color }} />}
          {tip.text}
        </div>
      )}
    </div>
  )
}
