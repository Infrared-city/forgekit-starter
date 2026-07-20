/**
 * SimpleMeshLayer mesh format with per-vertex colors for analysis
 */
export interface SimpleMeshFormatWithColors {
  attributes: {
    positions: { value: Float32Array; size: 3 }
    normals: { value: Float32Array; size: 3 }
    colors: { value: Float32Array; size: 3 }
  }
  indices: { value: Uint32Array; size: 1 }
}

/**
 * Builds a per-vertex color attribute from analysis values.
 * Colors are in [0..1] range (Float32Array).
 */
export function buildAnalysisColorAttribute(
  values: number[],
  vertexCount: number,
  colorScale: (value: number) => [number, number, number, number],
): { value: Float32Array; size: 3 } {
  const colorData = new Float32Array(vertexCount * 3)

  if (values.length === vertexCount) {
    // Per-vertex mapping
    for (let i = 0; i < vertexCount; i++) {
      const [r, g, b] = colorScale(values[i])
      colorData[i * 3] = r / 255
      colorData[i * 3 + 1] = g / 255
      colorData[i * 3 + 2] = b / 255
    }
  } else {
    // Fallback: use average value for uniform color
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const [r, g, b] = colorScale(avg)
    for (let i = 0; i < vertexCount; i++) {
      colorData[i * 3] = r / 255
      colorData[i * 3 + 1] = g / 255
      colorData[i * 3 + 2] = b / 255
    }
  }

  return { value: colorData, size: 3 }
}
