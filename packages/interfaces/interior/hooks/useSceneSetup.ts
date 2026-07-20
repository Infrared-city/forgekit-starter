import { getAOConfigForQuality, lightingSetup } from '@infrared/three-theme'
import * as FRAGS from '@thatopen/fragments'
import { N8AOPass } from 'n8ao'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { modelRef } from '../interior.model-ref'
import { useInteriorStore } from '../interior.store'
import type { SceneRefs } from '../interior.types'

// Interior-scale camera configuration (adjusted from urban outdoor preset).
// The standard preset uses far=2000 which works fine for interior scale.
const INTERIOR_CAMERA_CONFIG = {
  fov: 45,
  near: 0.5,
  far: 500,
  position: [10, 10, 10] as [number, number, number],
}

// Interior-scale lighting — positions scaled down from urban outdoor (700/3800/700)
const INTERIOR_KEY_POSITION: [number, number, number] = [10, 20, 10]
const INTERIOR_FILL_POSITION: [number, number, number] = [20, 5, -5]
const INTERIOR_BACK_POSITION: [number, number, number] = [2, 12, -8]

/**
 * Create a gradient CanvasTexture for the scene background.
 * Uses a 2x512 canvas with a vertical linear gradient.
 *
 * Exported for use by `useIfcImport` which switches backgrounds on model load/error.
 *
 * @param state - 'empty' for idle/error states, 'loaded' for when a model is displayed
 * @returns A CanvasTexture with SRGBColorSpace set
 */
export function createSceneBackground(state: 'empty' | 'loaded'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 512)

  if (state === 'empty') {
    // Light gray-blue to near-white
    gradient.addColorStop(0, '#e8edf2')
    gradient.addColorStop(1, '#f5f5f5')
  } else {
    // Slightly deeper gradient for loaded state
    gradient.addColorStop(0, '#dce3eb')
    gradient.addColorStop(1, '#f0f0f0')
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 2, 512)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * useSceneSetup — initializes the Three.js scene, renderer, camera, controls,
 * lighting, grid, environment map, post-processing, and animation loop.
 *
 * Returns a `SceneRefs` object that downstream hooks (useIfcImport,
 * useVisibilityPass, useCameraControls, useInteriorRaycasting) depend on.
 *
 * Follows the MapCanvas pattern: hook creates refs, component wires them.
 *
 * @param containerRef - Ref to the DOM element that will contain the canvas
 * @returns SceneRefs object with all shared refs
 */
export function useSceneSetup(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: { onCleanup?: () => void } = {},
): SceneRefs {
  'use no memo' // Opts out of React Compiler -- ref writes during render (onCleanupRef.current = ...)
  const onCleanupRef = useRef(options.onCleanup)
  onCleanupRef.current = options.onCleanup
  // Ref-based init guard prevents double-init in React StrictMode dev mode
  const initializedRef = useRef(false)
  const disposedRef = useRef(false)

  // Three.js objects live in refs, NOT in Zustand
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const gridRef = useRef<THREE.GridHelper | null>(null)
  // Ref to the canvas DOM element (renderer.domElement) for raycasting
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)

  // Post-processing objects
  const composerRef = useRef<EffectComposer | null>(null)
  const aoPassRef = useRef<N8AOPass | null>(null)
  const outputPassRef = useRef<OutputPass | null>(null)

  // Environment map render target ref for cleanup (holds both texture and GPU resources)
  const envMapTargetRef = useRef<THREE.WebGLRenderTarget | null>(null)
  const backgroundTextureRef = useRef<THREE.CanvasTexture | null>(null)

  // ThatOpen objects
  const fragmentsRef = useRef<FRAGS.FragmentsModels | null>(null)
  const currentModelRef = useRef<FRAGS.FragmentsModel | null>(null)

  // Render-on-demand: dirty flag — only call renderer.render() when true
  const needsRenderRef = useRef(true)

  // Continuous-render deadline: when set to a future timestamp, the animation
  // loop renders every frame until the deadline expires. Used during visibility
  // transitions where async worker updates make single-frame dirty flags unreliable.
  const continuousRenderUntilRef = useRef(0)

  // Throttle fragments.update(): timestamp of last call (max ~10 calls/sec)
  const lastFragmentsUpdateRef = useRef(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: containerRef is a stable React ref — init-once pattern with initializedRef guard
  useEffect(() => {
    if (!containerRef.current) return
    if (initializedRef.current) return
    initializedRef.current = true
    disposedRef.current = false

    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Renderer
    // NOTE: Do NOT enable logarithmicDepthBuffer — it writes depth via gl_FragDepth
    // in the fragment shader, which bypasses the GPU's hardware polygonOffset used by
    // applyZFightingFixes in useIfcImport. With near=0.1 / far=500 the standard
    // 24-bit depth buffer has excellent precision for interior-scale models.
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    // Expose canvas element for raycasting (mousemove/click listeners attach here)
    canvasElementRef.current = renderer.domElement

    // Camera
    const camera = new THREE.PerspectiveCamera(
      INTERIOR_CAMERA_CONFIG.fov,
      w / (h || 1),
      INTERIOR_CAMERA_CONFIG.near,
      INTERIOR_CAMERA_CONFIG.far,
    )
    camera.position.set(...INTERIOR_CAMERA_CONFIG.position)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = true
    controls.zoomSpeed = 1.0
    controls.rotateSpeed = 0.5
    controls.panSpeed = 0.5
    controlsRef.current = controls

    // Lighting — three-point setup adapted for interior scale
    const { keyLight, fillLight, backLight } = lightingSetup
    const dirKeyLight = new THREE.DirectionalLight(keyLight.color, keyLight.intensity)
    dirKeyLight.position.set(...INTERIOR_KEY_POSITION)
    if (keyLight.castShadow) {
      dirKeyLight.castShadow = true
      if (keyLight.shadowMapSize) {
        dirKeyLight.shadow.mapSize.set(keyLight.shadowMapSize[0], keyLight.shadowMapSize[1])
      }
      if (keyLight.shadowBias !== undefined) {
        dirKeyLight.shadow.bias = keyLight.shadowBias
      }
    }
    scene.add(dirKeyLight)

    const dirFillLight = new THREE.DirectionalLight(fillLight.color, fillLight.intensity)
    dirFillLight.position.set(...INTERIOR_FILL_POSITION)
    scene.add(dirFillLight)

    const dirBackLight = new THREE.DirectionalLight(backLight.color, backLight.intensity)
    dirBackLight.position.set(...INTERIOR_BACK_POSITION)
    scene.add(dirBackLight)

    const hemisphereLight = new THREE.HemisphereLight('#ddeeff', '#8c8c8c', 0.5)
    scene.add(hemisphereLight)

    // Environment map for PBR material reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const roomEnv = new RoomEnvironment()
    const envMapTarget = pmremGenerator.fromScene(roomEnv)
    scene.environment = envMapTarget.texture
    scene.environmentIntensity = 0.4
    envMapTargetRef.current = envMapTarget
    pmremGenerator.dispose()
    roomEnv.dispose()

    // FragmentsModels — worker must be served from /workers/worker.mjs
    const fragments = new FRAGS.FragmentsModels('/workers/worker.mjs')
    fragmentsRef.current = fragments

    // Empty state: grid helper ground plane — larger and lighter for light background
    const grid = new THREE.GridHelper(100, 100, 0x999999, 0xbbbbbb)
    grid.position.y = 0
    scene.add(grid)
    gridRef.current = grid

    // Empty state: light gradient background via CanvasTexture
    const emptyBg = createSceneBackground('empty')
    scene.background = emptyBg
    backgroundTextureRef.current = emptyBg

    // OrbitControls change → mark scene dirty + throttle fragment LOD update
    const onControlsChange = () => {
      // Always mark dirty so render-on-demand paints the camera move
      needsRenderRef.current = true

      // Throttle fragments.update() to max ~10 calls/sec (100ms interval)
      if (fragmentsRef.current) {
        const now = performance.now()
        if (now - lastFragmentsUpdateRef.current >= 100) {
          lastFragmentsUpdateRef.current = now
          fragmentsRef.current.update()
        }
      }
    }
    controls.addEventListener('change', onControlsChange)

    // Post-processing: EffectComposer + N8AOPass (renders scene internally) + OutputPass
    const composer = new EffectComposer(renderer)

    // N8AO ambient occlusion pass — handles scene rendering + AO in one pass
    // autoRenderBeauty defaults to true, so N8AOPass renders the scene itself.
    // No separate RenderPass needed — avoids buffer compositing issues.
    const aoPass = new N8AOPass(scene, camera, w, h)
    const aoSettings = getAOConfigForQuality('medium')
    aoPass.configuration.aoRadius = 12.0 // Medium radius — edges and contact areas
    aoPass.configuration.intensity = 1.2 // Visible but not overpowering
    aoPass.configuration.aoSamples = aoSettings.aoSamples
    aoPass.configuration.denoiseSamples = aoSettings.denoiseSamples
    aoPass.configuration.denoiseRadius = aoSettings.denoiseRadius
    aoPass.configuration.distanceFalloff = 0.35 // Moderate falloff — visible at edges, fades on surfaces
    composer.addPass(aoPass)
    aoPassRef.current = aoPass

    // OutputPass for gamma/tone mapping output
    const outputPass = new OutputPass()
    composer.addPass(outputPass)
    outputPassRef.current = outputPass

    composerRef.current = composer

    // Animation loop — render-on-demand with continuous-render window.
    // Normally only renders when needsRenderRef is dirty. During visibility
    // transitions, continuousRenderUntilRef forces every frame to render
    // so async worker GPU buffer updates are always painted.
    function animate() {
      if (disposedRef.current) return
      animFrameRef.current = requestAnimationFrame(animate)
      // controls.update() runs every frame for damping to work correctly.
      // It fires 'change' events during damping which set needsRenderRef.
      controls.update()
      const inContinuousWindow = performance.now() < continuousRenderUntilRef.current
      if (needsRenderRef.current || inContinuousWindow) {
        needsRenderRef.current = false
        composer.render()
      }
    }
    animate()

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width === 0 || height === 0) continue
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        // Resize post-processing pipeline (composer propagates to all passes)
        composer.setSize(width, height)
        // Mark dirty so render-on-demand repaints after resize
        needsRenderRef.current = true
      }
    })
    resizeObserver.observe(container)

    // Cleanup on unmount
    return () => {
      if (disposedRef.current) return
      disposedRef.current = true

      controls.removeEventListener('change', onControlsChange)
      resizeObserver.disconnect()

      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }

      controls.dispose()
      controlsRef.current = null

      // Dispose ThatOpen resources
      if (fragmentsRef.current) {
        fragmentsRef.current.dispose()
        fragmentsRef.current = null
      }
      currentModelRef.current = null
      // Clear module-level model ref so ModelTreePanel sees null
      modelRef.current = null

      // Dispose post-processing passes individually (EffectComposer.dispose()
      // only disposes its internal render targets, not the passes themselves)
      if (outputPassRef.current?.dispose) {
        outputPassRef.current.dispose()
      }
      outputPassRef.current = null
      // N8AOPass does not expose a public dispose(), but nulling the ref
      // releases the JS-side references; GPU resources are freed by forceContextLoss
      aoPassRef.current = null
      if (composerRef.current) {
        composerRef.current.dispose()
        composerRef.current = null
      }

      // Dispose environment map render target (texture + depth/renderbuffers)
      if (envMapTargetRef.current) {
        scene.environment = null
        envMapTargetRef.current.dispose()
        envMapTargetRef.current = null
      }

      // Dispose background CanvasTexture
      if (backgroundTextureRef.current) {
        backgroundTextureRef.current.dispose()
        backgroundTextureRef.current = null
      }

      // Traverse scene and dispose all geometries + materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          for (const mat of materials) {
            mat?.dispose()
          }
        }
      })

      // Dispose renderer and force WebGL context loss to release GPU memory
      renderer.dispose()
      renderer.forceContextLoss()

      // Remove canvas from DOM
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
      gridRef.current = null
      canvasElementRef.current = null
      initializedRef.current = false

      // Reset store state
      useInteriorStore.getState().reset()
      // Notify plugins to clean up (e.g., reset indoor analysis store)
      onCleanupRef.current?.()
    }
  }, [])

  return {
    renderer: rendererRef,
    scene: sceneRef,
    camera: cameraRef,
    controls: controlsRef,
    fragments: fragmentsRef,
    currentModel: currentModelRef,
    composer: composerRef,
    grid: gridRef,
    backgroundTexture: backgroundTextureRef,
    canvasElement: canvasElementRef,
    disposed: disposedRef,
    needsRender: needsRenderRef,
    continuousRenderUntil: continuousRenderUntilRef,
  }
}
