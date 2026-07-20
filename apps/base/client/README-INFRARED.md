# Infrared SDK Integration

This document describes the Infrared SDK integration implementation following `architecture.md`.

## Architecture Overview

The integration follows three core domains:

1. **Infrared Domain** - React Query hooks calling the API, plus pure function layers
2. **Map Domain** - Viewport management, layer composition, and DeckGL/Mapbox rendering
3. **Analysis Domain** - Analysis execution, result storage, and visualization

## Key Patterns

### Pure Function Layer Composition

Layers are created by pure functions, not hooks or registries:

```typescript
// Pure function: data -> Deck.gl layer
function createBuildingMeshLayer(
  meshes: Record<string, DotBimMesh>,
  options: BuildingLayerOptions
): SolidPolygonLayer

// Composed explicitly in MapCanvas
const layers = [
  layerVisibility.buildings && buildings && createBuildingMeshLayer(buildings, { selectedId }),
  layerVisibility.analysis &&
    buildings &&
    analysisResult &&
    createAnalysisOverlayLayer(buildings, analysisResult.results, { colorScale }),
].filter(Boolean)
```

### Cross-Domain Communication

- **Query invalidation** for data staleness (no event bus)
- **Zustand stores** for shared UI state
- **React Query** for server/SDK state

```typescript
// When buildings change, analysis auto-refetches
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: buildingKeys.all })
  queryClient.invalidateQueries({ queryKey: analysisKeys.all })
}
```

## Domain Structure

### Infrared Domain (`src/domains/infrared/`)

- `infrared.api.ts` - React Query hooks calling the Infrared API routes
- `infrared.types.ts` - DotBim -> polygon transform utilities
- `infrared.layers.ts` - Pure layer factory functions
- `index.ts` - Public exports

### Map Domain (`src/domains/map/`)

- `map.store.ts` - Viewport, selection, layer visibility (Zustand)
- `components/MapCanvas.tsx` - DeckGL + Mapbox with explicit layer composition
- `components/LayerControls.tsx` - Layer visibility toggles

### Analysis Domain (`src/domains/analysis/`)

- `analysis.store.ts` - Active results, config, color scale (Zustand)
- `analysis.api.ts` - Execution hooks with cache invalidation
- `components/AnalysisPanel.tsx` - Analysis configuration UI
- `components/AnalysisResults.tsx` - Result display

## Setup

### 1. Install Dependencies

```bash
cd apps/base/client
bun install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Canonical dev mode: leave VITE_API_URL unset so the client falls back to the
# Vite proxy at `/api` (same-origin). Set it explicitly only for ad-hoc API
# probing against a non-default host.
# VITE_API_URL=http://localhost:9000
VITE_MAPBOX_TOKEN=your-mapbox-token
```

Infrared credentials live on the Python API side (root `.env`, read by
`uvicorn` via `python-dotenv`):

```env
# root .env
INFRARED_API_KEY=your-infrared-api-key
INFRARED_BASE_URL=https://api.infrared.dev
```

### 3. Run Development Server

```bash
bun run dev
```

Navigate to `/map` to see the integration in action.

## Usage

### Fetching Buildings

```typescript
import { useInfraredBuildings } from '@/domains/infrared'

const viewport = {
  latitude: 40.7128,
  longitude: -74.006,
  width: 512,
  height: 512,
}

const { data: buildings } = useInfraredBuildings(viewport)
// Returns: Record<string, DotBimMesh>
```

### Running Analysis

```typescript
import { useExecuteAnalysis } from '@/domains/analysis'
import { AnalysesName } from '@infrared/sdk'

const { mutate: executeAnalysis } = useExecuteAnalysis()

executeAnalysis({
  analysisType: AnalysesName.DirectSunHours,
  latitude: 40.7128,
  longitude: -74.006,
  buildingsRequest: {
    coordinates: { latitude: 40.7128, longitude: -74.006 },
    size: { x: 512, y: 512 },
    outputFormat: 'DotBim',
    compress: false,
    returnBuildingIds: true,
  },
  dateFilters: {
    period: {
      start: { month: 6, day: 1, hour: 8 },
      end: { month: 9, day: 30, hour: 18 },
    },
  },
})
```

### Creating Custom Layers

```typescript
import { createBuildingMeshLayer } from '@/domains/infrared'

// Pure function - no hooks, no side effects
const layer = createBuildingMeshLayer(buildings, {
  selectedId: 'mesh-42',
  opacity: 0.8,
})
```

## Data Flow

### Building Fetch Flow

```
User navigates map
  → useInfraredBuildings(viewport)
  → POST /infrared/buildings
  → Record<string, DotBimMesh>
  → TanStack Query cache
  → createBuildingMeshLayer()
  → DeckGL renders
```

### Analysis Execution Flow

```
User configures analysis
  → useExecuteAnalysis.mutate()
  → POST /infrared/analyses/run
    → (Server) sdk.utilities.getWeatherFileFromLocation()
    → (Server) sdk.utilities.filterWeatherData()
    → (Server) sdk.analyses.execute()
  → { results: Record<meshId, number[]> }
  → analysis.store.addResult()
  → createAnalysisOverlayLayer()
  → DeckGL renders colored overlay
```

## Key Conventions

- **No registry pattern** - Layers use pure functions, not dynamic discovery
- **No event bus** - Use query invalidation + Zustand
- **mesh_id linking** - Buildings and analysis results share string keys
- **Response wrapper** - SDK returns `{ data: T }` or `{ error: string }`

## Available Analysis Types

1. Direct Sun Hours (`direct-sun-hours`)
2. Daylight Availability (`daylight-availability`)
3. Solar Radiation (`solar-radiation`)
4. Wind Speed (`wind-speed`)
5. Pedestrian Wind Comfort (`pedestrian-wind-comfort`)
6. Thermal Comfort Index (`thermal-comfort-index`)
7. Thermal Comfort Statistics (`thermal-comfort-statistics`)

## References

- Full architecture: `/architecture.md`
- SDK documentation: `/packages/sdk/README.md`
- Domain template: `/apps/base/client/docs/DOMAIN_TEMPLATE.md`
- Feature patterns: `/.claude/skills/forge-kit-feature/SKILL.md`
- Architecture patterns: `/.claude/skills/forge-kit-architecture/SKILL.md`
