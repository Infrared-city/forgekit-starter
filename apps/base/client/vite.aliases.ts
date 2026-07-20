import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

// Single source of truth for the workspace source aliases, shared by
// vite.config.ts (dev/build) and vitest.config.ts (tests).
//
// The tsconfig `paths` mirror these for the editor and `tsc`, but the test
// runner cannot rely on vite-tsconfig-paths alone: tsconfig.app.json only
// `include`s `src/`, so imports issued FROM ../../../packages/** files
// (e.g. @forge-kit/analysis internally importing @infrared/analysis-colors)
// would not be aliased and fail to resolve under vitest.
export const workspaceAliases = {
  '@': path.resolve(here, './src'),
  '@infrared/design-tokens': path.resolve(here, '../../../packages/design-tokens/src'),
  '@infrared/analysis-colors': path.resolve(here, '../../../packages/analysis-colors/src'),
  '@infrared/mapbox-theme': path.resolve(here, '../../../packages/mapbox-theme/src'),
  '@infrared/three-theme': path.resolve(here, '../../../packages/three-theme/src'),
  '@forge-kit/plugin-contracts': path.resolve(here, '../../../packages/interfaces/shared/index.ts'),
  // Required even though base never imports geo-core directly: buildings +
  // map-interface (aliased to source below) transitively import it, so it
  // must resolve to THIS tree's source, not the shared-install main checkout.
  '@forge-kit/geo-core': path.resolve(here, '../../../packages/primitives/geo-core/index.ts'),
  '@forge-kit/buildings': path.resolve(here, '../../../packages/primitives/buildings/index.ts'),
  '@forge-kit/analysis': path.resolve(here, '../../../packages/primitives/analysis/index.ts'),
  '@forge-kit/ground-materials': path.resolve(
    here,
    '../../../packages/primitives/ground-materials/index.ts',
  ),
  '@forge-kit/indoor-analysis': path.resolve(
    here,
    '../../../packages/primitives/indoor-analysis/index.ts',
  ),
  // vegetation is consumed source-only (not in build:packages → no dist), and
  // base imports it (map-plugins, LayerLoaders, ImportTrees). Its source alias
  // was missing — every other primitive base imports has one — so a production
  // `vite build` failed to resolve the package. Mirrors the platform config.
  '@forge-kit/vegetation': path.resolve(here, '../../../packages/primitives/vegetation/index.ts'),
  '@forge-kit/map-interface': path.resolve(here, '../../../packages/interfaces/map/index.ts'),
  '@forge-kit/interior-interface': path.resolve(
    here,
    '../../../packages/interfaces/interior/index.ts',
  ),
}
