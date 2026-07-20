import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import type { SceneRefs } from '../interior.types'

// Interior-scale camera configuration for reset rotation
const INTERIOR_CAMERA_CONFIG = {
  position: [10, 10, 10] as [number, number, number],
}

export interface CameraControlHandlers {
  handleFitToModel: () => void
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleResetRotation: () => void
}

/**
 * useCameraControls -- provides camera manipulation handlers for the interior viewer.
 *
 * Handlers:
 * - handleFitToModel: frames the loaded model in the viewport
 * - handleZoomIn: dolly in 20% closer to the orbit target
 * - handleZoomOut: dolly out 25% further from the orbit target
 * - handleResetRotation: reset camera to the initial position and target
 *
 * All handlers read from SceneRefs (stable React refs) and mark the scene dirty
 * for the render-on-demand loop.
 */
export function useCameraControls(sceneRefs: SceneRefs): CameraControlHandlers {
  'use no memo' // Opts out of React Compiler -- stable ref deps intentionally omitted from useCallback
  const {
    camera: cameraRef,
    controls: controlsRef,
    currentModel: currentModelRef,
    fragments: fragmentsRef,
    needsRender: needsRenderRef,
  } = sceneRefs

  // Store initial camera state for reset rotation
  const initialCameraPositionRef = useRef(new THREE.Vector3(...INTERIOR_CAMERA_CONFIG.position))
  const initialCameraTargetRef = useRef(new THREE.Vector3(0, 0, 0))

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs from useSceneSetup -- they never change identity
  const handleFitToModel = useCallback(() => {
    const model = currentModelRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!model || !camera || !controls) return

    try {
      // Compute the model bounding box from its Three.js object
      const box = new THREE.Box3().setFromObject(model.object)
      if (box.isEmpty()) return

      const center = new THREE.Vector3()
      const size = new THREE.Vector3()
      box.getCenter(center)
      box.getSize(size)

      // Position camera so the full model fits in the frustum.
      // Use the largest dimension to set the distance.
      const maxDim = Math.max(size.x, size.y, size.z)
      const fovRad = (camera.fov * Math.PI) / 180
      const distance = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.5

      camera.position.set(center.x + distance * 0.5, center.y + distance * 0.5, center.z + distance)
      controls.target.copy(center)
      controls.update()

      if (fragmentsRef.current) {
        fragmentsRef.current.update()
      }

      // Mark dirty for render-on-demand
      needsRenderRef.current = true
    } catch (err) {
      console.warn('[useCameraControls] fitToModel failed:', err)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs
  const handleZoomIn = useCallback(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    // Dolly in: move camera 20% closer to the target
    const direction = new THREE.Vector3()
    direction.subVectors(controls.target, camera.position).normalize()
    const currentDistance = camera.position.distanceTo(controls.target)
    const newDistance = Math.max(currentDistance * 0.8, 0.5)
    camera.position.copy(controls.target).addScaledVector(direction.negate(), newDistance)
    controls.update()
    needsRenderRef.current = true
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs
  const handleZoomOut = useCallback(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    // Dolly out: move camera 25% further from target
    const direction = new THREE.Vector3()
    direction.subVectors(camera.position, controls.target).normalize()
    const currentDistance = camera.position.distanceTo(controls.target)
    const newDistance = currentDistance * 1.25
    camera.position.copy(controls.target).addScaledVector(direction, newDistance)
    controls.update()
    needsRenderRef.current = true
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: sceneRefs are stable React refs
  const handleResetRotation = useCallback(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return

    camera.position.copy(initialCameraPositionRef.current)
    controls.target.copy(initialCameraTargetRef.current)
    controls.update()
    needsRenderRef.current = true
  }, [])

  return {
    handleFitToModel,
    handleZoomIn,
    handleZoomOut,
    handleResetRotation,
  }
}
