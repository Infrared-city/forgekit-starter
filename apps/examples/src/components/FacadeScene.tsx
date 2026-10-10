// Draws facade results in 3D with three.js. The SDK turns the result into
// render buffers (`surfaceRenderBuffers`): a few outline triangles per wall or
// roof part, one value per cell, and a validity bit per cell. One shader draws
// every cell with its exact colour (see src/lib/surface-mesh.ts).
// The SDK frame is metres from the area's south-west corner: x east, y north,
// z up. three.js uses y up, so the mesh sits in a group turned -90 degrees
// about x. See AGENTS.md "Facades and roofs".
import { type SurfaceColumns, surfaceRenderBuffers } from '@infrared-city/infrared-sdk'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ramp, type Scale } from '../lib/colors'
import { createSurfaceMesh, disposeSurfaceMesh } from '../lib/surface-mesh'

/** The colour ramp as a 256 x 1 RGBA table for the shader. */
function rampTable(): Uint8Array {
  const out = new Uint8Array(256 * 4)
  for (let i = 0; i < 256; i++) {
    out.set([...ramp(i / 255).map(Math.round), 255], 4 * i)
  }
  return out
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
    const mesh = createSurfaceMesh(surfaceRenderBuffers(result), rampTable(), [
      scale.min,
      scale.max,
    ])
    const zUp = new THREE.Group()
    zUp.rotation.x = -Math.PI / 2 // SDK (x, y, z) -> three.js (x, z, -y)
    zUp.add(mesh)
    scene.add(zUp)

    const box = new THREE.Box3().setFromObject(zUp)
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
      disposeSurfaceMesh(mesh)
      ground.geometry.dispose()
      ground.material.dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [result, scale])

  return <div ref={el} className="scene" />
}
