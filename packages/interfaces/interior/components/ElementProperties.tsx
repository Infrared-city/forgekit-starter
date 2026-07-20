import { Separator } from 'ui'
import { useInteriorStore } from '../interior.store'
import type { SpatialTreeNode } from '../interior.types'
import { formatIfcTypeName, getStringProp } from '../interior.utils'

/**
 * ElementProperties — displays properties of the currently selected IFC element.
 *
 * Shown below the spatial tree navigator in the Model tab.
 * Renders nothing if no element is selected.
 *
 * Displays: Name, Type (IFC class), GlobalId, Floor/Storey.
 * Shows "No properties available" if element data is empty.
 *
 * Storey is derived from the spatial tree maps (treeParentMap + treeFlatMap)
 * by walking up the tree until an IFCBUILDINGSTOREY ancestor is found.
 * This is more reliable than guessing IFC attribute key names.
 */
export function ElementProperties() {
  const selectedElement = useInteriorStore((s) => s.selectedElement)
  const selectedId = useInteriorStore((s) => s.selectedId)
  const treeFlatMap = useInteriorStore((s) => s.treeFlatMap)
  const treeParentMap = useInteriorStore((s) => s.treeParentMap)

  // Only visible when an element is selected
  if (selectedId === null || selectedElement === null) {
    return null
  }

  const { name, type, properties } = selectedElement

  // Extract GlobalId from the raw properties object
  const globalId = getStringProp(properties, ['GlobalId', 'globalId', 'GUID'])

  // Derive storey by walking up treeParentMap to the nearest IFCBUILDINGSTOREY ancestor.
  // This is correct regardless of what attribute keys the IFC file happens to use.
  const floorName = findStoreyName(selectedId, treeFlatMap, treeParentMap)

  const hasAnyProperty = name || type || globalId || floorName

  return (
    <>
      <Separator />
      <div className="p-4" data-testid="element-properties">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Element Properties
        </h3>

        {!hasAnyProperty ? (
          <p className="text-sm text-muted-foreground italic">No properties available</p>
        ) : (
          <dl className="space-y-2">
            {name && <PropertyRow label="Name" value={name} />}
            {type && <PropertyRow label="Type" value={formatIfcTypeName(type)} />}
            {globalId && <PropertyRow label="GlobalId" value={globalId} mono />}
            {floorName && <PropertyRow label="Floor" value={floorName} />}
          </dl>
        )}
      </div>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface PropertyRowProps {
  label: string
  value: string
  mono?: boolean
}

function PropertyRow({ label, value, mono = false }: PropertyRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`text-sm text-foreground break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

/**
 * Walk up the spatial tree from `localId` until we find an IFCBUILDINGSTOREY ancestor.
 * Returns the storey's name (or a fallback "Building Storey #<localId>") if found, else null.
 */
function findStoreyName(
  localId: number,
  flatMap: Map<number, SpatialTreeNode>,
  parentMap: Map<number, number | null>,
): string | null {
  let current: number | null = parentMap.get(localId) ?? null

  while (current !== null) {
    const node = flatMap.get(current)
    if (node && node.type.toUpperCase() === 'IFCBUILDINGSTOREY') {
      return node.name || `Building Storey #${node.localId}`
    }
    current = parentMap.get(current) ?? null
  }

  return null
}
