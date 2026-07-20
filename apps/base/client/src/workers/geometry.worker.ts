/**
 * Web Worker for geometry processing (normals computation).
 *
 * THREE.js geometry math works fine in Web Workers because it's pure math
 * with no DOM dependencies. This offloads expensive normal computation from
 * the main thread.
 */
import { BufferGeometry, Float32BufferAttribute } from 'three'

export interface ComputeNormalsRequest {
  type: 'COMPUTE_NORMALS'
  payload: {
    id: string
    vertices: Float32Array
    indices: Uint32Array | null
  }
}

export interface NormalsComputedResponse {
  type: 'NORMALS_COMPUTED'
  payload: {
    id: string
    normals: Float32Array
  }
}

export interface ErrorResponse {
  type: 'ERROR'
  payload: {
    id: string
    error: string
  }
}

export type WorkerRequest = ComputeNormalsRequest
export type WorkerResponse = NormalsComputedResponse | ErrorResponse

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, payload } = event.data

  switch (type) {
    case 'COMPUTE_NORMALS': {
      try {
        const { id, vertices, indices } = payload

        // Create THREE.js geometry for normals computation
        const geometry = new BufferGeometry()
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))

        if (indices) {
          geometry.setIndex(Array.from(indices))
        }

        // Compute vertex normals using THREE.js
        geometry.computeVertexNormals()

        const normalAttr = geometry.getAttribute('normal')
        const normals = new Float32Array(normalAttr.array)

        // Use Transferable for zero-copy transfer back to main thread
        const response: NormalsComputedResponse = {
          type: 'NORMALS_COMPUTED',
          payload: { id, normals },
        }

        // Transfer ownership of the buffer to avoid copying
        self.postMessage(response, { transfer: [normals.buffer] })

        // Clean up THREE.js geometry
        geometry.dispose()
      } catch (error) {
        const errorResponse: ErrorResponse = {
          type: 'ERROR',
          payload: {
            id: payload.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        }
        self.postMessage(errorResponse)
      }
      break
    }

    default:
      console.warn('[GeometryWorker] Unknown message type:', type)
  }
}
