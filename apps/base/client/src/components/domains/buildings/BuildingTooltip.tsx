import type { DeckGLRef } from '@deck.gl/react'
import type { DotBimMesh } from '@forge-kit/buildings'
import { applyTransform, useBuildingsStore } from '@forge-kit/buildings'
import { Box, Layers, MapPin, Move, RotateCw, Undo2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, Input, Label, Popover, PopoverAnchor, PopoverContent, Separator } from 'ui'
import { useShallow } from 'zustand/react/shallow'

/** Dependencies injected from the composition root / plugin. */
export interface BuildingTooltipDeps {
  deckRef: React.RefObject<DeckGLRef | null>
  origin: [number, number]
  buildings: Record<string, DotBimMesh> | undefined
  selectedMeshId: string | null
  dragState: { isDragging: boolean }
  selectMesh: (id: string | null) => void
  computeMeshCentroid: (mesh: DotBimMesh) => { x: number; y: number; z: number }
  metersToLatLng: (
    meters: { x: number; y: number },
    origin: [number, number],
  ) => { lat: number; lng: number }
}

// Coordinate display component
function CoordinateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/50 border border-border rounded-md p-2 flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
      <span className="text-xs font-mono font-medium text-card-foreground">{value}</span>
    </div>
  )
}

// Transform input field component
function TransformInput({
  icon,
  label,
  value,
  onChange,
  disabled,
  step = '0.1',
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  step?: string
}) {
  return (
    <div className="relative">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {icon}
      </div>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono pointer-events-none">
        {label}
      </span>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-8 pl-8 pr-6 text-xs font-mono bg-card/50 border-border text-card-foreground focus:bg-card focus:border-primary transition-colors disabled:opacity-60"
      />
    </div>
  )
}

export function BuildingTooltip({ deps }: { deps: BuildingTooltipDeps }) {
  const {
    deckRef,
    origin,
    buildings,
    selectedMeshId,
    dragState,
    selectMesh,
    computeMeshCentroid,
    metersToLatLng,
  } = deps

  const { buildingTransforms, updateBuildingTransform, clearBuildingTransform } = useBuildingsStore(
    useShallow((s) => ({
      buildingTransforms: s.buildingTransforms,
      updateBuildingTransform: s.updateBuildingTransform,
      clearBuildingTransform: s.clearBuildingTransform,
    })),
  )

  const [screenPosition, setScreenPosition] = useState<{ x: number; y: number } | null>(null)
  const [editValues, setEditValues] = useState({
    deltaX: 0,
    deltaY: 0,
    rotation: 0,
  })

  const animationFrameRef = useRef<number>(undefined)

  // Update screen position on viewport changes
  useEffect(() => {
    if (!selectedMeshId || !buildings || !buildings[selectedMeshId]) {
      setScreenPosition(null)
      return
    }

    const updatePosition = () => {
      const deckInstance = deckRef.current?.deck
      if (!deckInstance) {
        animationFrameRef.current = requestAnimationFrame(updatePosition)
        return
      }

      const selectedMesh = buildings[selectedMeshId]
      const transform = buildingTransforms[selectedMeshId]
      const transformedMesh = transform ? applyTransform(selectedMesh, transform) : selectedMesh

      const centroid = computeMeshCentroid(transformedMesh)
      const latLng = metersToLatLng({ x: centroid.x, y: centroid.y }, origin)

      const viewports = deckInstance.getViewports()
      if (viewports && viewports.length > 0) {
        const viewport = viewports[0]
        const [x, y] = viewport.project([latLng.lng, latLng.lat, centroid.z])
        setScreenPosition({ x, y })
      }

      animationFrameRef.current = requestAnimationFrame(updatePosition)
    }

    updatePosition()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    selectedMeshId,
    buildings,
    buildingTransforms,
    origin,
    deckRef,
    computeMeshCentroid,
    metersToLatLng,
  ])

  // Update edit values when selection changes
  useEffect(() => {
    if (selectedMeshId && buildingTransforms[selectedMeshId]) {
      const transform = buildingTransforms[selectedMeshId]
      setEditValues({
        deltaX: transform.deltaX,
        deltaY: transform.deltaY,
        rotation: transform.rotation,
      })
    } else {
      setEditValues({ deltaX: 0, deltaY: 0, rotation: 0 })
    }
  }, [selectedMeshId, buildingTransforms])

  const handleInputChange = (field: 'deltaX' | 'deltaY' | 'rotation', value: string) => {
    const numValue = parseFloat(value) || 0
    setEditValues((prev) => ({ ...prev, [field]: numValue }))

    if (selectedMeshId) {
      updateBuildingTransform(selectedMeshId, { [field]: numValue })
    }
  }

  const handleReset = () => {
    if (selectedMeshId) {
      clearBuildingTransform(selectedMeshId)
      setEditValues({ deltaX: 0, deltaY: 0, rotation: 0 })
    }
  }

  if (!selectedMeshId || !buildings || !buildings[selectedMeshId] || !screenPosition) {
    return null
  }

  const selectedMesh = buildings[selectedMeshId]
  const transform = buildingTransforms[selectedMeshId]
  const transformedMesh = transform ? applyTransform(selectedMesh, transform) : selectedMesh
  const centroid = computeMeshCentroid(transformedMesh)
  const latLng = metersToLatLng({ x: centroid.x, y: centroid.y }, origin)

  return (
    <Popover open={true}>
      <PopoverAnchor
        style={
          {
            '--anchor-x': `${screenPosition.x}px`,
            '--anchor-y': `${screenPosition.y}px`,
          } as React.CSSProperties
        }
        className="absolute pointer-events-none [left:var(--anchor-x)] [top:var(--anchor-y)]"
      />
      <PopoverContent
        side="right"
        sideOffset={20}
        className="w-80 p-0 overflow-hidden border-border bg-card backdrop-blur-xl shadow-2xl rounded-xl"
      >
        {/* Header */}
        <div className="bg-accent/50 p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent rounded-md">
              <Box className="w-4 h-4 text-card-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-none tracking-tight text-card-foreground">
                Object Inspector
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                ID: {selectedMeshId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectMesh(null)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-md"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4 space-y-5">
          {/* Coordinates Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              <span>Geospatial Anchor</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CoordinateField label="LAT" value={latLng.lat.toFixed(6)} />
              <CoordinateField label="LNG" value={latLng.lng.toFixed(6)} />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Transform Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Layers className="w-3.5 h-3.5" />
                <span>Transform</span>
              </div>
              {transform && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                  Translation (Meters)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <TransformInput
                    icon={<Move className="w-3.5 h-3.5" />}
                    label="X"
                    value={editValues.deltaX.toFixed(2)}
                    onChange={(value) => handleInputChange('deltaX', value)}
                    disabled={dragState.isDragging}
                  />
                  <TransformInput
                    icon={<Move className="w-3.5 h-3.5 rotate-90" />}
                    label="Y"
                    value={editValues.deltaY.toFixed(2)}
                    onChange={(value) => handleInputChange('deltaY', value)}
                    disabled={dragState.isDragging}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                  Rotation (Degrees)
                </Label>
                <TransformInput
                  icon={<RotateCw className="w-3.5 h-3.5" />}
                  label="deg"
                  value={String(editValues.rotation)}
                  onChange={(value) => handleInputChange('rotation', value)}
                  step="1"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs bg-transparent text-muted-foreground border-border border-dashed hover:bg-accent hover:text-card-foreground hover:border-primary transition-all"
            disabled={!transform}
          >
            <Undo2 className="w-3.5 h-3.5 mr-2" />
            Reset Transforms
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
