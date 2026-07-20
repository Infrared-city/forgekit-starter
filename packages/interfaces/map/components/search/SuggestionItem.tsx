import { cn } from 'ui'
import { iconForRecent, iconForTypes } from './helpers'
import type { SuggestionRow } from './types'

interface SuggestionItemProps {
  id: string
  row: SuggestionRow
  active: boolean
  onMouseEnter: () => void
  onSelect: () => void
}

export function SuggestionItem({ id, row, active, onMouseEnter, onSelect }: SuggestionItemProps) {
  const primary = row.kind === 'recent' ? row.recent.primaryText : row.suggestion.primaryText
  const secondary = row.kind === 'recent' ? row.recent.secondaryText : row.suggestion.secondaryText
  const Icon = row.kind === 'recent' ? iconForRecent() : iconForTypes(row.suggestion.types)
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      onMouseEnter={onMouseEnter}
      onMouseDown={(e) => {
        // Prevent the input's blur from closing the popup before click fires.
        e.preventDefault()
      }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
      )}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium leading-tight">{primary}</div>
        {secondary && (
          <div className="truncate text-xs text-muted-foreground leading-tight">{secondary}</div>
        )}
      </div>
    </div>
  )
}
