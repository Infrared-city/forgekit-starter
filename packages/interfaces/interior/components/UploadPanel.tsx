import { Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useInteriorStore } from '../interior.store'
import { formatBytes } from '../interior.utils'

/**
 * UploadPanel — IFC file upload UI with drag & drop, progress bar, and model info.
 *
 * Features:
 * - Drag & drop zone with visual feedback on drag-over
 * - Browse button triggers native file picker filtered to `.ifc`
 * - Rejects non-.ifc files with inline error + toast
 * - Progress bar during file reading (FileReader onprogress)
 * - Toast notifications on load start and completion
 * - Model info display (filename, file size) after file stored
 * - "Replace Model" button when model is already loaded
 */
export function UploadPanel() {
  const loadingState = useInteriorStore((s) => s.loadingState)
  const loadingProgress = useInteriorStore((s) => s.loadingProgress)
  const loadingError = useInteriorStore((s) => s.loadingError)
  const modelInfo = useInteriorStore((s) => s.modelInfo)
  const loadFile = useInteriorStore((s) => s.loadFile)
  const reset = useInteriorStore((s) => s.reset)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const validateAndLoad = useCallback(
    (file: File | null | undefined) => {
      if (!file) return

      // Validate extension (web-ifc validates internally, but give fast feedback)
      if (!file.name.toLowerCase().endsWith('.ifc')) {
        const msg = `Invalid file type: "${file.name}". Only .ifc files are supported.`
        setFileError(msg)
        toast.error(msg)
        return
      }

      setFileError(null)
      void loadFile(file)
    },
    [loadFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      validateAndLoad(file)
    },
    [validateAndLoad],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      validateAndLoad(file)
      // Reset input so the same file can be re-selected after a replace
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [validateAndLoad],
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleReplaceModel = useCallback(() => {
    // Reset store state (full scene dispose deferred to Task 3)
    reset()
    setFileError(null)
    // Open file picker immediately
    fileInputRef.current?.click()
  }, [reset])

  const isLoading = loadingState === 'loading' || loadingState === 'parsing'
  const isLoaded = loadingState === 'loaded'

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ─── Drag & drop zone ────────────────────────────────────────────────── */}
      {!isLoaded && (
        <>
          {/* biome-ignore lint/a11y/useSemanticElements: div is used for drag & drop zone, not a simple action; it handles dragover/dragleave/drop events alongside click */}
          <div
            role="button"
            tabIndex={0}
            aria-label="IFC file drop zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleBrowseClick()
              }
            }}
            className={[
              'border-2 border-dashed rounded-lg p-8',
              'flex flex-col items-center justify-center gap-3',
              'cursor-pointer transition-colors',
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
              isLoading ? 'pointer-events-none opacity-60' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Upload
              className={['size-8', isDragOver ? 'text-primary' : 'text-muted-foreground'].join(
                ' ',
              )}
            />
            <div className="text-center">
              <p className="text-sm font-medium">Drag & drop an IFC file here</p>
              <p className="text-xs text-muted-foreground mt-1">
                or <span className="text-primary underline-offset-2 hover:underline">browse</span>{' '}
                to select
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Supports IFC2x3 and IFC4</p>
          </div>

          {/* Hidden file input - sr-only hides it visually; no aria-hidden so AT can still access it */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ifc"
            className="sr-only"
            aria-label="Select IFC file"
            onChange={handleFileChange}
          />
        </>
      )}

      {/* ─── Loading progress ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {loadingProgress < 50
                ? 'Reading file...'
                : loadingState === 'parsing'
                  ? 'Parsing IFC...'
                  : 'Processing model...'}
            </span>
            <span className="text-muted-foreground tabular-nums">{loadingProgress}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={loadingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="IFC loading progress"
            className="h-2 w-full rounded-full bg-muted overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-150"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── Inline error ─────────────────────────────────────────────────────── */}
      {(fileError ?? loadingError) && !isLoading && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <X className="size-4 mt-0.5 shrink-0" />
          <span>{fileError ?? loadingError}</span>
        </div>
      )}

      {/* ─── Model info (post-load) ───────────────────────────────────────────── */}
      {isLoaded && modelInfo && (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm font-medium truncate" title={modelInfo.name}>
                  {modelInfo.name}
                </p>
                <p className="text-xs text-muted-foreground">{formatBytes(modelInfo.sizeBytes)}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5 shrink-0">
                {modelInfo.schema !== 'unknown' ? modelInfo.schema : 'IFC'}
              </span>
            </div>

            {modelInfo.elementCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {modelInfo.elementCount.toLocaleString()} elements
              </p>
            )}
          </div>

          {/* Replace Model button */}
          <button
            type="button"
            onClick={handleReplaceModel}
            className="w-full text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
          >
            Replace Model
          </button>
        </div>
      )}
    </div>
  )
}
