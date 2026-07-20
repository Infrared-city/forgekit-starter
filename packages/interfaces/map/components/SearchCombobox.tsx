import { Loader2, Search, X } from 'lucide-react'
import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button, cn, Input } from 'ui'
import type { PlaceDetails, PlaceSuggestion, PlacesClient } from '../lib/places.types'
import { getRecents, pushRecent, type RecentPlace } from '../lib/recent-places'
import {
  DEBOUNCE_MS,
  MIN_QUERY,
  newSessionToken,
  radiusForZoom,
  SESSION_TTL_MS,
} from './search/helpers'
import { EmptyRow, ErrorRow, SkeletonRows } from './search/StatusRows'
import { SuggestionItem } from './search/SuggestionItem'
import type { SearchPickedPlace, SuggestionRow } from './search/types'

export type { SearchPickedPlace } from './search/types'

export interface SearchComboboxProps {
  placesClient: PlacesClient
  viewport: { lat: number | null; lng: number | null; zoom: number | null }
  onPick: (picked: SearchPickedPlace) => void
  placeholder?: string
  className?: string
}

export function SearchCombobox({
  placesClient,
  viewport,
  onPick,
  placeholder = 'Search a place to begin…',
  className,
}: SearchComboboxProps) {
  'use no memo'
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [recents, setRecents] = useState<RecentPlace[]>(() => getRecents())
  const [highlight, setHighlight] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pickPending, setPickPending] = useState(false)

  const sessionRef = useRef<{ token: string; createdAt: number } | null>(null)
  const inflightRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ensureSession = useCallback(() => {
    const now = Date.now()
    if (sessionRef.current && now - sessionRef.current.createdAt < SESSION_TTL_MS) {
      return sessionRef.current.token
    }
    sessionRef.current = { token: newSessionToken(), createdAt: now }
    return sessionRef.current.token
  }, [])

  const rows: SuggestionRow[] = useMemo(() => {
    if (query.trim().length >= MIN_QUERY) {
      return suggestions.map((s) => ({ kind: 'place', suggestion: s }))
    }
    return recents.map((r) => ({ kind: 'recent', recent: r }))
  }, [query, suggestions, recents])

  useEffect(() => {
    return () => {
      inflightRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const runFetch = useCallback(
    async (input: string) => {
      inflightRef.current?.abort()
      const ctrl = new AbortController()
      inflightRef.current = ctrl
      setStatus('loading')
      setErrorMessage(null)
      try {
        const lat = viewport.lat
        const lng = viewport.lng
        const locationBias =
          lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
            ? { lat, lng, radiusMeters: radiusForZoom(viewport.zoom) }
            : undefined
        const next = await placesClient.autocomplete(input, {
          sessionToken: ensureSession(),
          signal: ctrl.signal,
          locationBias,
        })
        if (ctrl.signal.aborted) return
        setSuggestions(next)
        setHighlight(0)
        setStatus('idle')
      } catch (err) {
        if (ctrl.signal.aborted || (err instanceof Error && err.name === 'AbortError')) return
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Search failed')
        setSuggestions([])
      }
    },
    [placesClient, viewport.lat, viewport.lng, viewport.zoom, ensureSession],
  )

  function scheduleFetch(input: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runFetch(input), DEBOUNCE_MS)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    setOpen(true)
    const trimmed = v.trim()
    if (trimmed.length < MIN_QUERY) {
      inflightRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setSuggestions([])
      setStatus('idle')
      setErrorMessage(null)
      return
    }
    scheduleFetch(trimmed)
  }

  function clearQuery() {
    inflightRef.current?.abort()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQuery('')
    setSuggestions([])
    setStatus('idle')
    setErrorMessage(null)
    setHighlight(0)
    inputRef.current?.focus()
  }

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setPickPending(true)
    try {
      const details = await placesClient.details(suggestion.placeId, {
        sessionToken: ensureSession(),
      })
      sessionRef.current = null
      const updated = pushRecent({
        placeId: details.placeId,
        primaryText: suggestion.primaryText || details.formatted,
        secondaryText: suggestion.secondaryText ?? details.locality ?? null,
        lat: details.coordinates.lat,
        lng: details.coordinates.lng,
      })
      setRecents(updated)
      setQuery(suggestion.primaryText || details.formatted)
      setOpen(false)
      onPick({ details, fromRecents: false })
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load place details')
    } finally {
      setPickPending(false)
    }
  }

  function selectRecent(recent: RecentPlace) {
    const details: PlaceDetails = {
      placeId: recent.placeId,
      formatted: recent.primaryText,
      name: recent.primaryText,
      coordinates: { lat: recent.lat, lng: recent.lng },
      locality: recent.secondaryText ?? null,
      region: null,
      country: null,
      types: [],
    }
    setRecents(
      pushRecent({
        placeId: recent.placeId,
        primaryText: recent.primaryText,
        secondaryText: recent.secondaryText,
        lat: recent.lat,
        lng: recent.lng,
      }),
    )
    setQuery(recent.primaryText)
    setOpen(false)
    onPick({ details, fromRecents: true })
  }

  function activateRow(row: SuggestionRow) {
    if (row.kind === 'recent') selectRecent(row.recent)
    else void selectSuggestion(row.suggestion)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (open) {
        setOpen(false)
      } else if (query) {
        clearQuery()
      } else {
        inputRef.current?.blur()
      }
      return
    }
    if (!open || rows.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % rows.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h - 1 + rows.length) % rows.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[highlight]
      if (row) activateRow(row)
    }
  }

  const showDropdown =
    open &&
    (status === 'loading' ||
      status === 'error' ||
      rows.length > 0 ||
      (query.trim().length >= MIN_QUERY && status === 'idle'))

  const showSpinnerIcon = status === 'loading' || pickPending

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && rows[highlight] ? `${listboxId}-row-${highlight}` : undefined
          }
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            const next = e.relatedTarget as HTMLElement | null
            if (next?.closest(`#${CSS.escape(listboxId)}`)) return
            setOpen(false)
          }}
          placeholder={placeholder}
          className="h-10 rounded-full border-border/60 bg-background/95 pl-9 pr-9 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/80"
        />
        {showSpinnerIcon ? (
          <Loader2
            aria-hidden="true"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        ) : query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={clearQuery}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-border/60 bg-popover/95 text-popover-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-popover/85"
        >
          {status === 'loading' && rows.length === 0 ? (
            <SkeletonRows />
          ) : status === 'error' ? (
            <ErrorRow message={errorMessage} onRetry={() => runFetch(query.trim())} />
          ) : rows.length === 0 ? (
            <EmptyRow query={query} />
          ) : (
            <div className="max-h-72 overflow-y-auto py-1">
              {query.trim().length < MIN_QUERY && recents.length > 0 && (
                <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recents
                </div>
              )}
              {rows.map((row, idx) => (
                <SuggestionItem
                  key={
                    row.kind === 'recent'
                      ? `r-${row.recent.placeId}`
                      : `p-${row.suggestion.placeId}-${idx}`
                  }
                  id={`${listboxId}-row-${idx}`}
                  row={row}
                  active={idx === highlight}
                  onMouseEnter={() => setHighlight(idx)}
                  onSelect={() => activateRow(row)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
