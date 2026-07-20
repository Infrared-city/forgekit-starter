import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'index.ts' },
  format: ['esm'],
  tsconfig: 'tsconfig.build.json',
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  splitting: false,
  treeshake: true,
  external: [/^[^./]|^\.\.\//],
})
