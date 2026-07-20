# Domain Template

This document provides patterns and templates for creating new domains in the client application. Follow these patterns to ensure consistency across the codebase.

---

## Domain Structure

Each domain follows this file structure:

```
domains/{domain-name}/
├── index.ts                    # Public barrel export
├── {domain}.store.ts           # Zustand store with middleware
├── {domain}.api.ts             # React Query hooks
├── {domain}.types.ts           # TypeScript interfaces
├── {domain}.layer.ts           # DeckGL layer factory (if applicable)
├── {domain}.utils.ts           # Pure utility functions
├── hooks/                      # Extracted custom hooks (optional)
│   ├── use{Feature}.ts         # Focused hook for a single concern
│   └── ...
├── components/
│   ├── {Domain}Panel.tsx       # Main panel component
│   └── {Domain}Controls.tsx    # Layer controls component
└── __tests__/
    ├── {domain}.store.test.ts  # Store unit tests
    ├── {domain}.api.test.ts    # API hook tests
    └── {domain}.utils.test.ts  # Utility tests
```

### Hooks Directory

When a component grows too large, extract focused hooks into `hooks/`. Each hook should own a single concern (e.g., keyboard shortcuts, drag interaction, viewport sync). See `domains/map/hooks/` for examples:

- `useKeyboardShortcuts.ts` -- Escape/number key handling
- `useViewportSync.ts` -- Viewport threshold synchronization
- `useDragInteraction.ts` -- Gizmo drag handlers
- `useMapLayers.ts` -- DeckGL layer composition
- `usePointerEvents.ts` -- Pointer event side effects

Hooks within the same domain use direct relative imports. Hooks accessing other domains use barrel imports.

---

## Store Pattern

Use both `persist` and `subscribeWithSelector` middleware for all stores.

```typescript
// domains/{domain}/{domain}.store.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

interface {Domain}Item {
  id: string
  // ... item properties
}

interface {Domain}State {
  // State
  items: Record<string, {Domain}Item>
  selectedId: string | null

  // Actions
  setItems: (items: Record<string, {Domain}Item>) => void
  selectItem: (id: string | null) => void
  reset: () => void
}

// Extract initial state for testing
const initialState = {
  items: {} as Record<string, {Domain}Item>,
  selectedId: null as string | null,
}

export const use{Domain}Store = create<{Domain}State>()(
  persist(
    subscribeWithSelector((set) => ({
      ...initialState,

      setItems: (items) => set({ items }),

      selectItem: (id) => set({ selectedId: id }),

      reset: () => set(initialState),
    })),
    {
      name: '{domain}-store',
      // Only persist what's needed (not computed or temporary state)
      partialize: (state) => ({
        selectedId: state.selectedId,
      }),
    }
  )
)

// Export for testing - allows resetting to known state
export const get{Domain}InitialState = () => ({ ...initialState })
```

### Cross-Domain Subscriptions

Use `subscribeWithSelector` to subscribe to specific state slices:

```typescript
// In trees domain - subscribe to map store changes
import { useMapStore } from '@/domains/map'
import { useEffect, useState } from 'react'

export function useTreesNearSelectedBuilding() {
  const [nearbyTrees, setNearbyTrees] = useState<Tree[]>([])

  useEffect(() => {
    // Subscribe only to selectedMeshId changes, not entire store
    const unsubscribe = useMapStore.subscribe(
      (state) => state.selectedMeshId,
      (selectedMeshId) => {
        if (selectedMeshId) {
          setNearbyTrees(findTreesNearBuilding(selectedMeshId))
        }
      }
    )
    return unsubscribe
  }, [])

  return nearbyTrees
}
```

### Import Conventions

**Cross-domain imports** always go through barrel exports:

```typescript
// GOOD: Barrel import for cross-domain access
import { useMapStore, type BuildingsViewport } from '@/domains/map'
import { useAnalysisStore, createAnalysisGridLayer } from '@/domains/analysis'

// BAD: Direct file import for cross-domain access
import { useMapStore } from '@/domains/map/map.store'
import { useAnalysisStore } from '@/domains/analysis/analysis.store'
```

**Within-domain imports** use direct relative paths:

```typescript
// Inside domains/map/hooks/useMapLayers.ts
import { useMapStore } from '../map.store'
import type { ViewState } from '../map.store'
```

### useShallow for Multi-Value Selectors

Always wrap multi-value Zustand selectors with `useShallow` from `zustand/react/shallow` to prevent unnecessary re-renders when unrelated state changes:

```typescript
import { useShallow } from 'zustand/react/shallow'

// GOOD: Only re-renders when selectedMeshId or hoveredMeshId change
const { selectedMeshId, hoveredMeshId } = useMapStore(
  useShallow((s) => ({
    selectedMeshId: s.selectedMeshId,
    hoveredMeshId: s.hoveredMeshId,
  }))
)

// GOOD: Single value selector -- useShallow not needed
const selectedMeshId = useMapStore((s) => s.selectedMeshId)

// BAD: Multi-value without useShallow -- re-renders on ANY store change
const { selectedMeshId, hoveredMeshId } = useMapStore((s) => ({
  selectedMeshId: s.selectedMeshId,
  hoveredMeshId: s.hoveredMeshId,
}))
```

---

## API Hook Pattern

Use React Query with the query keys factory pattern.

```typescript
// domains/{domain}/{domain}.api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { {domain}Keys } from '@/lib/query-keys'
import type { {Domain}Item, {Domain}ItemInput } from './{domain}.types'

// Fetch items for a viewport
export function use{Domain}Items(
  latitude: number,
  longitude: number,
  width: number,
  height: number
) {
  return useQuery({
    // IMPORTANT: Use primitive values as keys (not objects)
    // Objects cause cache misses due to reference changes
    queryKey: {domain}Keys.viewport(latitude, longitude, width, height),
    queryFn: async () => {
      const response = await api.post<ApiResponse<Record<string, {Domain}Item>>>(
        '/infrared/{domain}',
        {
          coordinates: { latitude, longitude },
          size: { x: width, y: height }
        }
      )
      return response.data || {}
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!latitude && !!longitude,
  })
}

// Mutation example
export function useCreate{Domain}ItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {Domain}ItemInput) => {
      const response = await api.post<ApiResponse<{Domain}Item>>(
        '/infrared/{domain}',
        input
      )
      return response.data
    },
    onSuccess: () => {
      // Invalidate all {domain} queries to refetch
      queryClient.invalidateQueries({ queryKey: {domain}Keys.all })
    },
  })
}
```

### Query Keys Factory

Add keys for new domains in `lib/query-keys.ts`:

```typescript
// lib/query-keys.ts

// GOOD: Primitive values as key parts
export const {domain}Keys = {
  all: ['{domain}'] as const,
  viewport: (lat: number, lng: number, width: number, height: number) =>
    [...{domain}Keys.all, 'viewport', lat, lng, width, height] as const,
  detail: (id: string) =>
    [...{domain}Keys.all, 'detail', id] as const,
}

// BAD: Objects as key parts (causes cache misses)
// viewport: (viewport: Viewport) => [...{domain}Keys.all, 'viewport', viewport]
```

---

## Layer Pattern (for DeckGL domains)

```typescript
// domains/{domain}/{domain}.layer.ts
import { SimpleMeshLayer, COORDINATE_SYSTEM } from 'deck.gl'
import type { {Domain}Item } from './{domain}.types'

export interface {Domain}LayerOptions {
  selectedId?: string
  hoveredId?: string
  opacity?: number
}

export function create{Domain}Layer(
  items: {Domain}Item[],
  origin: [number, number],
  options: {Domain}LayerOptions = {}
): SimpleMeshLayer {
  const { selectedId, hoveredId, opacity = 0.8 } = options

  return new SimpleMeshLayer({
    id: '{domain}-layer',
    data: items,
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [origin[0], origin[1], 0],
    // ... layer-specific props
  })
}
```

---

## Types Pattern

```typescript
// domains/{domain}/{domain}.types.ts

export interface {Domain}Item {
  id: string
  // ... properties
}

export interface {Domain}ItemInput {
  // Input for creating/updating items
}

export interface {Domain}Config {
  // Configuration options
}
```

---

## Index Barrel Export

```typescript
// domains/{domain}/index.ts

// Store
export { use{Domain}Store, get{Domain}InitialState } from './{domain}.store'

// API hooks
export { use{Domain}Items, useCreate{Domain}ItemMutation } from './{domain}.api'

// Types
export type { {Domain}Item, {Domain}ItemInput, {Domain}Config } from './{domain}.types'

// Layer (if applicable)
export { create{Domain}Layer, type {Domain}LayerOptions } from './{domain}.layer'

// Hooks (if extracted)
export { use{Feature}Hook } from './hooks/use{Feature}Hook'

// Components
export { {Domain}Panel } from './components/{Domain}Panel'
export { {Domain}Controls } from './components/{Domain}Controls'
```

Every public symbol must be re-exported from `index.ts`. This is the only file other domains should import from.

---

## Testing Patterns

### Store Tests

```typescript
// domains/{domain}/__tests__/{domain}.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { use{Domain}Store, get{Domain}InitialState } from '../{domain}.store'

describe('use{Domain}Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    use{Domain}Store.setState(get{Domain}InitialState())
  })

  describe('selectItem', () => {
    it('should update selectedId', () => {
      use{Domain}Store.getState().selectItem('item-123')
      expect(use{Domain}Store.getState().selectedId).toBe('item-123')
    })

    it('should allow deselection with null', () => {
      use{Domain}Store.getState().selectItem('item-123')
      use{Domain}Store.getState().selectItem(null)
      expect(use{Domain}Store.getState().selectedId).toBeNull()
    })
  })

  describe('subscriptions', () => {
    it('should support fine-grained subscriptions', () => {
      const callback = vi.fn()

      const unsubscribe = use{Domain}Store.subscribe(
        (state) => state.selectedId,
        callback
      )

      use{Domain}Store.getState().selectItem('item-1')
      expect(callback).toHaveBeenCalledWith('item-1', null)

      unsubscribe()
    })
  })
})
```

### API Hook Tests

```typescript
// domains/{domain}/__tests__/{domain}.api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { use{Domain}Items } from '../{domain}.api'
import { api } from '@/lib/api'

vi.mock('@/lib/api')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('use{Domain}Items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch items for viewport', async () => {
    const mockItems = { 'item-1': { id: 'item-1' } }
    vi.mocked(api.post).mockResolvedValue({ data: mockItems })

    const { result } = renderHook(
      () => use{Domain}Items(40.7, -74, 500, 500),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockItems)
  })

  it('should not fetch when coordinates are zero', () => {
    const { result } = renderHook(
      () => use{Domain}Items(0, 0, 500, 500),
      { wrapper: createWrapper() }
    )

    expect(result.current.isFetching).toBe(false)
  })
})
```

---

## File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| Store | `{domain}.store.ts` | `trees.store.ts` |
| API hooks | `{domain}.api.ts` | `trees.api.ts` |
| Types | `{domain}.types.ts` | `trees.types.ts` |
| Utilities | `{domain}.utils.ts` | `trees.utils.ts` |
| DeckGL layers | `{domain}.layer.ts` | `trees.layer.ts` |
| Custom hooks | `hooks/use{Feature}.ts` | `hooks/useKeyboardShortcuts.ts` |
| Components | `PascalCase.tsx` | `TreesPanel.tsx` |
| Tests | `{filename}.test.ts` | `trees.store.test.ts` |
| Cache utilities | `{domain}.cache.ts` | `trees.cache.ts` |

---

## Checklist for New Domains

- [ ] Create domain folder: `domains/{domain-name}/`
- [ ] Create types file: `{domain}.types.ts`
- [ ] Create store with both middleware: `{domain}.store.ts`
- [ ] Create API hooks: `{domain}.api.ts`
- [ ] Add query keys to `lib/query-keys.ts`
- [ ] Create layer factory (if needed): `{domain}.layer.ts`
- [ ] Create barrel export: `index.ts`
- [ ] Write store tests: `__tests__/{domain}.store.test.ts`
- [ ] Write API tests: `__tests__/{domain}.api.test.ts`
- [ ] Achieve >80% test coverage for store and utils

---

## Examples in Codebase

Reference these existing domains as examples:

- **`domains/map/`** - Store with subscribeWithSelector, state management
- **`domains/buildings/`** - Layer factory, mesh processing, caching
- **`domains/analysis/`** - React Query hooks, complex state

---

## Common Pitfalls

1. **Missing `subscribeWithSelector`** - Store subscriptions won't work correctly
2. **Object keys in React Query** - Use primitives to avoid cache misses
3. **Forgetting to export from index** - Causes import errors in consumers
4. **Not resetting store in tests** - Tests become order-dependent
5. **Unbounded caches** - Add size limits with LRU eviction
6. **Missing `useShallow` on multi-value selectors** - Causes re-renders on every store change, not just the selected fields
7. **Direct cross-domain imports** - Bypassing barrel exports breaks encapsulation and makes refactoring harder
8. **Large component files** - Extract hooks into `hooks/` directory when a component exceeds ~200 lines
