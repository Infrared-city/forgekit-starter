import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'index.ts',
    core: 'core/index.ts',
    // Samplers-only entry: a framework-free subpath (`@forge-kit/analysis/sampling`)
    // that pulls ONLY the sampler chain (no icons/color-scales barrel), so a
    // headless/Worker consumer can import `sampleGrid` without dragging in
    // lucide-react / @infrared/analysis-colors.
    sampling: 'core/sampling.ts',
    react: 'react/index.ts',
  },
  format: ['esm'],
  tsconfig: 'tsconfig.build.json',
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  splitting: true,
  treeshake: true,
  external: [/^[^./]|^\.\.\//],
})
