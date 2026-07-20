import { useInteriorStore } from '../interior.store'
import { formatIfcTypeName } from '../interior.utils'

/**
 * InteriorTooltip — fixed-position status indicator shown in the top-left area
 * of the 3D canvas when an IFC element is being hovered.
 *
 * Displays the element's name and IFC type.
 * Visible only when hoveredId is non-null.
 *
 * Uses role="status" with aria-live="polite" because there is no DOM trigger
 * element (hover state comes from the 3D canvas via Zustand store).
 *
 * Positioning: absolute top-4 left-4 (relative to the canvas container).
 * ViewerToolbar occupies top-4 right-4, so left-4 avoids collision.
 */
export function InteriorTooltip() {
  const hoveredId = useInteriorStore((s) => s.hoveredId)
  const treeNodes = useInteriorStore((s) => s.treeFlatMap)

  if (hoveredId === null) return null

  // Look up element info from the flat tree map
  const node = treeNodes.get(hoveredId)
  const name = node?.name || null
  const type = node?.type || null

  return (
    <div
      className="absolute top-4 left-4 z-10 pointer-events-none"
      data-testid="interior-tooltip"
      role="status"
      aria-live="polite"
    >
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-md px-3 py-2 shadow-md">
        <div className="flex flex-col gap-0.5 min-w-0">
          {name ? (
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {name}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">Element #{hoveredId}</span>
          )}
          {type && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {formatIfcTypeName(type)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
