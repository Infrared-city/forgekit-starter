/**
 * Client-side API functions for the multi-step indoor analysis flow.
 *
 * Flow: presign -> S3 upload -> confirm -> run analysis
 *
 * The presign, confirm, and run endpoints go through the FastAPI proxy
 * (which injects the AWS API key server-side). The S3 upload goes directly
 * from the browser to S3 using the presigned POST URL.
 *
 * All three proxy endpoints require Bearer auth, so requests MUST go through
 * the auth-aware client injected via `configureIndoorAnalysisApi()`. Raw
 * fetch would silently 401. If the composition root forgot to wire the
 * client, every call throws a clear configuration error.
 */

import { INDOOR_ANALYSIS_TIMEOUT } from '../core/indoor-analysis.constants'
import type {
  ConfirmResponse,
  HeatmapPointData,
  PresignResponse,
} from '../core/indoor-analysis.types'

// ─── Injected API client ─────────────────────────────────────────────────────
// An auth-aware API client MUST be injected from the app composition root so
// requests include auth headers and benefit from the 401 refresh interceptor.
// The Python `/indoor/*` endpoints require Bearer auth (there is no fallback
// path); a missing client is a configuration bug, not a runtime condition.

type ApiClient = {
  post: <T>(path: string, data: unknown, timeout?: number) => Promise<T>
}

let injectedClient: ApiClient | null = null

/**
 * Configure an API client for indoor-analysis requests.
 * Call once from the app composition root with the auth-aware `api` client.
 */
export function configureIndoorAnalysisApi(client: ApiClient) {
  injectedClient = client
}

/**
 * Test-only helper: clear the injected client so the null-client error path
 * can be verified. Production code MUST NOT call this -- the composition root
 * wires the client once at boot and never unsets it.
 *
 * @internal
 */
export function __resetIndoorAnalysisApiForTests() {
  injectedClient = null
}

/**
 * Return the injected client or throw a clear configuration error.
 * Callers should never swallow this -- it is a boot-time wiring bug.
 */
function requireInjectedClient(): ApiClient {
  if (!injectedClient) {
    throw new Error(
      'indoor-analysis primitive not wired: call configureIndoorAnalysisApi() at composition boot',
    )
  }
  return injectedClient
}

// ─── Request params ──────────────────────────────────────────────────────────

/** Parameters for the run-analysis endpoint */
export interface RunIndoorAnalysisParams {
  fileId: string
  analysisType: string
  latitude: number
  longitude: number
  monthStamp: number[]
  dayStamp: number[]
  hourStamp: number[]
  floorIndex: number
  gridSize: number
  analysisHeight: number
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * Request a presigned S3 upload URL from the FastAPI proxy.
 *
 * POST /indoor/presign -> returns {fileId, url, fields}
 */
export async function presignUpload(): Promise<PresignResponse> {
  const client = requireInjectedClient()
  const json = await client.post<{ data: PresignResponse }>('/indoor/presign', {})
  return json.data
}

/**
 * Upload a file directly to S3 using a presigned POST URL.
 *
 * IMPORTANT:
 * - All presign `fields` MUST come before the `file` field in FormData
 * - Do NOT set Content-Type header manually (browser sets multipart boundary)
 * - Success = 204 with empty body
 * - Errors return XML (not JSON)
 */
export async function uploadToS3(presignData: PresignResponse, file: File): Promise<void> {
  const formData = new FormData()

  // Add all presign fields first (order matters for S3)
  for (const [key, value] of Object.entries(presignData.fields)) {
    formData.append(key, value)
  }

  // File MUST be last
  formData.append('file', file)

  const response = await fetch(presignData.url, {
    method: 'POST',
    // Do NOT set Content-Type -- browser sets multipart boundary automatically
    body: formData,
  })

  if (!response.ok) {
    // S3 errors return XML, not JSON
    let errorMessage: string
    try {
      const text = await response.text()
      // Try to extract <Message> from S3 XML error
      const match = /<Message>(.*?)<\/Message>/i.exec(text)
      errorMessage = match ? match[1] : `S3 upload failed (${response.status})`
    } catch {
      errorMessage = `S3 upload failed (${response.status})`
    }
    throw new Error(errorMessage)
  }
}

/**
 * Confirm that a file has been uploaded to S3.
 *
 * POST /indoor/confirm with {fileId}
 */
export async function confirmUpload(fileId: string): Promise<ConfirmResponse> {
  const client = requireInjectedClient()
  const json = await client.post<{ data: ConfirmResponse }>('/indoor/confirm', {
    fileId,
  })
  return json.data
}

/**
 * Run an indoor analysis on an uploaded IFC file.
 *
 * POST /indoor/run with analysis parameters
 * Returns typed HeatmapPointData with camelCase keys.
 *
 * Uses the full INDOOR_ANALYSIS_TIMEOUT since analysis can take minutes.
 */
export async function runIndoorAnalysis(
  params: RunIndoorAnalysisParams,
): Promise<HeatmapPointData> {
  const client = requireInjectedClient()

  // Convert camelCase params to kebab-case expected by the API
  const body = {
    fileId: params.fileId,
    'analysis-type': params.analysisType,
    latitude: params.latitude,
    longitude: params.longitude,
    'month-stamp': params.monthStamp,
    'day-stamp': params.dayStamp,
    'hour-stamp': params.hourStamp,
    'floor-index': params.floorIndex,
    'grid-size': params.gridSize,
    'analysis-height': params.analysisHeight,
  }

  const json = await client.post<{
    data: {
      minLegend: number
      maxLegend: number
      output: Array<{ x: number; y: number; z: number; df: number }>
    }
  }>('/indoor/run', body, INDOOR_ANALYSIS_TIMEOUT)

  return {
    minLegend: json.data.minLegend,
    maxLegend: json.data.maxLegend,
    points: json.data.output,
  }
}
