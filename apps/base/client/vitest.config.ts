import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { workspaceAliases } from './vite.aliases'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    dedupe: ['react', 'react-dom', 'three'],
    // tsconfigPaths only aliases importers inside tsconfig.app.json's
    // `include: ["src"]` — package sources need the explicit map.
    alias: workspaceAliases,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/composition/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['**/*.test.ts', '**/index.ts', '**/*.types.ts'],
    },
  },
})
