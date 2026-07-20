import type * as FRAGS from '@thatopen/fragments'
import {
  AppWindow,
  Box,
  ChevronRight,
  DoorOpen,
  Layers,
  MoveUpRight,
  RectangleVertical,
  Square,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo } from 'react'
import { modelRef } from '../interior.model-ref'
import { useInteriorStore } from '../interior.store'
import type { SpatialTreeNode } from '../interior.types'
import { formatIfcTypeName, getStringAttribute, getStringProp } from '../interior.utils'
import { ElementProperties } from './ElementProperties'

// ─── IFC Class Icon Map ────────────────────────────────────────────────────────

type LucideIcon = ComponentType<{ size?: number; className?: string }>

/**
 * Maps IFC class names to lucide-react icons.
 * Closest available equivalents for classes without exact icon matches:
 * - Column → RectangleVertical (tall vertical shape)
 * - Stair/StairFlight → MoveUpRight (diagonal movement)
 */
const IFC_ICON_MAP: Record<string, LucideIcon> = {
  IFCWALL: Square,
  IFCWALLSTANDARDCASE: Square,
  IFCDOOR: DoorOpen,
  IFCWINDOW: AppWindow,
  IFCSLAB: Layers,
  IFCCOLUMN: RectangleVertical,
  IFCSTAIR: MoveUpRight,
  IFCSTAIRFLIGHT: MoveUpRight,
}

function getIfcIcon(type: string): LucideIcon {
  const upper = type.toUpperCase()
  return IFC_ICON_MAP[upper] ?? Box
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ModelTreePanel — IFC spatial tree navigation in the Model tab sidebar.
 *
 * Features:
 * - Drill-down navigation: shows one level at a time
 * - Back button + breadcrumb trail (e.g. "Site > Building > Floor 1")
 * - Floor isolation dropdown at the top (replaces per-floor checkboxes)
 * - IFC class icons mapped for common types
 * - ElementProperties panel below tree when an element is selected
 *
 * The tree state is managed in useInteriorStore:
 * - treeChildren: items shown at the current level
 * - treeBreadcrumb: path from root to current level
 * - treeLoadingState: 'idle' | 'loading' | 'loaded'
 * - selectedFloor: currently isolated floor (null = all floors)
 *
 * The FragmentsModel is accessed via the module-level modelRef
 * (set by InteriorCanvas after successful import, cleared on dispose).
 *
 * Reactivity: InteriorCanvas calls bumpModelVersion() when modelRef changes,
 * which triggers this component's tree-load and element-properties effects.
 *
 * Floor isolation sets selectedFloor in the store. Actual 3D visibility is
 * handled by task 10's unified visibility pass — this component does NOT
 * call model.setVisible() for floor isolation.
 */
export function ModelTreePanel() {
  const loadingState = useInteriorStore((s) => s.loadingState)
  const modelVersion = useInteriorStore((s) => s.modelVersion)
  const treeChildren = useInteriorStore((s) => s.treeChildren)
  const treeBreadcrumb = useInteriorStore((s) => s.treeBreadcrumb)
  const treeLoadingState = useInteriorStore((s) => s.treeLoadingState)
  const treeRoots = useInteriorStore((s) => s.treeRoots)
  const selectedFloor = useInteriorStore((s) => s.selectedFloor)
  const floorDescendantsMap = useInteriorStore((s) => s.floorDescendantsMap)
  const selectedId = useInteriorStore((s) => s.selectedId)
  const drillInto = useInteriorStore((s) => s.drillInto)
  const navigateUp = useInteriorStore((s) => s.navigateUp)
  const buildTreeMaps = useInteriorStore((s) => s.buildTreeMaps)
  const setTreeChildren = useInteriorStore((s) => s.setTreeChildren)
  const setSelectedFloor = useInteriorStore((s) => s.setSelectedFloor)
  const setTreeLoadingState = useInteriorStore((s) => s.setTreeLoadingState)
  const setTreeBreadcrumb = useInteriorStore((s) => s.setTreeBreadcrumb)
  const setSelectedElement = useInteriorStore((s) => s.setSelectedElement)
  const setSelectedId = useInteriorStore((s) => s.setSelectedId)

  // ─── Load spatial structure when model becomes available ───────────────────
  // Key on modelVersion (reactive: set by InteriorCanvas via bumpModelVersion)
  // so this effect re-runs correctly even if loadingState was already 'loaded'.
  // biome-ignore lint/correctness/useExhaustiveDependencies: modelVersion is an intentional reactive trigger — it changes when modelRef changes
  useEffect(() => {
    const model = modelRef.current
    if (!model) {
      // Clear stale tree UI when model is removed
      setTreeChildren([])
      setTreeBreadcrumb([])
      setTreeLoadingState('idle')
      return
    }

    setTreeLoadingState('loading')

    let cancelled = false

    async function loadTree() {
      const m = modelRef.current
      if (!m || cancelled) return
      try {
        const spatialTree = await m.getSpatialStructure()
        if (cancelled) return

        // Convert ThatOpen SpatialTreeItem to our SpatialTreeNode
        const roots = convertSpatialTree(spatialTree.children ?? [])

        // Fetch GlobalId for storey nodes (typically 1-5 storeys, so this is cheap).
        // The GlobalId is needed by the indoor analysis API to identify floors.
        if (m) {
          await populateStoreyGlobalIds(roots, m)
          if (cancelled) return
        }

        // Check whether the tree contains any storey nodes at any depth
        const hasStoreys = roots.length > 0 && treeHasStoreys(roots)

        if (roots.length === 0 || !hasStoreys) {
          // No storeys (or completely empty spatial tree) — fall back to a flat
          // element list using getLocalIds() which reliably returns all element IDs.
          // This satisfies "IFC with no storeys shows flat element list".
          const localIds = await m.getLocalIds()
          if (cancelled) return

          // Best-effort: fetch IFC class and name for each element.
          // Chunked in batches of FETCH_CHUNK_SIZE to avoid single large memory/CPU spikes.
          // All IDs are fetched — no truncation — so navigation maps are complete.
          const FETCH_CHUNK_SIZE = 500
          const itemDataMap: Map<number, { name: string; type: string }> = new Map()
          try {
            for (let start = 0; start < localIds.length; start += FETCH_CHUNK_SIZE) {
              const chunk = localIds.slice(start, start + FETCH_CHUNK_SIZE)
              // Sequential chunk fetches prevent large single memory/CPU spike
              const items = await m.getItemsData(chunk)
              if (cancelled) return
              for (let i = 0; i < chunk.length; i++) {
                const item = items[i]
                if (item) {
                  itemDataMap.set(chunk[i], {
                    name: getStringAttribute(item, 'Name') ?? '',
                    type: getStringAttribute(item, 'type') ?? 'IFCPRODUCT',
                  })
                }
              }
            }
          } catch {
            // If batch fetch fails, fall back to generic type label
          }
          if (cancelled) return

          const flatNodes: SpatialTreeNode[] = localIds.map((id) => {
            const data = itemDataMap.get(id)
            return {
              localId: id,
              name: data?.name ?? '',
              type: data?.type ?? 'IFCPRODUCT',
              children: [],
              hasChildren: false,
            }
          })

          setTreeChildren(flatNodes)
          buildTreeMaps(flatNodes)
        } else {
          setTreeChildren(roots)
          buildTreeMaps(roots)
        }

        setTreeLoadingState('loaded')
      } catch (err) {
        if (!cancelled) {
          console.warn('[ModelTreePanel] Failed to load spatial structure:', err)
          setTreeLoadingState('loaded') // Treat error as "loaded with empty tree"
        }
      }
    }

    loadTree()

    return () => {
      cancelled = true
    }
  }, [modelVersion, setTreeChildren, setTreeBreadcrumb, buildTreeMaps, setTreeLoadingState])

  // ─── Load element properties when selection changes ────────────────────────
  // Fetches getItemsData() and populates selectedElement in the store.
  // Clears selectedElement immediately on every selection change (including
  // when selectedId changes from one element to another) so the UI never
  // shows stale properties while the new fetch is in flight.
  // biome-ignore lint/correctness/useExhaustiveDependencies: modelVersion is an intentional reactive trigger — re-fetch properties if model is replaced
  useEffect(() => {
    // Always clear first so UI never shows stale properties during fetch
    setSelectedElement(null)

    if (selectedId === null) return

    const model = modelRef.current
    if (!model) return

    let cancelled = false

    async function loadElementProperties() {
      if (!model || cancelled) return
      try {
        const items = await model.getItemsData([selectedId as number])
        if (cancelled) return

        const item = items[0]
        if (!item) {
          setSelectedElement(null)
          return
        }

        // Extract name and type from ItemData
        const name = getStringAttribute(item, 'Name') ?? ''
        const type = getStringAttribute(item, 'type') ?? ''

        // Flatten attributes for raw display
        const properties: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(item)) {
          if (Array.isArray(val)) continue // Skip nested relation arrays
          properties[key] = val
        }

        setSelectedElement({
          localId: selectedId as number,
          name,
          type,
          properties,
        })
      } catch (err) {
        if (!cancelled) {
          console.warn('[ModelTreePanel] Failed to load element properties:', err)
          setSelectedElement(null)
        }
      }
    }

    loadElementProperties()

    return () => {
      cancelled = true
    }
  }, [selectedId, modelVersion, setSelectedElement])

  // ─── Floor dropdown options (derived from treeRoots via useMemo) ────────────
  // Vercel rerender-derived-state: options are NOT stored as state.
  const floorOptions = useMemo(() => {
    const storeys: SpatialTreeNode[] = []
    function findStoreys(nodes: SpatialTreeNode[]) {
      for (const node of nodes) {
        if (node.type.toUpperCase() === 'IFCBUILDINGSTOREY') {
          storeys.push(node)
        } else {
          findStoreys(node.children)
        }
      }
    }
    findStoreys(treeRoots)
    return storeys
  }, [treeRoots])

  // ─── Floor change handler (event-handler pattern, NOT useEffect) ──────────
  // Vercel rerender-move-effect-to-event: both setSelectedFloor and tree
  // navigation happen in the same event handler.
  function handleFloorChange(storeyId: number | null) {
    setSelectedFloor(storeyId)
    if (storeyId !== null) {
      const { treeFlatMap } = useInteriorStore.getState()
      const storeyNode = treeFlatMap.get(storeyId)
      if (storeyNode) {
        // Reset breadcrumb to root then drill into the storey
        setTreeBreadcrumb([])
        drillInto(storeyNode)
      }
    } else {
      // "All Floors": navigate back to root
      const { treeRoots: roots } = useInteriorStore.getState()
      setTreeChildren(roots)
      setTreeBreadcrumb([])
      useInteriorStore.getState().setTreeCrumbs([])
    }
  }

  // ─── Empty / loading states ────────────────────────────────────────────────
  if (loadingState === 'idle' || loadingState === 'error') {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">
          Load an IFC model to explore its spatial structure.
        </p>
      </div>
    )
  }

  if (loadingState === 'loading' || treeLoadingState === 'loading') {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">Loading model…</p>
      </div>
    )
  }

  if (treeLoadingState === 'loaded' && treeChildren.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
          <p className="text-sm text-muted-foreground">
            This model has no spatial structure. Try clicking elements in the 3D view to inspect
            them.
          </p>
        </div>
        <ElementProperties />
      </div>
    )
  }

  if (treeChildren.length === 0) {
    // Still in initial load — show loading state
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">Loading model…</p>
      </div>
    )
  }

  // ─── Loaded state: tree navigation ────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Floor isolation dropdown (only if model has storey nodes) */}
      {floorOptions.length > 0 && (
        <div className="flex-shrink-0 px-4 pt-3 pb-1">
          <select
            value={selectedFloor === null ? '' : String(selectedFloor)}
            onChange={(e) => {
              const val = e.target.value
              handleFloorChange(val === '' ? null : Number(val))
            }}
            className="w-full text-sm rounded border border-border bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Floor isolation"
            data-testid="floor-isolation-dropdown"
          >
            <option value="">All Floors</option>
            {floorOptions.map((storey) => {
              const descendantCount = floorDescendantsMap.get(storey.localId)?.size ?? 0
              const label = storey.name
                ? `${storey.name} (${descendantCount})`
                : `${formatIfcTypeName(storey.type)} #${storey.localId} (${descendantCount})`
              return (
                <option key={storey.localId} value={String(storey.localId)}>
                  {label}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {/* Breadcrumb trail + back button */}
      <div className="flex-shrink-0 px-4 pt-3 pb-1">
        <BreadcrumbTrail
          breadcrumb={treeBreadcrumb}
          onNavigateUp={navigateUp}
          selectedFloor={selectedFloor}
        />
      </div>

      {/* Tree items */}
      <div className="flex-1 overflow-y-auto">
        <div role="tree" aria-label="IFC spatial tree" className="py-1">
          {treeChildren.map((node) => {
            const isSelected = selectedId === node.localId

            return (
              <TreeItem
                key={node.localId}
                node={node}
                isSelected={isSelected}
                onDrillInto={drillInto}
                onSelectLeaf={setSelectedId}
              />
            )
          })}
        </div>
      </div>

      {/* Element properties — below tree, separated by divider, only when selected */}
      <div className="flex-shrink-0">
        <ElementProperties />
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface BreadcrumbTrailProps {
  breadcrumb: SpatialTreeNode[]
  onNavigateUp: () => void
  /** Currently selected floor storey localId (null = all floors) */
  selectedFloor: number | null
}

function BreadcrumbTrail({ breadcrumb, onNavigateUp, selectedFloor }: BreadcrumbTrailProps) {
  if (breadcrumb.length === 0) {
    return <p className="text-xs text-muted-foreground font-medium">Model</p>
  }

  // When a floor is selected, the breadcrumb[0] is the storey node.
  // The back button should not navigate above the storey root — it stays
  // at the storey level to keep the floor filter active.
  const isAtStoreyRoot =
    selectedFloor !== null && breadcrumb.length === 1 && breadcrumb[0].localId === selectedFloor

  return (
    <nav className="flex items-center gap-1 flex-wrap" aria-label="Tree breadcrumb">
      {!isAtStoreyRoot && (
        <>
          <button
            type="button"
            onClick={onNavigateUp}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            aria-label="Navigate up one level"
            data-testid="tree-back-button"
          >
            Back
          </button>
          <ChevronRight size={12} className="text-muted-foreground/50 flex-shrink-0" />
        </>
      )}
      <span className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
        {breadcrumb.map((crumb, index) => (
          <span key={crumb.localId} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight size={10} className="text-muted-foreground/40 flex-shrink-0" />
            )}
            <span
              className={
                index === breadcrumb.length - 1
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }
            >
              {crumb.name || `${formatIfcTypeName(crumb.type)} #${crumb.localId}`}
            </span>
          </span>
        ))}
      </span>
    </nav>
  )
}

interface TreeItemProps {
  node: SpatialTreeNode
  isSelected: boolean
  onDrillInto: (node: SpatialTreeNode) => void
  onSelectLeaf: (localId: number) => void
}

function TreeItem({ node, isSelected, onDrillInto, onSelectLeaf }: TreeItemProps) {
  const Icon = getIfcIcon(node.type)
  const hasChildren = node.hasChildren || node.children.length > 0
  // When name is absent, show formatted type + localId to disambiguate nodes
  // (e.g. two unnamed "Building Storey" nodes become "Building Storey #3" / "Building Storey #4")
  const displayName = node.name ? node.name : `${formatIfcTypeName(node.type)} #${node.localId}`

  function handleClick() {
    if (hasChildren) {
      onDrillInto(node)
    } else {
      // Leaf node: select element so ElementProperties panel shows its data
      onSelectLeaf(node.localId)
    }
  }

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? false : undefined}
      aria-selected={!hasChildren ? isSelected : undefined}
      className="group"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors cursor-default min-h-[36px] ${isSelected && !hasChildren ? 'bg-muted/70' : ''}`}
      >
        {/* IFC class icon */}
        <Icon size={14} className="flex-shrink-0 text-muted-foreground" aria-hidden="true" />

        {/* Name + child count */}
        <button
          type="button"
          className="flex-1 flex items-center justify-between gap-2 text-left min-w-0"
          onClick={handleClick}
          aria-label={hasChildren ? `Open ${displayName}` : `Select ${displayName}`}
          data-testid={`tree-item-${node.localId}`}
        >
          <span className="text-sm truncate">{displayName}</span>

          {hasChildren && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                {node.children.length > 0 ? node.children.length : '...'}
              </span>
              <ChevronRight size={12} className="text-muted-foreground/60" aria-hidden="true" />
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Convert ThatOpen SpatialTreeItem hierarchy to our SpatialTreeNode type.
 * ThatOpen's SpatialTreeItem has: category, localId, children?.
 * Our SpatialTreeNode adds: name, type, hasChildren.
 */
function convertSpatialTree(
  items: FRAGS.SpatialTreeItem[],
  depth = 0,
  inheritedCategory?: string,
): SpatialTreeNode[] {
  // No hard cap — log at unusual depths but continue
  if (depth > 50) {
    console.warn('[ModelTreePanel] Unusually deep spatial tree (depth > 50); continuing...')
  }

  // ThatOpen alternates between category nodes (category set, localId null)
  // and instance nodes (localId set, category null). Category nodes are
  // structural groupings — their category propagates to child instances.
  const result: SpatialTreeNode[] = []
  for (const item of items) {
    if (item.localId === null && item.category) {
      // Category grouping node — pass its category to children
      const childNodes = convertSpatialTree(item.children ?? [], depth + 1, item.category)
      result.push(...childNodes)
    } else if (item.localId !== null) {
      // Instance node — inherit category from parent grouping node
      const children = convertSpatialTree(item.children ?? [], depth + 1)
      result.push({
        localId: item.localId as number,
        name: '',
        type: item.category ?? inheritedCategory ?? 'Unknown',
        children,
        hasChildren: children.length > 0 || (item.children?.length ?? 0) > 0,
      } satisfies SpatialTreeNode)
    }
    // Skip nodes with both null localId and null category
  }
  return result
}

/** Returns true if an IFC type is a building storey (floor level). */
function isIfcStorey(type: string): boolean {
  return type.toUpperCase() === 'IFCBUILDINGSTOREY'
}

/**
 * Returns true if any node in the tree (at any depth) is an IFCBUILDINGSTOREY.
 * Used to detect models without floor groupings so we can fall back to flat-list mode.
 */
function treeHasStoreys(nodes: SpatialTreeNode[]): boolean {
  for (const node of nodes) {
    if (isIfcStorey(node.type)) return true
    if (node.children.length > 0 && treeHasStoreys(node.children)) return true
  }
  return false
}

/**
 * Collect all IFCBUILDINGSTOREY nodes from the tree at any depth.
 */
function collectStoreyNodes(nodes: SpatialTreeNode[]): SpatialTreeNode[] {
  const storeys: SpatialTreeNode[] = []
  for (const node of nodes) {
    if (isIfcStorey(node.type)) {
      storeys.push(node)
    }
    if (node.children.length > 0) {
      storeys.push(...collectStoreyNodes(node.children))
    }
  }
  return storeys
}

/**
 * Fetch GlobalId for all IFCBUILDINGSTOREY nodes in the tree and set
 * it on each node's `globalId` property. Mutates the nodes in-place.
 *
 * Performance: typically 1-5 storeys per model, so this is a single
 * small getItemsData() call, not an expensive full-model scan.
 */
async function populateStoreyGlobalIds(
  roots: SpatialTreeNode[],
  model: FRAGS.FragmentsModel,
): Promise<void> {
  const storeys = collectStoreyNodes(roots)
  if (storeys.length === 0) return

  const storeyIds = storeys.map((s) => s.localId)

  try {
    const items = await model.getItemsData(storeyIds)
    for (let i = 0; i < storeys.length; i++) {
      const item = items[i]
      if (!item) continue
      const gid = getStringProp(item as unknown as Record<string, unknown>, [
        '_guid',
        'guid',
        'GlobalId',
        'globalId',
        'GUID',
      ])
      if (gid) {
        storeys[i].globalId = gid
      }
    }
  } catch (err) {
    // Non-fatal: GlobalId is only needed for indoor analysis.
    // The tree will still function correctly without it.
    console.warn('[ModelTreePanel] Failed to fetch storey GlobalIds:', err)
  }
}
