# @infrared/analysis-colors

Color scales and utilities for environmental analysis visualization. Provides UTCI thermal comfort, wind speed, heatmap, and generic color scale functions used across the Infrared platform.

## Installation

Nothing to install — this is a workspace package, consumed from source via
the aliases in `apps/base/client/vite.aliases.ts` (and the matching tsconfig
`paths`). Import it as `@infrared/analysis-colors`.

## Subpath Exports

| Import | Description |
|--------|-------------|
| `@infrared/analysis-colors` | Full barrel — all color scales, helpers, types |
| `@infrared/analysis-colors/utci` | UTCI thermal stress colors, domains, labels |
| `@infrared/analysis-colors/heatmap` | Heatmap color scales (default, day/night) |
| `@infrared/analysis-colors/wind` | Wind speed + comfort color scales, compass utilities |
| `@infrared/analysis-colors/helpers` | Generic utilities: hex/rgb conversion, gradient/stepped scales, mesh coloring |

## Usage

### Create a color scale from the analysis registry

```ts
import { createColorScaleFromRegistry } from '@infrared/analysis-colors'

const viz = createColorScaleFromRegistry('wind-speed')
const color = viz.getColor(5.2) // [r, g, b]
```

### UTCI thermal comfort

```ts
import { getUtciColor, getUtciThermalStressLabel } from '@infrared/analysis-colors/utci'

const rgb = getUtciColor(28)                    // [r, g, b]
const label = getUtciThermalStressLabel(28)      // "moderate heat stress"
```

### Wind speed coloring

```ts
import { getWindSpeedColor, getCompassDirection } from '@infrared/analysis-colors/wind'

const color = getWindSpeedColor(12)             // [r, g, b]
const dir = getCompassDirection(225)            // "SW"
```

### Generic color scale helpers

```ts
import {
  createGradientColorScale,
  createSteppedColorScale,
  hexToRgb,
} from '@infrared/analysis-colors/helpers'

const gradient = createGradientColorScale(
  [hexToRgb('#0000ff'), hexToRgb('#ff0000')],
  [0, 100],
)
const color = gradient(50) // interpolated midpoint
```

### Mesh coloring for 3D visualization

```ts
import { generateMeshColors, normalizeAnalysisMatrix } from '@infrared/analysis-colors/helpers'

const normalized = normalizeAnalysisMatrix(rawValues, min, max)
const colors = generateMeshColors(normalized, colorScaleFn)
```

## Types

Key types exported:

- `ColorScale` — color scale with `getColor(value)` method
- `RGB` / `RGBA` — color tuples
- `ModelRegistryEntry` / `ModelsRegistry` — analysis visualization registry shapes
- `VisualConfiguration` — legend type, bounds handling, interpolation config

## Development

```bash
bun run --cwd packages/analysis-colors build
bun run --cwd packages/analysis-colors typecheck
```
