import type { AnalysisResult } from './zip.js'
import { decodeAnalysisResult } from './zip.js'

const PRESIGN_TIMEOUT = 30_000
const CONFIRM_TIMEOUT = 30_000
// 160s to leave 20s margin within CloudFront's OriginReadTimeout: 180s
const RUN_TIMEOUT = 160_000

async function jsonPost(
  baseUrl: string,
  path: string,
  body: Record<string, unknown>,
  timeout: number,
  authorization?: string,
): Promise<Record<string, unknown>> {
  let response: Response
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authorization) headers.Authorization = authorization
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new Error('Indoor API request timed out')
    }
    throw new Error(`Indoor API unreachable: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => `HTTP ${response.status}`)
    throw new Error(`Indoor API returned ${response.status}: ${errorBody}`)
  }

  return response.json() as Promise<Record<string, unknown>>
}

export async function presign(
  baseUrl: string,
  authorization?: string,
): Promise<Record<string, unknown>> {
  return jsonPost(baseUrl, '/upload/presign', {}, PRESIGN_TIMEOUT, authorization)
}

export async function confirm(
  baseUrl: string,
  fileId: string,
  authorization?: string,
): Promise<Record<string, unknown>> {
  return jsonPost(baseUrl, '/upload/confirm', { fileId }, CONFIRM_TIMEOUT, authorization)
}

export async function runAnalysis(
  baseUrl: string,
  params: Record<string, unknown>,
  authorization?: string,
): Promise<AnalysisResult> {
  const raw = await jsonPost(baseUrl, '/run-indoor-analysis', params, RUN_TIMEOUT, authorization)
  return decodeAnalysisResult(raw)
}
