# Forge Kit Client

Interactive 3D urban analysis platform built with React 19, DeckGL, Mapbox GL, and the Infrared SDK.

## Tech Stack

- **React 19** with React Compiler (`babel-plugin-react-compiler`)
- **TypeScript 5.9** with strict mode
- **Vite 7** for bundling and dev server
- **TanStack Router** for file-based routing
- **TanStack Query v5** for server state (staleTime: Infinity, gcTime: 30min)
- **Zustand v5** for client state (persist + subscribeWithSelector middleware)
- **DeckGL 9** + **Mapbox GL** for 3D map rendering
- **Tailwind CSS 4** for styling
- **Biome** for linting and formatting
- **Vitest 3** for testing

## Domain Architecture

The client follows a domain-driven structure under `src/domains/`:

| Domain | Responsibility |
|--------|---------------|
| `map/` | Viewport state, DeckGL/Mapbox rendering, layer composition, keyboard shortcuts. The `/map` route is a progressive-disclosure workflow: the user lands on a whole-world view with only the Mapbox `SearchBox` overlay (no sidebar), picks an address, selects a weather station, draws an area polygon, and then the sidebar reveals Analysis and AI Workflows tabs once buildings finish loading for the area. The `WorkflowPanel` composition component drives this state machine via a derived `useWorkflowStep` selector over the map/analysis stores. The `/map` route uses a single `MapRoute` shell that always mounts `MapCanvas`, with a child `MapRouteChosenHooks` component that conditionally hosts the plugin hooks (`useMapPlugins`/`useViewportSync`), portals the plugin sidebar tabs/panels into a slot owned by the parent (so high-frequency `viewState` updates do not re-render the route shell), and publishes only the stable canvas inputs (`plugins`, `mapChildren`) back via callback. The canvas is never unmounted across the world-view → chosen transition. URL (`?lat&lng&zoom`) and `localStorage` hydrate via `beforeLoad`. |
| `analysis/` | Analysis presets, execution, caching (TQ + Zustand FIFO), color scales |
| `buildings/` | Building mesh loading, transforms, gizmo layers, merge geometry |
| `ground-materials/` | Ground material registry, draw editing, GeoJSON import, OSM collection |
| `interior/` | IFC model loading, fragment visualization, spatial tree navigation, keyboard shortcuts |
| `indoor-analysis/` | Daylight-factor analysis visualization, heatmap overlay, Zustand store, Three.js plane rendering |

Each domain exposes a barrel `index.ts`. Cross-domain imports always go through barrel exports.

See [docs/DOMAIN_TEMPLATE.md](docs/DOMAIN_TEMPLATE.md) for patterns and conventions when creating new domains.

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Navigate to /map to see the application
```

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server with HMR |
| `bun run build` | Type-check and build for production |
| `bun run build:analyze` | Build and generate bundle analysis (`dist/stats.html`) |
| `bun run test` | Run tests with Vitest |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report |
| `bun run test:smoke` | Run opt-in API contract smoke suite (no-op unless `SMOKE=1`) |
| `bun run lint` | Lint with Biome |
| `bun run preview` | Preview production build |
| `bun run deploy` | Build and deploy to Cloudflare Pages |

## Environment Variables

All environment variables are managed in the **root `.env` file** (monorepo root). Copy `/.env.example` to `/.env` and fill in your values. Vite picks up `VITE_*` variables automatically via the `envDir` setting in `vite.config.ts`.

See the [root README](../../../README.md#environment-variables) for the full list of variables.

## Key Conventions

- **Barrel imports** for cross-domain access (`@/domains/analysis`, not `@/domains/analysis/analysis.store`)
- **Direct imports** only within the same domain (`../map.store` inside `domains/map/`)
- **`useShallow`** for all multi-value Zustand selectors to prevent unnecessary re-renders
- **Hooks directory** at `src/domains/{domain}/hooks/` for extracted custom hooks
- **Query key factories** in `src/lib/query-keys.ts` with primitive values (not objects)
- **`persist` + `subscribeWithSelector`** middleware on all Zustand stores
- **Conventional commits** with domain scope (`feat(analysis):`, `fix(map):`)

## Smoke tests

The default `bun run test` suite mocks at the `apiClient` boundary, which
means it cannot catch wire-level contract drift between the client and the
Python FastAPI backend (`apps/base/api-python`). An opt-in smoke suite fills
that gap. It lives at `src/__tests__/api-contract.smoke.test.ts` and runs
under a **separate Vitest config** (`vitest.smoke.config.ts`) so the
module-level `vi.stubGlobal('fetch', ...)` in `src/lib/__tests__/api.test.ts`
cannot leak into the real-fetch path.

### Safe default (no live API calls)

```bash
bun run --cwd apps/base/client test:smoke
```

Unless `SMOKE` is set to exactly `1`, every smoke test is skipped via
`it.skipIf(process.env.SMOKE !== '1')` and the run exits 0. Any other value
(e.g. `SMOKE=true`, `SMOKE=0`, `SMOKE=yes`) is treated as "off" so that
typos do not accidentally fire real network calls. This proves the config
and guard work without hitting the network on dev machines or CI. Default
`bun run test` is unaffected -- the smoke config's `include` pattern
(`src/**/*.smoke.test.ts`) is distinct from the default pattern
(`src/**/*.test.ts`), and the default config's `exclude` list strips any
`*.smoke.test.ts` files that would otherwise match. The two suites never
collide.

### Live run (local Python API)

```bash
# Terminal 1 -- boot the Python backend
cd apps/base/api-python && uvicorn src.main:app --reload --port 9000

# Terminal 2 -- exercise the contract smoke suite
SMOKE=1 bun run --cwd apps/base/client test:smoke
```

Unauthenticated probes (`GET /`, `GET /openapi.json`) always run when
`SMOKE=1` is set. Authenticated probes
(`GET /ground-materials/registry`, `POST /infrared/buildings`) additionally
require a valid idToken via `SMOKE_BEARER`:

```bash
# Sign in through the client UI, then pull the idToken out of the
# auth store in the browser devtools (Application -> Local Storage ->
# auth-store), and export it here.
SMOKE=1 SMOKE_BEARER=<idToken> \
  bun run --cwd apps/base/client test:smoke
```

An alternate base URL (e.g. a preview stage) can be supplied via
`SMOKE_BASE_URL`:

```bash
SMOKE=1 SMOKE_BASE_URL=https://api-preview.forge-kit.infrared.city \
  bun run --cwd apps/base/client test:smoke
```

### Adding new smoke tests

Any new test file added to `src/__tests__/` (or deeper) with the
`*.smoke.test.ts` suffix is picked up automatically by the smoke config.
Keep them read-only where possible; anything that mutates state should
additionally gate on an explicit env flag so an accidental `SMOKE=1` run
does not corrupt a dev database.

If you add a new file that installs a module-level fetch stub
(`vi.stubGlobal('fetch', ...)`, `globalThis.fetch = ...`, etc.), add it to
the `exclude` list in `vitest.smoke.config.ts` -- see the comment block at
the top of that file for the grep command used to audit.

## Documentation

- [Domain Template](docs/DOMAIN_TEMPLATE.md) -- Patterns for creating new domains
- [Performance Baseline](docs/PERFORMANCE_BASELINE.md) -- Bundle sizes, layer architecture metrics
- [Infrared Integration](README-INFRARED.md) -- SDK integration details and data flows
