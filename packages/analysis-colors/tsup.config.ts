import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    utci: 'src/utci.ts',
    heatmap: 'src/heatmap.ts',
    wind: 'src/wind.ts',
    helpers: 'src/helpers.ts',
  },
  format: ['esm'],
  tsconfig: 'tsconfig.build.json',
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  splitting: true,
  treeshake: true,
})
