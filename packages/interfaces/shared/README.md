# @forge-kit/plugin-contracts

TypeScript type definitions and utilities for the forge-kit plugin architecture. Defines the `MapPlugin` and `InteriorPlugin` contracts that all primitives implement.

## Installation

Nothing to install — this is a workspace package, consumed from source via
the aliases in `apps/base/client/vite.aliases.ts` (and the matching tsconfig
`paths`).

## Usage

### Implementing a MapPlugin

```ts
import type { MapPlugin, MapPluginContext } from '@forge-kit/plugin-contracts'

const myPlugin: MapPlugin = {
  id: 'my-plugin',
  requires: ['buildings'],           // optional — declare dependencies
  panelLabel: 'My Analysis',
  panelIcon: SomeIcon,               // LucideIcon
  Panel: () => <MyPanel />,          // sidebar panel component
  Overlay: ({ viewport }) => null,   // map overlay component
  layers: (ctx: MapPluginContext) => [
    // return deck.gl Layer instances
  ],
  shortcuts: [
    { key: 'KeyM', label: 'Toggle my layer', action: () => {} },
  ],
  cleanup: () => {
    // called when plugin unmounts
  },
}
```

### Plugin ordering and validation

```ts
import { orderPlugins, validatePlugins } from '@forge-kit/plugin-contracts'

// Topological sort based on `requires` dependencies
const ordered = orderPlugins(plugins)

// Validate no missing dependencies or circular references
const errors = validatePlugins(plugins)
```

## Exported Types

| Type | Description |
|------|-------------|
| `MapPlugin` | Full map plugin contract (layers, panel, overlay, shortcuts) |
| `InteriorPlugin` | Interior 3D plugin contract |
| `MapPluginContext` | Context passed to `layers()` — viewport, deck instance |
| `MapOverlayProps` | Props for overlay components |
| `MapPanelProps` | Props for panel components |
| `MapViewport` | Viewport state (lat, lng, zoom, bearing, pitch) |
| `KeyboardShortcut` | Shortcut definition (key, label, action) |
| `PluginBase` | Base fields shared by all plugin types |
| `SceneRefs` | Three.js scene references for interior plugins |

## Development

```bash
bun run --cwd packages/interfaces/shared build
bun run --cwd packages/interfaces/shared typecheck
bun run --cwd packages/interfaces/shared test:run
```
