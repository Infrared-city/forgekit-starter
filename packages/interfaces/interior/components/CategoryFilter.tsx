import { Filter } from 'lucide-react'
import { Button, Popover, PopoverContent, PopoverTrigger, Separator } from 'ui'
import { useShallow } from 'zustand/react/shallow'
import { EXTERIOR_WALLS_KEY, IFC_CATEGORIES, WALL_CATEGORY_KEYS } from '../interior.constants'
import { useInteriorStore } from '../interior.store'

/**
 * CategoryFilter — popover dropdown with checkboxes for each IFC category.
 *
 * Wall pseudo-categories (Exterior Walls, Interior Walls) appear first with a
 * visual divider, followed by remaining IFC categories alphabetically.
 *
 * When hasExternalProperty is false (no wall in the model had Pset_WallCommon.IsExternal),
 * the "Exterior Walls" checkbox is disabled with a tooltip explaining why.
 *
 * Toggling a checkbox calls setCategoryFilter(category, visible) in the store.
 * Rendering the actual Three.js visibility changes is delegated to
 * InteriorCanvas via store subscriptions (visibility precedence is enforced there).
 */
export function CategoryFilter() {
  // Vercel `rerender-defer-reads`: use useShallow to avoid re-renders
  // when unrelated categories change (only re-render when the categoryFilters
  // object reference changes with actual value differences).
  const categoryFilters = useInteriorStore(useShallow((s) => s.categoryFilters))
  const setCategoryFilter = useInteriorStore((s) => s.setCategoryFilter)
  const resetAllCategoryFilters = useInteriorStore((s) => s.resetAllCategoryFilters)
  const wallClassification = useInteriorStore((s) => s.wallClassification)

  const hasExternalProperty = wallClassification?.hasExternalProperty ?? false

  /**
   * Returns true if the category is currently visible.
   * If the category key is not in categoryFilters (never been toggled),
   * it defaults to visible (true).
   */
  function isCategoryVisible(category: string): boolean {
    const value = categoryFilters[category]
    return value === undefined ? true : value
  }

  const allEntries = Object.entries(IFC_CATEGORIES)
  const hiddenCount = allEntries.filter(([key]) => isCategoryVisible(key) === false).length

  // Split entries: wall pseudo-categories first, then the rest
  const wallEntries = allEntries.filter(([key]) =>
    (WALL_CATEGORY_KEYS as readonly string[]).includes(key),
  )
  const otherEntries = allEntries
    .filter(([key]) => !(WALL_CATEGORY_KEYS as readonly string[]).includes(key))
    .sort(([, a], [, b]) => a.localeCompare(b))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          aria-label="Toggle category filter"
          title="Category filter"
        >
          <Filter className="h-4 w-4" />
          {hiddenCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center leading-none">
              {hiddenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-2 bg-popover"
        side="left"
        align="start"
        sideOffset={8}
        aria-label="IFC category filters"
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-medium text-foreground">Categories</span>
          {hiddenCount > 0 && (
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                resetAllCategoryFilters()
              }}
              aria-label="Show all categories"
            >
              Show all
            </button>
          )}
        </div>
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {/* Wall pseudo-categories at top */}
          {wallEntries.map(([key, label]) => {
            const visible = isCategoryVisible(key)
            const isExteriorWalls = key === EXTERIOR_WALLS_KEY
            const isDisabled = isExteriorWalls && !hasExternalProperty

            return (
              <label
                key={key}
                className={`flex items-center gap-2 rounded px-1 py-1 transition-colors ${
                  isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent/50'
                }`}
                title={isDisabled ? 'IsExternal property not found in this model.' : undefined}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  disabled={isDisabled}
                  onChange={(e) => setCategoryFilter(key, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input bg-background text-primary focus:ring-ring focus:ring-1 accent-primary disabled:opacity-50"
                  aria-label={`Toggle ${label} visibility`}
                />
                <span className="text-xs text-muted-foreground flex-1 truncate">{label}</span>
              </label>
            )
          })}

          {/* Visual divider between wall categories and other categories */}
          {wallEntries.length > 0 && otherEntries.length > 0 && <Separator className="my-1" />}

          {/* Remaining IFC categories */}
          {otherEntries.map(([key, label]) => {
            const visible = isCategoryVisible(key)
            return (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer rounded px-1 py-1 hover:bg-accent/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setCategoryFilter(key, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-input bg-background text-primary focus:ring-ring focus:ring-1 accent-primary"
                  aria-label={`Toggle ${label} visibility`}
                />
                <span className="text-xs text-muted-foreground flex-1 truncate">{label}</span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
