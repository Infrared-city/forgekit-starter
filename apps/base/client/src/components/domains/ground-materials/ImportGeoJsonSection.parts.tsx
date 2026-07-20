import { cn } from 'ui'
import type { ImportMode, ReplaceMode } from './ImportGeoJsonSection.helpers'

// ---------------------------------------------------------------------------
// Tab strip (Single FC / Multi-material dict)
// ---------------------------------------------------------------------------

interface ImportModeTabsProps {
  importMode: ImportMode
  disabled: boolean
  onSwitch: (next: ImportMode) => void
}

export function ImportModeTabs({ importMode, disabled, onSwitch }: ImportModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="GeoJSON import shape"
      className="inline-flex w-full rounded-md border border-border bg-muted/30 p-0.5"
    >
      <TabButton
        active={importMode === 'single'}
        disabled={disabled}
        onClick={() => onSwitch('single')}
        label="Single FC"
      />
      <TabButton
        active={importMode === 'multi'}
        disabled={disabled}
        onClick={() => onSwitch('multi')}
        label="Multi-material dict"
      />
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  disabled: boolean
  onClick: () => void
  label: string
}

function TabButton({ active, disabled, onClick, label }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex-1 px-2 py-1 text-[11px] rounded-sm transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Replace/Add segmented control
// ---------------------------------------------------------------------------

interface ReplaceModeToggleProps {
  replaceMode: ReplaceMode
  disabled: boolean
  onChange: (next: ReplaceMode) => void
}

export function ReplaceModeToggle({ replaceMode, disabled, onChange }: ReplaceModeToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">On import</span>
      <div
        role="radiogroup"
        aria-label="Import mode"
        className="inline-flex rounded-md border border-border bg-muted/30 p-0.5"
      >
        <RadioButton
          active={replaceMode === 'add'}
          disabled={disabled}
          onClick={() => onChange('add')}
          label="Add"
        />
        <RadioButton
          active={replaceMode === 'replace'}
          disabled={disabled}
          onClick={() => onChange('replace')}
          label="Replace"
        />
      </div>
    </div>
  )
}

interface RadioButtonProps {
  active: boolean
  disabled: boolean
  onClick: () => void
  label: string
}

function RadioButton({ active, disabled, onClick, label }: RadioButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'px-2 py-0.5 text-[11px] rounded-sm transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Drop zone
// ---------------------------------------------------------------------------

interface DropZoneProps {
  hasPreview: boolean
  isProcessing: boolean
  isDragOver: boolean
  importMode: ImportMode
  /**
   * `false` while `useGroundMaterialRegistry` is still loading. We block uploads
   * in that window because the routing classifier needs the set of known
   * material names to distinguish "labeled" from "unlabeled" features (see
   * `inspectPreviewFeatures`).
   */
  registryReady: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DropZone({
  hasPreview,
  isProcessing,
  isDragOver,
  importMode,
  registryReady,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  inputRef,
  onFileInputChange,
}: DropZoneProps) {
  const disabled = hasPreview || isProcessing || !registryReady
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer',
        disabled
          ? 'border-muted bg-muted/30 cursor-not-allowed opacity-60'
          : isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/20',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,.geojson"
        className="hidden"
        onChange={onFileInputChange}
        disabled={disabled}
      />

      {isProcessing ? (
        <span className="text-xs text-muted-foreground">Processing...</span>
      ) : (
        <>
          <UploadIcon />
          <span className="text-xs text-muted-foreground text-center">
            {hasPreview
              ? 'Import active -- confirm or cancel below'
              : !registryReady
                ? 'Loading materials...'
                : importMode === 'multi'
                  ? 'Drop multi-material .geojson here or click to browse'
                  : 'Drop .geojson file here or click to browse'}
          </span>
        </>
      )}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-muted-foreground"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Collapsible warnings panel
// ---------------------------------------------------------------------------

interface WarningsPanelProps {
  warnings: string[]
  expanded: boolean
  onToggle: () => void
}

export function WarningsPanel({ warnings, expanded, onToggle }: WarningsPanelProps) {
  if (warnings.length === 0) return null
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')}
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>
          {warnings.length} warning{warnings.length > 1 ? 's' : ''}
        </span>
      </button>
      {expanded && (
        <ul className="pl-4 space-y-0.5">
          {warnings.map((w, idx) => (
            <li key={idx} className="text-xs text-amber-600 list-disc">
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Material picker grid
// ---------------------------------------------------------------------------

interface MaterialPickerProps {
  label: string
  materials: Array<{ uuid: string; name: string; displayName: string; color: string }>
  selected: string | null
  onSelect: (name: string) => void
}

export function MaterialPicker({ label, materials, selected, onSelect }: MaterialPickerProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2">{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {materials.map((mat) => (
          <button
            key={mat.uuid}
            type="button"
            onClick={() => onSelect(mat.name)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
              'hover:shadow-sm',
              selected === mat.name
                ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                : 'border-border bg-background hover:border-primary/30',
            )}
            title={mat.displayName}
          >
            <div
              className="w-8 h-8 rounded-md border border-border/50"
              style={{ backgroundColor: mat.color }}
            />
            <span className="text-[10px] text-muted-foreground leading-tight text-center truncate w-full">
              {mat.displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
