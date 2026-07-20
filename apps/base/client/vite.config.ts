import { createRequire } from 'node:module'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { workspaceAliases } from './vite.aliases'

// Use createRequire to resolve package paths regardless of monorepo hoisting.
// Packages may be installed at workspace root node_modules, not in apps/base/client/node_modules.
const require = createRequire(import.meta.url)

/**
 * Resolve the root directory of an installed package.
 * Finds the package by resolving its main entry, then locating the
 * `node_modules/<pkg>` segment in the resolved path.
 * Works with both local and hoisted monorepo layouts, including scoped packages.
 */
function resolvePackageDir(pkg: string): string {
  const resolved = require.resolve(pkg)
  const marker = `node_modules/${pkg}`
  const idx = resolved.lastIndexOf(marker)
  if (idx === -1) {
    throw new Error(`Cannot locate package directory for "${pkg}" in resolved path: ${resolved}`)
  }
  return resolved.slice(0, idx + marker.length)
}

// React Compiler logger — surfaces components that fail compilation as build warnings.
// panicThreshold: 'none' skips unoptimizable components instead of failing the build.
// The logger reports CompileError events so developers can fix Rules of React violations.
const reactCompilerLogger = {
  logEvent(filename: string | null, event: { kind: string; fnName?: string; detail?: string }) {
    if (event.kind === 'CompileError') {
      const fn = event.fnName ? ` (${event.fnName})` : ''
      console.warn(
        `[React Compiler] Skipped${fn} in ${filename ?? 'unknown'}: ${event.detail ?? 'unknown error'}`,
      )
    }
  },
}

// Files opted out of React Compiler via "use no memo" directives.
// These files use architectural patterns (DI with hooks, ref writes during render,
// Three.js scene management) that fundamentally conflict with the compiler's strict rules.
// The compiler still compiles all other functions in non-excluded files.
const reactCompilerExcludedFiles = new Set([
  // Composition roots -- pass hook references as DI values
  'composition/interior-plugins.ts',
  'composition/map-plugins.ts',
  // Interface canvases -- ref/module-var writes during render
  'interior/components/InteriorCanvas.tsx',
  'interior/components/ModelTreePanel.tsx',
  // Interior hooks -- Three.js scene refs, try/catch limitations, async callbacks
  'interior/hooks/useCameraControls.ts',
  'interior/hooks/useSceneSetup.ts',
  'interior/hooks/useIfcImport.ts',
  'interior/hooks/useInteriorRaycasting.ts',
  'interior/hooks/useVisibilityPass.ts',
  // Analysis primitive -- DI hook references (uiConfig.useAreaPreview /
  // uiConfig.useRunArea), stable Panel component refs with ref-based
  // deps pass-through, React Query observer wiring inside DI factories
  'analysis/plugin.tsx',
  'analysis/react/analysis.api.ts',
  'analysis/react/analysis.particle-hook.ts',
  'analysis/react/components/AreaAnalysisTab.tsx',
  'analysis/react/components/WeatherStationSelector.tsx',
  // Indoor analysis -- DI hooks, eslint suppression
  'indoor-analysis/react/components/AnalysisPanel.tsx',
  'indoor-analysis/react/hooks/useHeatmapOverlay.ts',
  // Ground materials -- module-var writes, store references
  'ground-materials/react/ground-materials.draw-hook.tsx',
  'ground-materials/react/components/ImportGeoJsonSection.tsx',
  // Buildings -- ref read during render, intentional polygonKey memo pattern
  'buildings/plugin.tsx',
  'buildings/react/buildings.api.ts',
  // Composition WorkflowPanel -- ref access during render (polygonRef),
  // hook-as-value (useWeatherStations passed as prop)
  'composition/WorkflowPanel.tsx',
  // Map interface -- hook reference passed as value in DI pattern
  'map/hooks/useViewportSync.ts',
])

// https://vite.dev/config/
export default defineConfig({
  // Load .env from monorepo root (single source of truth)
  envDir: path.resolve(__dirname, '../../..'),
  plugins: [
    TanStackRouterVite(),
    tailwindcss(),
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              // Surface components that fail compilation instead of silently skipping them.
              // 'none' = never throw; just log the error and skip the component.
              panicThreshold: 'none',
              logger: reactCompilerLogger,
              // Skip files opted out via "use no memo" directives. These use patterns
              // (DI with hooks, Three.js refs, module-var writes) that the compiler
              // cannot optimize. See reactCompilerExcludedFiles for the full list.
              sources: (filename: string) => {
                if (filename.includes('node_modules')) return false
                for (const excluded of reactCompilerExcludedFiles) {
                  if (filename.includes(excluded)) return false
                }
                return true
              },
            },
          ],
        ],
      },
    }),
    // Bundle analyzer - generates dist/stats.html on build
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false, // Set to true to auto-open after build
    }),
    // Copy web-ifc WASM files and ThatOpen worker to public directory for dev and dist.
    // Use resolvePackageFile() to locate packages regardless of monorepo hoisting
    // (packages may live in workspace root node_modules, not apps/base/client/node_modules).
    viteStaticCopy({
      targets: [
        {
          src: path.join(resolvePackageDir('web-ifc'), '*.wasm'),
          dest: 'wasm',
        },
        {
          src: path.join(resolvePackageDir('@thatopen/fragments'), 'dist/Worker/worker.mjs'),
          dest: 'workers',
        },
      ],
    }),
  ],
  optimizeDeps: {
    // Prevent ESBuild from trying to bundle web-ifc WASM binary
    exclude: ['web-ifc'],
    // Force pre-bundling of heavy vendor libs on dev-server startup so they
    // aren't re-discovered + esbuilt lazily on first import (which adds
    // seconds to warm reloads when the Vite dep cache is cold or busted).
    // Only list packages the client resolves directly. The @deck.gl/* sub-packages
    // are transitively used by primitives but aren't a direct client dependency in
    // this trimmed extraction, so pre-bundling them here fails to resolve — Vite
    // still discovers and bundles them lazily on first import instead.
    include: ['deck.gl', 'mapbox-gl', 'react-map-gl', 'three', '@tanstack/react-query', '@tanstack/react-router', '@turf/area'],
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'three'],
    // Shared with vitest.config.ts — see vite.aliases.ts for why tests can't
    // rely on tsconfig paths alone.
    alias: workspaceAliases,
  },
  // NOTE: the original template had a manual vendor-chunk-splitting config
  // here (deck.gl/mapbox/three/etc. grouped into named chunks). It assumed a
  // package layout that doesn't hold in this trimmed extraction (some of
  // those sub-packages aren't independently resolvable), so it's dropped for
  // now — Rollup's default chunking still produces a working build, just
  // without the hand-tuned vendor splits. Re-add once you've confirmed which
  // sub-package names actually resolve in your dependency tree.
  // This proxy configuration is ONLY used for local development (npm run dev).
  // In production, the VITE_API_URL environment variable is injected during the build.
  server: {
    port: 3001,
    headers: {
      // Google Sign-In (GSI) uses a popup that communicates via postMessage.
      // The default 'same-origin' COOP policy blocks this. Allow popups.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      // Canonical dev mode: forward /api/* to the Hono CF Workers API on :8787.
      // Same-origin keeps cookies simple and avoids CORS / origin allowlist drift.
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy Infrared SDK calls to avoid CORS in dev mode.
      // The client sets VITE_INFRARED_BASE_URL=/infrared-api so all SDK
      // requests go through the Vite dev server → Infrared API.
      '/infrared-api': {
        target: 'https://api-test.infrared.city',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/infrared-api/, ''),
        secure: true,
        // JWT bearer flows through from the SDK's getToken (createSdk in
        // src/lib/sdk.ts is wired by composition/map-plugins.ts and
        // composition/WorkflowPanel.tsx with `getToken: () =>
        // useAuthStore.getState().idToken ?? ''`). The gateway authorizer
        // prefers JWT when both are present (auth-service authorizer.ts:316-321)
        // and all routes have apiKeyRequired: false.
      },
      // Proxy S3 presigned URL downloads to avoid CORS in dev mode.
      // The SDK rewrites S3 URLs to go through /s3-proxy/... instead of
      // hitting the S3 bucket directly from the browser.
      '/s3-proxy': {
        target:
          'https://infrared-async-inference-jobs-outputs.s3.eu-central-1.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3-proxy/, ''),
        secure: true,
        // Strip all non-essential headers — S3 presigned URLs are self-authenticated
        // and S3 rejects requests whose header section exceeds 8 KB.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie')
            proxyReq.removeHeader('authorization')
            proxyReq.removeHeader('x-api-key')
            proxyReq.removeHeader('referer')
            proxyReq.removeHeader('origin')
          })
        },
      },
    },
  },
})
