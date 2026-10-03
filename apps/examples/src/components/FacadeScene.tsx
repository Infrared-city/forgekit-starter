// Draws facade results in 3D with three.js. Each surface is a flat grid of
// sensor cells. `origin` is the CENTRE of cell (0, 0): cell (i, j) is centred
// on origin + i*gridSize*uAxis + j*gridSize*vAxis and reaches half a cell to
// each side. Coordinates are metres from the area's south-west corner: x east,
// y north, z up. See AGENTS.md "Facades and roofs".
// The SDK gives the result as columns: surface `row` has its vectors at
// [3*row, 3*row + 3) and its cells at [cellOffsets[row], cellOffsets[row + 1]).
import type { SurfaceColumns } from '@infrared-city/infrared-sdk-ts'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ramp, type Scale } from '../lib/colors'

function buildMesh(result: SurfaceColumns, scale: Scale): THREE.Mesh {
  const pos: number[] = []
  const col: number[] = []
  const grey = [0.6, 0.6, 0.6]
  for (let row = 0; row < result.surfaceCount; row++) {
    const [ox, oy, oz] = result.origin.subarray(3 * row, 3 * row + 3)
    const g = result.gridSize[row]
    const u = Array.from(result.uAxis.subarray(3 * row, 3 * row + 3), (a) => a * g)
    const v = Array.from(result.vAxis.subarray(3 * row, 3 * row + 3), (a) => a * g)
    const nu = result.nu[row]
    const nv = result.nv[row]
    const first = result.cellOffsets[row]
    const count = result.cellOffsets[row + 1] - first
    for (let j = 0; j < nv; j++) {
      for (let i = 0; i < nu; i++) {
        const k = j * nu + i
        if (k >= count) continue
        const value = result.values[first + k]
        const c = Number.isNaN(value)
          ? grey
          : ramp((value - scale.min) / (scale.max - scale.min)).map((x) => x / 255)
        // Four corners of the cell (centre +- half a cell). Swap y and z: three.js uses y up.
        const p = (ci: number, cj: number) => {
          const a = ci - 0.5
          const b = cj - 0.5
          const x = ox + a * u[0] + b * v[0]
          const y = oy + a * u[1] + b * v[1]
          const z = oz + a * u[2] + b * v[2]
          return [x, z, -y]
        }
        const p00 = p(i, j)
        const p10 = p(i + 1, j)
        const p11 = p(i + 1, j + 1)
        const p01 = p(i, j + 1)
        for (const q of [p00, p10, p11, p00, p11, p01]) {
          pos.push(...q)
          col.push(...c)
        }
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }),
  )
}

export function FacadeScene({ result, scale }: { result: SurfaceColumns; scale: Scale }) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = el.current
    if (!host) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(host.clientWidth, host.clientHeight)
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f4f4f2')
    const mesh = buildMesh(result, scale)
    scene.add(mesh)

    mesh.geometry.computeBoundingBox()
    const box = mesh.geometry.boundingBox ?? new THREE.Box3()
    const mid = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3()).length()
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(size * 2, size * 2),
      new THREE.MeshBasicMaterial({ color: '#dcdcd6' }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.set(mid.x, box.min.y - 0.05, mid.z)
    scene.add(ground)

    const camera = new THREE.PerspectiveCamera(
      45,
      host.clientWidth / host.clientHeight,
      1,
      size * 10,
    )
    camera.position.set(mid.x - size * 0.35, mid.y + size * 0.45, mid.z + size * 0.55)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(mid)
    controls.update()

    let frame = 0
    const tick = () => {
      renderer.render(scene, camera)
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(frame)
      controls.dispose()
      mesh.geometry.dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [result, scale])

  return <div ref={el} className="scene" />
}
