import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PresignResponse } from '../core/indoor-analysis.types'
import {
  __resetIndoorAnalysisApiForTests,
  configureIndoorAnalysisApi,
  confirmUpload,
  presignUpload,
  runIndoorAnalysis,
  uploadToS3,
} from '../react/indoor-analysis.api'

// --- Mocks ---

const originalFetch = globalThis.fetch

type MockApiClient = {
  post: ReturnType<typeof vi.fn>
}

function createMockClient(): MockApiClient {
  return { post: vi.fn() }
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
  __resetIndoorAnalysisApiForTests()
})

// --- Injected client requirement ---

describe('requireInjectedClient', () => {
  it('throws a clear configuration error when no client is injected (presignUpload)', async () => {
    __resetIndoorAnalysisApiForTests()
    await expect(presignUpload()).rejects.toThrow(
      'indoor-analysis primitive not wired: call configureIndoorAnalysisApi() at composition boot',
    )
  })

  it('throws a clear configuration error when no client is injected (confirmUpload)', async () => {
    __resetIndoorAnalysisApiForTests()
    await expect(confirmUpload('abc-123')).rejects.toThrow(
      'indoor-analysis primitive not wired: call configureIndoorAnalysisApi() at composition boot',
    )
  })

  it('throws a clear configuration error when no client is injected (runIndoorAnalysis)', async () => {
    __resetIndoorAnalysisApiForTests()
    await expect(
      runIndoorAnalysis({
        fileId: 'abc-123',
        analysisType: 'daylight-factor',
        latitude: 0,
        longitude: 0,
        monthStamp: [6],
        dayStamp: [21],
        hourStamp: [12],
        floorIndex: 0,
        gridSize: 0.5,
        analysisHeight: 0.8,
      }),
    ).rejects.toThrow(
      'indoor-analysis primitive not wired: call configureIndoorAnalysisApi() at composition boot',
    )
  })
})

// --- presignUpload ---

describe('presignUpload', () => {
  it('should POST to /indoor/presign via the injected client and return data', async () => {
    const presignData: PresignResponse = {
      fileId: 'abc-123',
      url: 'https://s3.example.com/upload',
      fields: { key: 'uploads/abc-123', Policy: 'xxx' },
    }
    const client = createMockClient()
    client.post.mockResolvedValue({ data: presignData })
    configureIndoorAnalysisApi(client)

    const result = await presignUpload()

    expect(result).toEqual(presignData)
    expect(client.post).toHaveBeenCalledTimes(1)
    expect(client.post).toHaveBeenCalledWith('/indoor/presign', {})
  })

  it('should propagate errors thrown by the injected client', async () => {
    const client = createMockClient()
    client.post.mockRejectedValue(new Error('INDOOR_API_KEY not configured'))
    configureIndoorAnalysisApi(client)

    await expect(presignUpload()).rejects.toThrow('INDOOR_API_KEY not configured')
  })
})

// --- uploadToS3 ---

describe('uploadToS3', () => {
  const presignData: PresignResponse = {
    fileId: 'abc-123',
    url: 'https://s3.example.com/upload',
    fields: {
      key: 'uploads/abc-123',
      bucket: 'my-bucket',
      Policy: 'encoded-policy',
      'X-Amz-Signature': 'sig-value',
    },
  }

  it('should POST multipart FormData to S3 presigned URL with fields first and file last', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    const file = new File([new ArrayBuffer(8)], 'model.ifc')
    await uploadToS3(presignData, file)

    const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0]
    expect(fetchCall[0]).toBe('https://s3.example.com/upload')

    const fetchInit = fetchCall[1] as RequestInit
    expect(fetchInit.method).toBe('POST')
    // Content-Type must NOT be set -- browser sets multipart boundary
    expect((fetchInit as { headers?: Record<string, string> }).headers).toBeUndefined()

    // Verify FormData has all fields + file
    const formData = fetchInit.body as FormData
    expect(formData.get('key')).toBe('uploads/abc-123')
    expect(formData.get('bucket')).toBe('my-bucket')
    expect(formData.get('Policy')).toBe('encoded-policy')
    expect(formData.get('X-Amz-Signature')).toBe('sig-value')
    expect(formData.get('file')).toBeInstanceOf(File)
  })

  it('should not throw on 204 success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    const file = new File([new ArrayBuffer(8)], 'model.ifc')
    await expect(uploadToS3(presignData, file)).resolves.toBeUndefined()
  })

  it('should parse S3 XML error on failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: vi
        .fn()
        .mockResolvedValue(
          '<Error><Code>AccessDenied</Code><Message>Access Denied</Message></Error>',
        ),
    } as unknown as Response)

    const file = new File([new ArrayBuffer(8)], 'model.ifc')
    await expect(uploadToS3(presignData, file)).rejects.toThrow('Access Denied')
  })

  it('should fallback to status code when XML parsing fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockRejectedValue(new Error('Read failed')),
    } as unknown as Response)

    const file = new File([new ArrayBuffer(8)], 'model.ifc')
    await expect(uploadToS3(presignData, file)).rejects.toThrow('S3 upload failed (500)')
  })
})

// --- confirmUpload ---

describe('confirmUpload', () => {
  it('should POST fileId to /indoor/confirm via the injected client and return data', async () => {
    const client = createMockClient()
    client.post.mockResolvedValue({ data: { key: 'uploads/abc-123.ifc' } })
    configureIndoorAnalysisApi(client)

    const result = await confirmUpload('abc-123')

    expect(result).toEqual({ key: 'uploads/abc-123.ifc' })
    expect(client.post).toHaveBeenCalledTimes(1)
    expect(client.post).toHaveBeenCalledWith('/indoor/confirm', { fileId: 'abc-123' })
  })

  it('should propagate errors thrown by the injected client', async () => {
    const client = createMockClient()
    client.post.mockRejectedValue(new Error('Invalid request body'))
    configureIndoorAnalysisApi(client)

    await expect(confirmUpload('bad-id')).rejects.toThrow('Invalid request body')
  })
})

// --- runIndoorAnalysis ---

describe('runIndoorAnalysis', () => {
  const baseParams = {
    fileId: 'abc-123',
    analysisType: 'daylight-factor',
    latitude: 41.39,
    longitude: 2.17,
    monthStamp: [6],
    dayStamp: [21],
    hourStamp: [12],
    floorIndex: 0,
    gridSize: 0.5,
    analysisHeight: 0.8,
  }

  it('should POST analysis params via the injected client and return camelCase HeatmapPointData', async () => {
    const client = createMockClient()
    client.post.mockResolvedValue({
      data: {
        minLegend: 0,
        maxLegend: 5.2,
        output: [
          { x: 1.0, y: 2.0, z: 0.5, df: 3.1 },
          { x: 1.5, y: 2.5, z: 0.5, df: 1.8 },
        ],
      },
    })
    configureIndoorAnalysisApi(client)

    const result = await runIndoorAnalysis(baseParams)

    expect(result).toEqual({
      minLegend: 0,
      maxLegend: 5.2,
      points: [
        { x: 1.0, y: 2.0, z: 0.5, df: 3.1 },
        { x: 1.5, y: 2.5, z: 0.5, df: 1.8 },
      ],
    })
  })

  it('should send kebab-case keys to the API', async () => {
    const client = createMockClient()
    client.post.mockResolvedValue({ data: { minLegend: 0, maxLegend: 1, output: [] } })
    configureIndoorAnalysisApi(client)

    await runIndoorAnalysis(baseParams)

    expect(client.post).toHaveBeenCalledTimes(1)
    const [path, sentBody] = client.post.mock.calls[0]
    expect(path).toBe('/indoor/run')
    expect(sentBody).toEqual({
      fileId: 'abc-123',
      'analysis-type': 'daylight-factor',
      latitude: 41.39,
      longitude: 2.17,
      'month-stamp': [6],
      'day-stamp': [21],
      'hour-stamp': [12],
      'floor-index': 0,
      'grid-size': 0.5,
      'analysis-height': 0.8,
    })
  })

  it('should forward the long-running timeout to the injected client', async () => {
    const client = createMockClient()
    client.post.mockResolvedValue({ data: { minLegend: 0, maxLegend: 1, output: [] } })
    configureIndoorAnalysisApi(client)

    await runIndoorAnalysis(baseParams)

    // INDOOR_ANALYSIS_TIMEOUT is passed as the third arg so the auth-aware
    // client can raise its AbortController deadline above the default.
    expect(client.post).toHaveBeenCalledWith('/indoor/run', expect.any(Object), expect.any(Number))
    const timeoutArg = client.post.mock.calls[0][2]
    expect(typeof timeoutArg).toBe('number')
    expect(timeoutArg).toBeGreaterThan(30000)
  })

  it('should propagate errors thrown by the injected client', async () => {
    const client = createMockClient()
    client.post.mockRejectedValue(new Error('Invalid request body'))
    configureIndoorAnalysisApi(client)

    await expect(runIndoorAnalysis(baseParams)).rejects.toThrow('Invalid request body')
  })
})
