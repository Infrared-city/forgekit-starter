# ModelsRegistry Color System for Analysis Visualization

This document explains how the `modelsRegistry` system is used to color analysis result meshes and charts/graphs. This pattern can be reused in other applications for consistent data-driven visualization.

## Overview

The color system follows this flow:

```
modelsRegistry (database)
    ↓
AnalysisVisualization (class)
    ├─→ meshColors: RGB[]     (3D mesh vertex coloring)
    ├─→ barColors: string[]   (histogram/chart bars)
    ├─→ legendColors: string[] (legend display)
    └─→ bins: number[]        (value boundaries)
         ↓
Three.js / Plotly rendering
```

---

## 1. Data Schema (modelsRegistry)

**File:** `src/dto/modelsRegistry.ts`

### AnalysisConfig

The core configuration for analysis visualization:

```typescript
interface AnalysisConfig {
  // Value range for the analysis [min, max]
  steps: (number | string)[];

  // Color palette - array of RGB colors [r, g, b] (0-255)
  colors: RGB[];  // e.g., [[0, 0, 255], [255, 255, 0], [255, 0, 0]]

  // Interpolation method
  colorInterpolation: "linear" | "binned";

  // Subdivision factors to extend color palette
  resultSubdivisionFactor: number;  // For mesh colors
  legendSubdivisionFactor: number;  // For legend colors
  barsSubdivisionFactor: number;    // For chart bar colors

  // Legend bound handling
  legendMinHandling: "open" | "closed";
  legendMaxHandling: "open" | "closed";

  // Optional metadata
  unit?: string;
  info?: string;
  legendType: "linear" | "equal_ranges" | "unequal_ranges";
}
```

### ModelsRegistry Structure

```typescript
interface ModelsRegistry {
  uuid: string;
  version: string;

  // Global models (shared across all projects)
  global: {
    "wind-speed": ModelRegistryEntry;
    "wind-comfort": ModelRegistryEntry;
    "thermal-comfort-index": ModelRegistryEntry;
    // ... other analysis types
  };

  // Local models (specific to weather files)
  local: Record<weatherId, Record<analysisType, ModelRegistryEntry>>;

  // Visual configurations by analysis type
  visualConfigurations: Record<string, AnalysisConfig>;
}
```

---

## 2. AnalysisVisualization Class

**File:** `src/services/simulationModelsRegistry/registry.ts`

This class transforms registry data into render-ready colors and bins.

### Constructor

```typescript
import AnalysisVisualization, { RGB } from "./registry";

const visualization = new AnalysisVisualization({
  data: modelRegistryEntry,
  defaultVisualizationConfig: analysisConfig,
  variant: "optional-variant-name",  // For configs with multiple variants
});
```

### Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `meshColors` | `RGB[]` | Colors for 3D mesh vertices |
| `barColors` | `string[]` | Hex colors for chart bars |
| `legendColors` | `string[]` | Hex colors for legend |
| `meshBins` | `number[]` | Value boundaries for mesh coloring |
| `barBins` | `(number\|string)[]` | Value boundaries for chart bars |
| `steps` | `(number\|string)[]` | Min/max value range |
| `standardColors` | `RGB[]` | Original palette from config |

---

## 3. Color Extension (Subdivision)

When `subdivisionFactor > 1`, the palette is expanded by interpolation.

**File:** `src/services/simulationModelsRegistry/registry.ts:390-423`

```typescript
static extendColors(colors: RGB[], factor: number): RGB[] {
  const numSegments = colors.length * factor;
  const totalSteps = numSegments - 1;
  const interpolatedColors: RGB[] = [];

  for (let step = 0; step < numSegments; step++) {
    const delta = step / totalSteps;  // 0 to 1
    const scaledIndex = delta * (colors.length - 1);
    const roundedIndex = Math.min(Math.floor(scaledIndex), colors.length - 2);
    const localDelta = scaledIndex - roundedIndex;

    // Linear interpolation between adjacent colors
    const startColor = colors[roundedIndex];
    const endColor = colors[roundedIndex + 1];
    const interpolated: RGB = startColor.map((v, i) =>
      Math.round((1 - localDelta) * v + localDelta * endColor[i])
    ) as RGB;

    interpolatedColors.push(interpolated);
  }

  return interpolatedColors;
}
```

**Example:** 3 colors with factor 4 = 12 interpolated colors.

---

## 4. Value-to-Color Mapping

### Linear Interpolation

**File:** `src/services/simulationModelsRegistry/registry.ts:425-491`

Maps a value to a smoothly interpolated color:

```typescript
static linearInterpolation(
  value: number,
  minValue: number,
  maxValue: number,
  colors: RGB[]
): RGB {
  // Handle edge cases
  if (value >= maxValue) return colors[colors.length - 1];
  if (value <= minValue) return colors[0];

  const numSegments = colors.length - 1;
  const segmentWidth = (maxValue - minValue) / numSegments;

  // Find which segment the value falls into
  let segmentIndex = Math.floor((value - minValue) / segmentWidth);
  segmentIndex = Math.max(0, Math.min(segmentIndex, numSegments - 1));

  // Calculate interpolation factor within segment
  const lowerBound = minValue + segmentIndex * segmentWidth;
  const t = (value - lowerBound) / segmentWidth;

  // Interpolate between segment colors
  const startColor = colors[segmentIndex];
  const endColor = colors[segmentIndex + 1];

  return startColor.map((start, i) =>
    Math.round((1 - t) * start + t * endColor[i])
  ) as RGB;
}
```

### Binned Scale

**File:** `src/lib/three.ts:884-904`

Maps value to discrete color bins:

```typescript
function getColorForBinnedScale(
  value: number,
  colorScale: RGB[],
  bins: number[]
): RGB {
  const binIndex = bins.findIndex((step) => value < step);
  const colorIndex = binIndex === -1 ? bins.length - 1 : binIndex - 1;
  return colorScale[colorIndex];
}
```

---

## 5. Three.js Mesh Coloring

**File:** `src/lib/three.ts:714-862`

### Geometry Generation

```typescript
function generateGeometryFromAnalysisData({
  analysisOutputData,  // 2D array of values
  colorScale,          // RGB[] from AnalysisVisualization.meshColors
  colorInterpolationMethod,  // "linear" | "binned"
  bins,               // number[] from AnalysisVisualization.meshBins
  steps,              // [min, max]
  filter,             // { min, max } for visibility
  geometry,           // THREE.BufferGeometry
  // ... other params
}): void {
  const colors = new Float32Array(totalVertices * 4);  // RGBA

  for (let j = 0; j < yCount; j++) {
    for (let i = 0; i < xCount; i++) {
      const value = analysisOutputData[j][i];

      // Get color based on interpolation method
      const color = colorInterpolationMethod === "binned"
        ? getColorForBinnedScale(value, colorScale, bins)
        : getColorForLinearScale(value, steps[0], steps[1], colorScale);

      // Set alpha based on filter visibility
      const isVisible = value >= filter.min && value <= filter.max;
      const alpha = isVisible ? 1.0 : 0.0;

      // Apply to all 6 vertices per cell (2 triangles)
      for (let k = 0; k < 6; k++) {
        colors[colorIndex++] = color.r;  // Normalized 0-1
        colors[colorIndex++] = color.g;
        colors[colorIndex++] = color.b;
        colors[colorIndex++] = alpha;
      }
    }
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 4));
}
```

### Material Setup

```typescript
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  transparent: true,
  side: THREE.DoubleSide,
});
```

---

## 6. Chart/Graph Coloring

### Histogram Bars

Use `visualization.barColors` (hex strings) for chart segments:

```typescript
const visualization = new AnalysisVisualization({ ... });

// For Plotly histogram
const trace = {
  type: "bar",
  marker: {
    color: visualization.barColors,
  },
};
```

### Heatmap Color Scale

Convert colors to Plotly ColorScale format:

```typescript
import type { ColorScale } from "plotly.js";

function createPlotlyColorScale(colors: string[]): ColorScale {
  return colors.map((color, i) => [i / (colors.length - 1), color]);
}

// Usage
const colorScale = createPlotlyColorScale(visualization.legendColors);
const heatmapTrace = {
  type: "heatmap",
  colorscale: colorScale,
  zmin: steps[0],
  zmax: steps[1],
};
```

---

## 7. Reusable Utilities

**File:** `packages/analysis-colors/src/helpers.ts`

### Color Conversion

```typescript
// RGB to hex
function rgbToHex(rgb: RGB): string {
  return "#" + rgb.map(c => Math.round(c).toString(16).padStart(2, "0")).join("");
}

// Hex to RGB
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}
```

### Generate Mesh Colors from Values

```typescript
function generateMeshColors(
  values: number[],
  minValue: number,
  maxValue: number,
  colorPalette: RGB[]
): Float32Array {
  const colors = new Float32Array(values.length * 3);

  for (let i = 0; i < values.length; i++) {
    const rgb = linearInterpolation(values[i], minValue, maxValue, colorPalette);
    colors[i * 3] = rgb[0] / 255;      // Normalize to 0-1
    colors[i * 3 + 1] = rgb[1] / 255;
    colors[i * 3 + 2] = rgb[2] / 255;
  }

  return colors;
}
```

---

## 8. Minimal Implementation for Reuse

Here's a standalone implementation you can copy to another app:

```typescript
type RGB = [number, number, number];

interface ColorConfig {
  colors: RGB[];
  steps: [number, number];  // [min, max]
  subdivisionFactor?: number;
}

class AnalysisColorizer {
  private colors: RGB[];
  private min: number;
  private max: number;

  constructor(config: ColorConfig) {
    this.min = config.steps[0];
    this.max = config.steps[1];

    // Extend colors if subdivision factor provided
    this.colors = config.subdivisionFactor && config.subdivisionFactor > 1
      ? this.extendColors(config.colors, config.subdivisionFactor)
      : config.colors;
  }

  // Get color for a single value (returns RGB 0-255)
  getColor(value: number): RGB {
    if (value >= this.max) return this.colors[this.colors.length - 1];
    if (value <= this.min) return this.colors[0];

    const numSegments = this.colors.length - 1;
    const segmentWidth = (this.max - this.min) / numSegments;
    let idx = Math.floor((value - this.min) / segmentWidth);
    idx = Math.max(0, Math.min(idx, numSegments - 1));

    const lowerBound = this.min + idx * segmentWidth;
    const t = (value - lowerBound) / segmentWidth;

    return this.interpolate(this.colors[idx], this.colors[idx + 1], t);
  }

  // Get normalized color for Three.js (returns 0-1)
  getColorNormalized(value: number): [number, number, number] {
    const rgb = this.getColor(value);
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  }

  // Get hex color string
  getHexColor(value: number): string {
    const rgb = this.getColor(value);
    return "#" + rgb.map(c => c.toString(16).padStart(2, "0")).join("");
  }

  private interpolate(c1: RGB, c2: RGB, t: number): RGB {
    return [
      Math.round(c1[0] + t * (c2[0] - c1[0])),
      Math.round(c1[1] + t * (c2[1] - c1[1])),
      Math.round(c1[2] + t * (c2[2] - c1[2])),
    ];
  }

  private extendColors(colors: RGB[], factor: number): RGB[] {
    const result: RGB[] = [];
    const numSegments = colors.length * factor;

    for (let i = 0; i < numSegments; i++) {
      const delta = i / (numSegments - 1);
      const scaledIdx = delta * (colors.length - 1);
      const idx = Math.min(Math.floor(scaledIdx), colors.length - 2);
      const localT = scaledIdx - idx;
      result.push(this.interpolate(colors[idx], colors[idx + 1], localT));
    }

    return result;
  }
}

// Usage example
const colorizer = new AnalysisColorizer({
  colors: [
    [0, 0, 255],    // Blue (low)
    [0, 255, 0],    // Green (mid)
    [255, 255, 0],  // Yellow
    [255, 0, 0],    // Red (high)
  ],
  steps: [0, 100],
  subdivisionFactor: 4,
});

// For a value of 50 (middle of range)
const rgb = colorizer.getColor(50);        // [0, 255, 0] approx
const hex = colorizer.getHexColor(50);     // "#00ff00" approx
const norm = colorizer.getColorNormalized(50);  // [0, 1, 0] for Three.js
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/dto/modelsRegistry.ts` | TypeScript schemas & types |
| `src/services/simulationModelsRegistry/registry.ts` | AnalysisVisualization class |
| `src/lib/three.ts:714-904` | Three.js mesh coloring |
| `packages/analysis-colors/src/helpers.ts` | Standalone color utilities |
| `src/stores/WorkingSpaceStore.tsx` | Context provider for registry |
