import {
  BarChart3,
  Building2,
  ChevronDown,
  Compass,
  Layers,
  MapPin,
  Shapes,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { useMapStore } from '../map.store'

interface LayerItemProps {
  checked: boolean
  onChange: () => void
  icon: React.ReactNode
  label: string
  shortcut: string
  description: string
}

function LayerItem({ checked, onChange, icon, label, shortcut, description }: LayerItemProps) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors"
      title={description}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-ring focus:ring-2 accent-primary"
        aria-describedby={`${label.toLowerCase()}-description`}
      />
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
      <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
        {shortcut}
      </kbd>
      <span id={`${label.toLowerCase()}-description`} className="sr-only">
        {description}
      </span>
    </label>
  )
}

export function LayerControls() {
  const { layers, toggleLayer, selectedMeshId, selectMesh, viewState, setViewState } = useMapStore(
    useShallow((s) => ({
      layers: s.layers,
      toggleLayer: s.toggleLayer,
      selectedMeshId: s.selectedMeshId,
      selectMesh: s.selectMesh,
      viewState: s.viewState,
      setViewState: s.setViewState,
    })),
  )

  const [collapsed, setCollapsed] = useState(false)
  const activeCount = Object.values(layers).filter(Boolean).length
  const tilted = viewState.pitch !== 0 || viewState.bearing !== 0

  return (
    <Card
      className="absolute top-4 right-4 z-30 w-56 shadow-lg"
      role="region"
      aria-label="Map layer controls"
    >
      <CardHeader className={`px-4 py-3 ${collapsed ? 'pb-3' : 'pb-2'}`}>
        <button
          type="button"
          className="flex w-full items-center justify-between cursor-pointer"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="layer-controls-content"
        >
          <CardTitle className="flex items-center gap-2 text-sm" id="layer-controls-title">
            <Layers className="w-4 h-4" />
            Layers
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {activeCount}/{Object.keys(layers).length}
            </Badge>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? '-rotate-90' : ''}`}
            />
          </div>
        </button>
      </CardHeader>
      {!collapsed && (
        <CardContent
          id="layer-controls-content"
          className="space-y-1"
          role="group"
          aria-labelledby="layer-controls-title"
        >
          <LayerItem
            checked={layers.buildings}
            onChange={() => toggleLayer('buildings')}
            icon={<Building2 className="w-4 h-4" />}
            label="Buildings"
            shortcut="1"
            description="Show 3D building models on the map"
          />
          <LayerItem
            checked={layers.analysis}
            onChange={() => toggleLayer('analysis')}
            icon={<BarChart3 className="w-4 h-4" />}
            label="Analysis"
            shortcut="2"
            description="Show analysis results overlay"
          />
          <LayerItem
            checked={layers.markers}
            onChange={() => toggleLayer('markers')}
            icon={<MapPin className="w-4 h-4" />}
            label="Markers"
            shortcut="3"
            description="Show map markers and points of interest"
          />
          <LayerItem
            checked={layers.groundMaterials}
            onChange={() => toggleLayer('groundMaterials')}
            icon={<Shapes className="w-4 h-4" />}
            label="Materials"
            shortcut="4"
            description="Show ground material polygons on the map"
          />
          <Separator className="my-2" />
          <Button
            variant="ghost"
            size="sm"
            disabled={!tilted}
            onClick={() => setViewState({ pitch: 0, bearing: 0 })}
            className="w-full justify-start gap-2 h-8 px-2"
            title="Reset pitch and bearing to top-down view"
          >
            <Compass className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Top view</span>
          </Button>

          {/* Selected building indicator */}
          {selectedMeshId && (
            <>
              <Separator className="my-2" />
              <div className="flex items-center justify-between p-2 -mx-2 rounded-md bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">Selected:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedMeshId.slice(0, 8)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => selectMesh(null)}
                  aria-label="Deselect building"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
