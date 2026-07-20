import { Crosshair, Info, Maximize2, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import {
  Button,
  Card,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'ui'
import { KEYBOARD_SHORTCUTS } from '../interior.constants'
import { CategoryFilter } from './CategoryFilter'

/**
 * ViewerToolbar — floating card positioned top-right of the 3D canvas.
 *
 * Contains:
 * - Fit to model button (F key shortcut)
 * - Zoom in button
 * - Zoom out button
 * - Reset rotation button
 * - Info icon with shortcuts cheatsheet tooltip
 * - Funnel icon that opens CategoryFilter dropdown
 *
 * Camera control callbacks are passed in as props from InteriorCanvas so this
 * component stays decoupled from imperative Three.js refs.
 */

export interface ViewerToolbarProps {
  /** Frame the loaded model in the viewport */
  onFitToModel?: () => void
  /** Zoom in (decrease camera distance) */
  onZoomIn?: () => void
  /** Zoom out (increase camera distance) */
  onZoomOut?: () => void
  /** Reset camera to initial position / reset orbit controls */
  onResetRotation?: () => void
}

/**
 * Human-readable label for each shortcut key.
 * Uses the KEYBOARD_SHORTCUTS constant defined in interior.constants.ts.
 */
const SHORTCUT_DISPLAY: { key: string; label: string }[] = [
  { key: 'Escape', label: KEYBOARD_SHORTCUTS.Escape },
  { key: 'F', label: KEYBOARD_SHORTCUTS.f },
  { key: 'H', label: KEYBOARD_SHORTCUTS.h },
  { key: 'S', label: KEYBOARD_SHORTCUTS.s },
]

export function ViewerToolbar({
  onFitToModel,
  onZoomIn,
  onZoomOut,
  onResetRotation,
}: ViewerToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className="absolute right-4 top-4 z-50 flex flex-col gap-0.5 p-1.5 shadow-lg w-9"
        role="toolbar"
        aria-label="Viewer controls"
        aria-orientation="vertical"
      >
        {/* Fit to model */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onFitToModel}
              aria-label="Fit model to view (F)"
              disabled={!onFitToModel}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Fit to model (F)</TooltipContent>
        </Tooltip>

        {/* Zoom in */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onZoomIn}
              aria-label="Zoom in"
              disabled={!onZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Zoom in</TooltipContent>
        </Tooltip>

        {/* Zoom out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onZoomOut}
              aria-label="Zoom out"
              disabled={!onZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Zoom out</TooltipContent>
        </Tooltip>

        {/* Reset rotation */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onResetRotation}
              aria-label="Reset camera rotation"
              disabled={!onResetRotation}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Reset rotation</TooltipContent>
        </Tooltip>

        <Separator className="my-0.5" />

        {/* Keyboard shortcuts info */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Keyboard shortcuts">
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="w-52 p-0"
            aria-label="Keyboard shortcuts cheatsheet"
          >
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Keyboard shortcuts
              </p>
              <table className="w-full">
                <tbody>
                  {SHORTCUT_DISPLAY.map(({ key, label }) => (
                    <tr key={key}>
                      <td className="py-0.5 pr-3">
                        <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
                          {key}
                        </kbd>
                      </td>
                      <td className="py-0.5 text-xs text-foreground">{label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Category filter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              {/* CategoryFilter renders its own Popover trigger */}
              <CategoryFilter />
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">Category filter</TooltipContent>
        </Tooltip>

        {/* Crosshair / select indicator */}
        <Separator className="my-0.5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-default opacity-50"
              aria-label="Click to select elements"
              disabled
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Click elements to select</TooltipContent>
        </Tooltip>
      </Card>
    </TooltipProvider>
  )
}
