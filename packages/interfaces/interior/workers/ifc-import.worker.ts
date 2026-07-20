/**
 * Web Worker for IFC import processing.
 *
 * Offloads IfcImporter.process() from the main thread so IFC WASM parsing
 * does not freeze the UI. Uses Transferable objects for zero-copy data
 * transfer of both the input ArrayBuffer and the output fragments Uint8Array.
 */
import * as FRAGS from '@thatopen/fragments'

// ─── Message types ──────────────────────────────────────────────────────────────

export interface ProcessIfcRequest {
  type: 'PROCESS_IFC'
  payload: {
    id: string
    bytes: ArrayBuffer
  }
}

export interface IfcProcessedResponse {
  type: 'IFC_PROCESSED'
  payload: {
    id: string
    fragmentsBuffer: Uint8Array
  }
}

export interface IfcProgressResponse {
  type: 'IFC_PROGRESS'
  payload: {
    id: string
    progress: number
  }
}

export interface IfcErrorResponse {
  type: 'ERROR'
  payload: {
    id: string
    error: string
  }
}

export type IfcWorkerRequest = ProcessIfcRequest
export type IfcWorkerResponse = IfcProcessedResponse | IfcProgressResponse | IfcErrorResponse

// ─── Worker setup ───────────────────────────────────────────────────────────────

// Create IfcImporter once per worker lifetime — it holds WASM state
const importer = new FRAGS.IfcImporter()
importer.wasm = { path: '/wasm/', absolute: true }

self.onmessage = async (event: MessageEvent<IfcWorkerRequest>) => {
  const { type, payload } = event.data

  switch (type) {
    case 'PROCESS_IFC': {
      try {
        const { id, bytes } = payload
        const uint8Bytes = new Uint8Array(bytes)

        // Send initial progress
        const progressResponse: IfcProgressResponse = {
          type: 'IFC_PROGRESS',
          payload: { id, progress: 10 },
        }
        self.postMessage(progressResponse)

        // Process the IFC file — this is the expensive synchronous WASM operation
        const fragmentsBuffer = await importer.process({ bytes: uint8Bytes })

        // Transfer the resulting fragments buffer back via Transferable (zero-copy)
        const response: IfcProcessedResponse = {
          type: 'IFC_PROCESSED',
          payload: { id, fragmentsBuffer },
        }

        self.postMessage(response, { transfer: [fragmentsBuffer.buffer] })
      } catch (error) {
        const errorResponse: IfcErrorResponse = {
          type: 'ERROR',
          payload: {
            id: payload.id,
            error: error instanceof Error ? error.message : 'Unknown IFC processing error',
          },
        }
        self.postMessage(errorResponse)
      }
      break
    }

    default:
      console.warn('[IfcImportWorker] Unknown message type:', type)
  }
}
