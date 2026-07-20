// ABOUTME: Configures the vegetation package browser-like test runner.
// ABOUTME: Installs package-level setup for jsdom file APIs used by imports.

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    setupFiles: ['./__tests__/setup.ts'],
  },
})
