import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { Feature } from 'geojson'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GroundMaterialRegistry } from '../core/ground-materials.sdk-types'

// ---------------------------------------------------------------------------
// Mock the registry hook BEFORE importing the draw-hook so renderHook sees
// our stub data instead of trying to hit a real API client.
// ---------------------------------------------------------------------------

function makeRegistryElement(name: string, uuid: string) {
  return {
    name,
    displayName: name,
    diffuseColor: [0.1, 0.1, 0.1],
    specularColor: [0, 0, 0],
    shine: 0,
    reflectivity: 0.05,
    emissiveColor: [0, 0, 0],
    opacity: 1,
    thickness: 0.1,
    density: 1000,
    thermalConductivity: 0.5,
    specificHeat: 1000,
    solarAbsorptance: 0.9,
    thermalAbsorptance: 0.9,
    visibleAbsorptance: 0.9,
    roughness: 0.8,
    porosity: 0.05,
    carbonFactor: 0,
    uuid,
  } as const
}

const mockRegistry: GroundMaterialRegistry = {
  version: '1.0',
  uuid: 'registry-uuid',
  materials: {
    'uuid-asphalt': makeRegistryElement('asphalt', 'uuid-asphalt'),
    'uuid-concrete': makeRegistryElement('concrete', 'uuid-concrete'),
    'uuid-vegetation': makeRegistryElement('vegetation', 'uuid-vegetation'),
  },
}

vi.mock('../react/ground-materials.api', async () => {
  const actual = await vi.importActual<typeof import('../react/ground-materials.api')>(
    '../react/ground-materials.api',
  )
  return {
    ...actual,
    useGroundMaterialRegistry: () => ({ data: mockRegistry, isLoading: false, error: null }),
  }
})

import {
  _setDrawInstanceForTest,
  useGroundMaterialsDraw,
} from '../react/ground-materials.draw-hook'
import {
  getGroundMaterialsInitialState,
  useGroundMaterialsStore,
} from '../react/ground-materials.store'

// ---------------------------------------------------------------------------
// Fake MapboxDraw -- only the surface used by the preview API.
// ---------------------------------------------------------------------------

function makeFakeDraw() {
  const features = new Map<string, Feature>()

  const api = {
    getMode: vi.fn(() => 'simple_select' as const),
    get: vi.fn((id: string) => features.get(id)),
    getAll: vi.fn(() => ({
      type: 'FeatureCollection' as const,
      features: Array.from(features.values()),
    })),
    add: vi.fn((feature: Feature | { features: Feature[] }) => {
      const list = 'features' in feature ? feature.features : [feature]
      const ids: string[] = []
      for (const f of list) {
        const id = String(f.id ?? `auto-${features.size + 1}`)
        features.set(id, { ...f, id })
        ids.push(id)
      }
      return ids
    }),
    delete: vi.fn((ids: string | string[]) => {
      const list = Array.isArray(ids) ? ids : [ids]
      for (const id of list) features.delete(id)
      return api
    }),
    setFeatureProperty: vi.fn((id: string, key: string, value: unknown) => {
      const f = features.get(id)
      if (!f) return api
      const nextProps = { ...(f.properties ?? {}) }
      if (value === undefined) {
        delete (nextProps as Record<string, unknown>)[key]
      } else {
        ;(nextProps as Record<string, unknown>)[key] = value
      }
      features.set(id, { ...f, properties: nextProps })
      return api
    }),
    _features: features,
  }

  return api
}

function makeFeature(id: string, properties: Record<string, unknown> = {}): Feature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    },
    properties,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useGroundMaterialsDraw -- confirmPreviewFeaturesPerFeature', () => {
  beforeEach(() => {
    useGroundMaterialsStore.setState(getGroundMaterialsInitialState())
  })

  afterEach(() => {
    _setDrawInstanceForTest(null)
    useGroundMaterialsStore.setState(getGroundMaterialsInitialState())
  })

  it('stamps each preview with its labeled material and clears the preview flag', () => {
    const fake = makeFakeDraw()
    fake.add(makeFeature('p1', { preview: true, material: 'concrete' }))
    fake.add(makeFeature('p2', { preview: true, material: 'vegetation' }))
    fake.add(makeFeature('p3', { preview: true, material: 'asphalt' }))
    _setDrawInstanceForTest(fake as never)

    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    const out = result.current.confirmPreviewFeaturesPerFeature(['p1', 'p2', 'p3'])

    expect(out.ids).toEqual(['p1', 'p2', 'p3'])
    expect(out.warning).toBeNull()

    const p1 = fake._features.get('p1')!
    const p2 = fake._features.get('p2')!
    expect(p1.properties).toMatchObject({ material: 'concrete' })
    expect(p1.properties).not.toHaveProperty('preview')
    expect(p2.properties).toMatchObject({ material: 'vegetation' })

    const state = useGroundMaterialsStore.getState()
    expect(state.lastCreatedFeatures).toHaveLength(3)
    expect(state.actionableState).toBe(true)
  })

  it('routes partial-labeled previews through the panel fallback and returns a warning', () => {
    useGroundMaterialsStore.getState().setMaterial('concrete')

    const fake = makeFakeDraw()
    fake.add(makeFeature('p1', { preview: true, material: 'asphalt' }))
    fake.add(makeFeature('p2', { preview: true }))
    fake.add(makeFeature('p3', { preview: true, material: 'mystery' }))
    _setDrawInstanceForTest(fake as never)

    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    const out = result.current.confirmPreviewFeaturesPerFeature(['p1', 'p2', 'p3'])

    expect(out.ids).toEqual(['p1', 'p2', 'p3'])
    expect(out.warning).not.toBeNull()
    expect(out.warning).toContain('concrete')
    expect(out.warning).toContain('mystery')

    expect(fake._features.get('p1')!.properties).toMatchObject({ material: 'asphalt' })
    expect(fake._features.get('p2')!.properties).toMatchObject({ material: 'concrete' })
    expect(fake._features.get('p3')!.properties).toMatchObject({ material: 'concrete' })
  })

  it('returns empty + null when the draw instance is not mounted', () => {
    _setDrawInstanceForTest(null)
    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    const out = result.current.confirmPreviewFeaturesPerFeature(['p1'])
    expect(out).toEqual({ ids: [], warning: null })
  })
})

describe('useGroundMaterialsDraw -- replaceAllWithPreview', () => {
  beforeEach(() => {
    useGroundMaterialsStore.setState(getGroundMaterialsInitialState())
  })

  afterEach(() => {
    _setDrawInstanceForTest(null)
    useGroundMaterialsStore.setState(getGroundMaterialsInitialState())
  })

  it('wipes pre-existing features and commits previews in one transaction (per-feature)', () => {
    const fake = makeFakeDraw()
    fake.add(makeFeature('existing-1', { material: 'asphalt' }))
    fake.add(makeFeature('existing-2', { material: 'concrete' }))
    fake.add(makeFeature('p1', { preview: true, material: 'vegetation' }))
    fake.add(makeFeature('p2', { preview: true, material: 'concrete' }))
    _setDrawInstanceForTest(fake as never)

    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    const out = result.current.replaceAllWithPreview(['p1', 'p2'], 'per-feature')

    expect(out.ids).toEqual(['p1', 'p2'])
    expect(out.warning).toBeNull()

    expect(fake._features.has('existing-1')).toBe(false)
    expect(fake._features.has('existing-2')).toBe(false)
    expect(fake._features.get('p1')!.properties).toMatchObject({ material: 'vegetation' })

    const state = useGroundMaterialsStore.getState()
    expect(state.lastDeletedFeatures.map((f) => String(f.id)).sort()).toEqual([
      'existing-1',
      'existing-2',
    ])
    expect(state.lastCreatedFeatures.map((f) => String(f.id)).sort()).toEqual(['p1', 'p2'])
    expect(state.actionableState).toBe(true)
  })

  it('handles an empty starting state without spurious deletes', () => {
    const fake = makeFakeDraw()
    fake.add(makeFeature('p1', { preview: true, material: 'concrete' }))
    _setDrawInstanceForTest(fake as never)

    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    const out = result.current.replaceAllWithPreview(['p1'], 'global', 'concrete')

    expect(out.ids).toEqual(['p1'])
    expect(out.warning).toBeNull()

    const state = useGroundMaterialsStore.getState()
    expect(state.lastDeletedFeatures).toEqual([])
    expect(state.lastCreatedFeatures.map((f) => String(f.id))).toEqual(['p1'])
    expect(fake._features.get('p1')!.properties).toMatchObject({ material: 'concrete' })
  })

  it('does not mark in-session created features as deletes during replace', () => {
    const fake = makeFakeDraw()
    const drawnInSession = makeFeature('session-1', { material: 'asphalt' })
    fake.add(drawnInSession)
    fake.add(makeFeature('p1', { preview: true, material: 'concrete' }))
    _setDrawInstanceForTest(fake as never)

    useGroundMaterialsStore.getState().addCreated([drawnInSession])

    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    result.current.replaceAllWithPreview(['p1'], 'global', 'concrete')

    const state = useGroundMaterialsStore.getState()
    expect(state.lastDeletedFeatures.map((f) => String(f.id))).not.toContain('session-1')
    expect(state.lastCreatedFeatures.map((f) => String(f.id))).toEqual(['p1'])
  })

  it('propagates fallback warnings in per-feature mode', () => {
    const fake = makeFakeDraw()
    fake.add(makeFeature('existing-1', { material: 'asphalt' }))
    fake.add(makeFeature('p1', { preview: true, material: 'mystery' }))
    _setDrawInstanceForTest(fake as never)
    useGroundMaterialsStore.getState().setMaterial('concrete')

    const { result } = renderHook(() => useGroundMaterialsDraw(), { wrapper: createWrapper() })
    const out = result.current.replaceAllWithPreview(['p1'], 'per-feature')

    expect(out.warning).not.toBeNull()
    expect(out.warning).toContain('mystery')
    expect(out.warning).toContain('concrete')
    expect(fake._features.get('p1')!.properties).toMatchObject({ material: 'concrete' })
  })
})
