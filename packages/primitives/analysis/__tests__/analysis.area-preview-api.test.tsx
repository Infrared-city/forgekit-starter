import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { InfraredClient } from '@infrared-city/infrared-sdk-ts'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { Polygon as GeoJSONPolygon } from 'geojson'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysesName } from '../core/analysis.sdk-types'
import { createUseAreaPreview } from '../react/analysis.area-preview-api'
import { getAnalysisInitialState, useAnalysisStore } from '../react/analysis.store'
import { createWrapper } from './test-utils'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockSdkClient = {
  previewAreaWithPricing: vi.fn(),
}

const useAreaPreview = createUseAreaPreview(mockSdkClient as unknown as InfraredClient)

// ─── Fixtures ───────────────────────────────────────────────────────────────

const polygonA: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [2.15, 41.38],
      [2.16, 41.38],
      [2.16, 41.39],
      [2.15, 41.39],
      [2.15, 41.38],
    ],
  ],
}

const polygonB: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [5.0, 50.0],
      [5.01, 50.0],
      [5.01, 50.01],
      [5.0, 50.01],
      [5.0, 50.0],
    ],
  ],
}

const previewPayload = {
  tileCount: 12,
  estimatedTimeS: 120,
  estimatedCostTokens: 1200,
  tokensPerJob: 100,
  pricingSource: 'remote' as const,
  pricingVersion: '2026-06-01',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function resetStore() {
  useAnalysisStore.setState(getAnalysisInitialState())
}

function setStore(polygon: GeoJSONPolygon | null, type: AnalysesName | null) {
  useAnalysisStore.setState({ areaPolygon: polygon, areaAnalysisType: type })
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createUseAreaPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  it('does not fetch when areaPolygon is null', async () => {
    setStore(null, AnalysesName.WindSpeed)

    const { result } = renderHook(() => useAreaPreview(), { wrapper: createWrapper() })

    await new Promise((r) => setTimeout(r, 20))
    expect(mockSdkClient.previewAreaWithPricing).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('does not fetch when areaAnalysisType is null', async () => {
    setStore(polygonA, null)

    renderHook(() => useAreaPreview(), { wrapper: createWrapper() })

    await new Promise((r) => setTimeout(r, 20))
    expect(mockSdkClient.previewAreaWithPricing).not.toHaveBeenCalled()
  })

  it('does not fetch when analysis type is not in TILING_SUPPORTED_TYPES', async () => {
    setStore(polygonA, 'unknown-tiling-type' as unknown as AnalysesName)

    renderHook(() => useAreaPreview(), { wrapper: createWrapper() })

    await new Promise((r) => setTimeout(r, 20))
    expect(mockSdkClient.previewAreaWithPricing).not.toHaveBeenCalled()
  })

  it('fetches when polygon, type, and type-support are all present', async () => {
    mockSdkClient.previewAreaWithPricing.mockResolvedValue(previewPayload)
    setStore(polygonA, AnalysesName.WindSpeed)

    const { result } = renderHook(() => useAreaPreview(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(mockSdkClient.previewAreaWithPricing).toHaveBeenCalledTimes(1)
  })

  it('returns preview data directly', async () => {
    mockSdkClient.previewAreaWithPricing.mockResolvedValue(previewPayload)
    setStore(polygonA, AnalysesName.WindSpeed)

    const { result } = renderHook(() => useAreaPreview(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toEqual(previewPayload))
  })

  it('surfaces isError + error on SDK failure', async () => {
    const err = new Error('Invalid polygon')
    mockSdkClient.previewAreaWithPricing.mockRejectedValue(err)
    setStore(polygonA, AnalysesName.WindSpeed)

    const { result } = renderHook(() => useAreaPreview(), { wrapper: createWrapper() })

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true)
      },
      { timeout: 5000 },
    )
    expect(result.current.error?.message).toBe('Invalid polygon')
    // Retry=1 means 2 calls total (initial + 1 retry).
    expect(mockSdkClient.previewAreaWithPricing).toHaveBeenCalledTimes(2)
  })

  it('changing polygon coordinates triggers a new fetch', async () => {
    mockSdkClient.previewAreaWithPricing.mockResolvedValue(previewPayload)
    setStore(polygonA, AnalysesName.WindSpeed)

    const { result, rerender } = renderHook(() => useAreaPreview(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).toEqual(previewPayload))
    expect(mockSdkClient.previewAreaWithPricing).toHaveBeenCalledTimes(1)

    act(() => {
      setStore(polygonB, AnalysesName.WindSpeed)
    })
    rerender()

    await waitFor(() => expect(mockSdkClient.previewAreaWithPricing).toHaveBeenCalledTimes(2))
  })
})

// ─── No tiling imports assertion (area UI files) ─────────────────────────

describe('no tiling imports (area UI files)', () => {
  it('none of the area UI files import from @infrared-city/infrared-sdk-ts/tiling', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const paths = [resolve(here, '../react/analysis.area-preview-api.ts')]
    for (const p of paths) {
      const source = readFileSync(p, 'utf8')
      expect(source, `${p} must not import @infrared-city/infrared-sdk-ts/tiling`).not.toContain(
        '@infrared-city/infrared-sdk-ts/tiling',
      )
    }
  })
})
