import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'index.ts',
    core: 'core/index.ts',
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
