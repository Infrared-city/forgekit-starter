/**
 * Presentational subcomponents for `ImportTreesSection`. No state, no
 * store reads — props in, JSX out.
 */
import { Loader2, Upload } from 'lucide-react'
import type { RefObject } from 'react'
import { Button, cn } from 'ui'
import type { ReplaceMode } from './ImportTreesSection.helpers'

// ---------------------------------------------------------------------------
// Replace/Add segmented toggle
// ---------------------------------------------------------------------------

interface ReplaceToggleProps {
  replaceMode: ReplaceMode
  onChange: (next: ReplaceMode) => void
}

export function ReplaceToggle({ replaceMode, onChange }: ReplaceToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Import mode"
      className="inline-flex rounded-md border border-border bg-muted/30 p-0.5"
    >
      <button
        type="button"
        role="radio"
        aria-checked={replaceMode === 'add'}
        onClick={() => onChange('add')}
        className={cn(
          'px-2 py-0.5 text-[10px] rounded-sm transition-colors',
          replaceMode === 'add'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Add
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={replaceMode === 'replace'}
        onClick={() => onChange('replace')}
        className={cn(
          'px-2 py-0.5 text-[10px] rounded-sm transition-colors',
          replaceMode === 'replace'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Replace
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drop zone
// ---------------------------------------------------------------------------

interface DropZoneProps {
  polygonSafe: boolean
  isProcessing: boolean
  isDragOver: boolean
  disabled: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
  inputRef: RefObject<HTMLInputElement | null>
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function TreesDropZone({
  polygonSafe,
  isProcessing,
  isDragOver,
  disabled,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  inputRef,
  onFileInputChange,
}: DropZoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 p-3 rounded-md border border-dashed transition-all cursor-pointer',
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
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing…
        </span>
      ) : (
        <>
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground text-center">
            {!polygonSafe
              ? 'Draw an analysis area first'
              : 'Drop a Points .geojson file or click to browse'}
          </span>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fallback prompt
// ---------------------------------------------------------------------------

interface FallbackPromptProps {
  height: string
  diameter: string
  onHeightChange: (next: string) => void
  onDiameterChange: (next: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export function FallbackPrompt({
  height,
  diameter,
  onHeightChange,
  onDiameterChange,
  onSubmit,
  onCancel,
}: FallbackPromptProps) {
  const submitDisabled = height === '' || diameter === ''
  return (
    <div className="space-y-2 rounded-md border border-border bg-background/60 p-2">
      <p className="text-[11px] text-muted-foreground">
        Some features are missing or have out-of-range <code className="text-[10px]">height</code> /{' '}
        <code className="text-[10px]">crownDiameter</code>. Enter fallback values to apply to those
        trees. Height must be 1–30 m, crown diameter 1–20 m.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-[10px] text-muted-foreground">
          Height (m)
          <input
            type="number"
            min={1}
            max={30}
            step="any"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder="e.g. 8"
            className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-muted-foreground">
          Crown diameter (m)
          <input
            type="number"
            min={1}
            max={20}
            step="any"
            value={diameter}
            onChange={(e) => onDiameterChange(e.target.value)}
            placeholder="e.g. 4"
            className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onSubmit}
          disabled={submitDisabled}
          className="flex-1"
        >
          Continue
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Preview summary + confirm/cancel
// ---------------------------------------------------------------------------

interface PreviewSummaryProps {
  count: number
  warnings: string[]
  replaceMode: ReplaceMode
  onConfirm: () => void
  onCancel: () => void
}

export function PreviewSummary({
  count,
  warnings,
  replaceMode,
  onConfirm,
  onCancel,
}: PreviewSummaryProps) {
  return (
    <div className="space-y-2 rounded-md border border-border bg-background/60 p-2">
      <p className="text-[11px] text-foreground">
        Ready to import <span className="font-medium tabular-nums">{count}</span> tree
        {count === 1 ? '' : 's'}.
      </p>
      {warnings.length > 0 && (
        <ul className="list-disc pl-4 space-y-0.5">
          {warnings.map((w, idx) => (
            <li key={idx} className="text-[10px] text-amber-600">
              {w}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Button variant="default" size="sm" onClick={onConfirm} className="flex-1">
          {replaceMode === 'replace' ? 'Replace and import' : 'Add to existing'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}
