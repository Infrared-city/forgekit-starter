import { unzipSync } from 'fflate'

export interface AnalysisResult {
  minLegend: number | null
  maxLegend: number | null
  output: unknown[]
}

export function decodeAnalysisResult(raw: Record<string, unknown>): AnalysisResult {
  const base64 = raw.result as string
  const binaryString = atob(base64)
  const zipBytes = Uint8Array.from({ length: binaryString.length }, (_, i) =>
    binaryString.charCodeAt(i),
  )

  const files = unzipSync(zipBytes)
  const dataFile = files['data.json']
  if (!dataFile) {
    const names = Object.keys(files).join(', ') || '(empty)'
    throw new Error(`data.json not found in analysis result archive. ZIP contained: ${names}`)
  }

  const parsed: unknown = JSON.parse(new TextDecoder().decode(dataFile))
  let output: unknown[]
  if (Array.isArray(parsed)) {
    output = parsed
  } else if (typeof parsed === 'object' && parsed !== null) {
    const p = parsed as Record<string, unknown>
    output = (Array.isArray(p.output) ? p.output : Array.isArray(p.data) ? p.data : []) as unknown[]
  } else {
    output = []
  }

  return {
    minLegend: (raw.minLegend as number | null | undefined) ?? null,
    maxLegend: (raw.maxLegend as number | null | undefined) ?? null,
    output,
  }
}
