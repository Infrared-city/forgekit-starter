# Forge Kit UI

Shared UI component library built with React 19, Tailwind CSS 4, Radix primitives, and shadcn/ui patterns.

## Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Radix UI** primitives (Popover, Tooltip, Dropdown, Slider)
- **class-variance-authority** for component variants
- **Lucide React** for icons

## Usage

Import components from the `ui` package:

```typescript
import { Button, ShimmerButton, Input, Card, cn } from 'ui'
import 'ui/styles.css'  // Include styles in your app entry
```

## Available Components

| Component | Description |
|-----------|-------------|
| `Button` | Primary button with variant/size props |
| `ShimmerButton` | Button with loading spinner + shimmer text animation |
| `LoadingButton` | Button with loading state |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Card layout |
| `Input` | Basic text input |
| `FloatingInput` | Input with floating label animation |
| `FloatingSelect` | Select with floating label |
| `Label` | Form label |
| `Badge` | Status badges with variants |
| `Separator` | Horizontal/vertical divider |
| `Popover` | Radix popover |
| `Tooltip` | Radix tooltip with animations |
| `Skeleton`, `SkeletonText` | Loading skeletons |
| `Spinner` | Loading spinner |
| `InlineError` | Inline error with retry button |
| `ErrorBoundary` | React error boundary |
| `cn` | Tailwind class merge utility (`clsx` + `tailwind-merge`) |

## Development

```bash
bun run dev       # Start Vite dev server
bun run build     # Type-check and build
bun run lint      # Lint with Biome
```

## Package Exports

```json
{
  ".": "./src/index.ts",
  "./styles.css": "./src/index.css"
}
```

## CSS Custom Properties

All design tokens are defined in `src/index.css` using HSL format. See the `design-system` skill for the full color reference.

## Related Packages

- `@infrared/design-tokens` — Color, spacing, typography tokens
- `@infrared/three-theme` — Three.js materials, lighting, camera presets
- `@infrared/analysis-colors` — UTCI, heatmap, wind color scales
- `@infrared/mapbox-theme` — Mapbox layer styles, markers, cursors
