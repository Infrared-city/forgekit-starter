# @forge-kit/analysis

Environmental analysis primitives for the Infrared platform — color scales, area-tiled analysis orchestration, weather data integration, and deck.gl bitmap layers.

## Installation

Nothing to install — this is a workspace package, consumed from source via
the aliases in `apps/base/client/vite.aliases.ts` (and the matching tsconfig
`paths`).

## Subpath Exports

| Import | Description |
|--------|-------------|
| `@forge-kit/analysis` | Full barrel — core + react + plugin |
| `@forge-kit/analysis/core` | Framework-agnostic: color scales, analysis types, constants. No React/Zustand. Safe for Node.js. |
| `@forge-kit/analysis/react` | React hooks, Zustand store, deck.gl bitmap layers, weather hooks |

## Peer Dependencies

Full usage requires `react`, `zustand`, `@tanstack/react-query`, `deck.gl`, and `@deck.gl-community/editable-layers`. All are marked optional — the `./core` subpath works without any of them.

## Headless / Node.js Usage

```ts
import {
  createColorScaleForAnalysis,
  AnalysesName,
  ANALYSIS_TYPE_LABELS,
  getAnalysisIcon,
} from '@forge-kit/analysis/core'

// Create a color scale for a specific analysis type
const colorScale = createColorScaleForAnalysis('wind-speed', { min: 0, max: 15 })
const [r, g, b] = colorScale(7.5)

// Analysis type constants
console.log(AnalysesName.windSpeed)              // 'wind-speed'
console.log(ANALYSIS_TYPE_LABELS['wind-speed'])   // 'Wind Speed'
```

### Available analysis types

```ts
import { AnalysesName, TILING_SUPPORTED_TYPES } from '@forge-kit/analysis/core'

// All analysis types
AnalysesName.windSpeed                 // 'wind-speed'
AnalysesName.pedestrianWindComfort     // 'pedestrian-wind-comfort'
AnalysesName.daylightAvailability      // 'daylight-availability'
AnalysesName.directSunHours            // 'direct-sun-hours'
AnalysesName.skyViewFactors            // 'sky-view-factors'
AnalysesName.solarRadiation            // 'solar-radiation'
AnalysesName.shadowMask                // 'shadow-mask'
AnalysesName.thermalComfortIndex       // 'thermal-comfort-index'
AnalysesName.thermalComfortStatistics  // 'thermal-comfort-statistics'

// All types support tiling
console.log(TILING_SUPPORTED_TYPES)
```

## React Usage

```ts
import { useAnalysisMapPlugin } from '@forge-kit/analysis'
import type { AnalysisDeps } from '@forge-kit/analysis'

// In your composition root:
const deps: AnalysisDeps = {
  sdkClient,
  apiClient,
  getViewport: () => viewport,
  getPolygon: () => polygon,
  // ... other deps
}

const analysisPlugin = useAnalysisMapPlugin(deps)
// Returns a MapPlugin with layers, Panel, and analysis controls
```

### Weather data hooks

```ts
import { createWeatherHooks } from '@forge-kit/analysis/react'

const { useWeatherLocations, useWeatherData } = createWeatherHooks(sdkClient)
```

### Area preview (pricing) hook

```ts
import { createUseAreaPreview } from '@forge-kit/analysis/react'

// Second arg is optional. `maxTilesOverride` lifts the SDK's default 100
// non-empty-tile cap so a large drawn area still PRICES instead of throwing the
// tile-limit PolygonValidationError — pass the same ceiling your run + context
// fetch use. Omit → SDK default.
const useAreaPreview = createUseAreaPreview(sdkClient, { maxTilesOverride: 128 })
```

### Area bitmap layer

```ts
import { createAreaBitmapLayer } from '@forge-kit/analysis/react'

// Main-thread build: colorScale bakes the min/max domain at construction.
const layer = createAreaBitmapLayer({ result, colorScale, opacity, zOffsetM })

// Off-thread build: pixels pre-colorized elsewhere (e.g. a decode worker via
// the core `flatGridToRgba` / `scanFlatGridDomain` helpers) arrive as
// `AreaRunResult.prebuiltBitmap` and skip the per-cell matrix walk entirely.
const fast = createAreaBitmapLayer({ result, prebuilt: result.prebuiltBitmap })
```

`useAreaBitmapLayer` picks between the two automatically: the prebuilt path is
taken only when the bitmap's dimensions AND color-scale variant (see
`colorScaleVariantFor`) match the live store state — stale pixels fall back to
the main-thread build rather than mis-rendering.

## Development

```bash
bun run --cwd packages/primitives/analysis build
bun run --cwd packages/primitives/analysis typecheck
bun run --cwd packages/primitives/analysis test:run
```
