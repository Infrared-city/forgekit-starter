import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev: the page calls /api/*, and Vite forwards it to the Worker in
// apps/base/api (port 8787). The Worker holds your API key.
// Production: set VITE_API_URL to your deployed Worker URL before `npm run build`.
export default defineConfig({
  envDir: path.resolve(__dirname, '../..'),
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  // The SDK loads its WebAssembly file with `?url`; keep it out of pre-bundling.
  optimizeDeps: { exclude: ['@infrared-city/infrared-sdk-ts'] },
  build: { target: 'es2022' },
})
