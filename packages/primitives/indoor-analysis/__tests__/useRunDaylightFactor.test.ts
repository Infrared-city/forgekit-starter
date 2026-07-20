import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HeatmapPointData } from '../core/indoor-analysis.types'
import type { RunDaylightFactorInput } from '../react/hooks/useRunDaylightFactor'
import { useRunDaylightFactor } from '../react/hooks/useRunDaylightFactor'
import { useAnalysisStore } from '../react/indoor-analysis.store'
import { createWrapper } from './test-utils'

// --- Mocks ---

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mock the API module to isolate hook logic from fetch
vi.mock('../react/indoor-analysis.api', () => ({
  presignUpload: vi.fn(),
  uploadToS3: vi.fn(),
  confirmUpload: vi.fn(),
  runIndoorAnalysis: vi.fn(),
}))

// --- Helpers ---

async function getApiMocks() {
  const api = await import('../react/indoor-analysis.api')
  return {
    presignUpload: vi.mocked(api.presignUpload),
    uploadToS3: vi.mocked(api.uploadToS3),
    confirmUpload: vi.mocked(api.confirmUpload),
    runIndoorAnalysis: vi.mocked(api.runIndoorAnalysis),
  }
}

// --- Test fixtures ---

const mockPresignData = {
  fileId: 'abc-123',
  url: 'https://s3.example.com/upload',
  fields: { key: 'uploads/abc-123', Policy: 'xxx' },
}

const mockHeatmapData: HeatmapPointData = {
  minLegend: 0,
  maxLegend: 5.2,
  points: [
    { x: 1.0, y: 2.0, z: 0.5, df: 3.1 },
    { x: 1.5, y: 2.5, z: 0.5, df: 1.8 },
  ],
}

const baseInput: RunDaylightFactorInput = {
  buffer: new ArrayBuffer(8),
  filename: 'model.ifc',
  floorIndex: 0, // 0-based floor index derived from storey order
  latitude: 41.39,
  longitude: 2.17,
}

/** Set up all API mocks for a successful 4-step flow */
async function setupSuccessfulFlow() {
  const mocks = await getApiMocks()
  mocks.presignUpload.mockResolvedValue(mockPresignData)
  mocks.uploadToS3.mockResolvedValue(undefined)
  mocks.confirmUpload.mockResolvedValue({ key: 'uploads/abc-123.ifc' })
  mocks.runIndoorAnalysis.mockResolvedValue(mockHeatmapData)
  return mocks
}

// --- Tests ---

describe('useRunDaylightFactor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAnalysisStore.getState().reset()
  })

  it('should call all 4 API steps in sequence', async () => {
    const mocks = await setupSuccessfulFlow()

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // All 4 steps called exactly once
    expect(mocks.presignUpload).toHaveBeenCalledTimes(1)
    expect(mocks.uploadToS3).toHaveBeenCalledTimes(1)
    expect(mocks.confirmUpload).toHaveBeenCalledTimes(1)
    expect(mocks.runIndoorAnalysis).toHaveBeenCalledTimes(1)

    // uploadToS3 received presign data and a File
    const [presignArg, fileArg] = mocks.uploadToS3.mock.calls[0]
    expect(presignArg).toBe(mockPresignData)
    expect(fileArg).toBeInstanceOf(File)
    expect(fileArg.name).toBe('model.ifc')

    // confirmUpload received the fileId
    expect(mocks.confirmUpload).toHaveBeenCalledWith('abc-123')

    // runIndoorAnalysis received analysis params with kebab-case keys
    expect(mocks.runIndoorAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'abc-123',
        analysisType: 'daylight-factor',
        latitude: 41.39,
        longitude: 2.17,
      }),
    )
  })

  it('should update analysisStep through the flow and clear on success', async () => {
    const mocks = await getApiMocks()
    const stepLog: (string | null)[] = []

    // Capture analysisStep at each API call
    mocks.presignUpload.mockImplementation(async () => {
      stepLog.push(useAnalysisStore.getState().analysisStep)
      return mockPresignData
    })
    mocks.uploadToS3.mockImplementation(async () => {
      stepLog.push(useAnalysisStore.getState().analysisStep)
    })
    mocks.confirmUpload.mockImplementation(async () => {
      stepLog.push(useAnalysisStore.getState().analysisStep)
      return { key: 'uploads/abc-123.ifc' }
    })
    mocks.runIndoorAnalysis.mockImplementation(async () => {
      stepLog.push(useAnalysisStore.getState().analysisStep)
      return mockHeatmapData
    })

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // presign + upload happen during 'uploading', confirm during 'validating', run during 'analyzing'
    expect(stepLog).toEqual(['uploading', 'uploading', 'validating', 'analyzing'])
    // Step is cleared after success
    expect(useAnalysisStore.getState().analysisStep).toBeNull()
  })

  it('should pass floorIndex to runIndoorAnalysis', async () => {
    const mocks = await setupSuccessfulFlow()

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ ...baseInput, floorIndex: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mocks.runIndoorAnalysis).toHaveBeenCalledWith(expect.objectContaining({ floorIndex: 2 }))
  })

  it('should call toast.loading with step-specific messages', async () => {
    await setupSuccessfulFlow()
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify toast.loading was called with each step message
    expect(toast.loading).toHaveBeenCalledWith('Uploading file...', {
      id: 'daylight-factor',
    })
    expect(toast.loading).toHaveBeenCalledWith('Validating IFC...', {
      id: 'daylight-factor',
    })
    expect(toast.loading).toHaveBeenCalledWith('Running daylight analysis...', {
      id: 'daylight-factor',
    })
  })

  it('should call toast.success and setHeatmapData on success', async () => {
    await setupSuccessfulFlow()
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith('Analysis complete', {
      id: 'daylight-factor',
    })

    // Verify the heatmap data was stored in the analysis store
    expect(useAnalysisStore.getState().heatmapData).toBe(mockHeatmapData)
  })

  it('should call toast.error with error message on failure', async () => {
    const mocks = await getApiMocks()
    const error = new Error('File too large')
    mocks.presignUpload.mockRejectedValue(error)
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('File too large', {
      id: 'daylight-factor',
    })
  })

  it('should show generic message for non-Error rejection', async () => {
    const mocks = await getApiMocks()
    mocks.presignUpload.mockRejectedValue('string-error')
    const { toast } = await import('sonner')

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Daylight analysis failed', {
      id: 'daylight-factor',
    })
  })

  it('should not retry on failure (retry: 0)', async () => {
    const mocks = await getApiMocks()
    mocks.presignUpload.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Should only be called once -- no retries
    expect(mocks.presignUpload).toHaveBeenCalledTimes(1)
  })

  it('should return the HeatmapPointData on success', async () => {
    await setupSuccessfulFlow()

    const { result } = renderHook(() => useRunDaylightFactor(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(baseInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBe(mockHeatmapData)
  })
})
