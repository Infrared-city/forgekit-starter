// Per-user recents for the location search dropdown. Capped at 5, written
// to localStorage. Safari private-mode + locked-down browsers can throw on
// write, so every call is guarded — failure degrades to "no recents", never
// blows up the search UI.

const KEY = 'forge-kit:recent-places'
const CAP = 5

export interface RecentPlace {
  placeId: string
  primaryText: string
  secondaryText: string | null
  lat: number
  lng: number
  /** Epoch ms; used for ordering. */
  timestamp: number
}

function safeStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getRecents(): RecentPlace[] {
  const store = safeStorage()
  if (!store) return []
  try {
    const raw = store.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (r): r is RecentPlace =>
          r &&
          typeof r === 'object' &&
          typeof r.placeId === 'string' &&
          typeof r.primaryText === 'string' &&
          (r.secondaryText === null || typeof r.secondaryText === 'string') &&
          typeof r.lat === 'number' &&
          typeof r.lng === 'number' &&
          typeof r.timestamp === 'number',
      )
      .slice(0, CAP)
  } catch {
    return []
  }
}

export function pushRecent(entry: Omit<RecentPlace, 'timestamp'>): RecentPlace[] {
  const store = safeStorage()
  const next: RecentPlace[] = [
    { ...entry, timestamp: Date.now() },
    ...getRecents().filter((r) => r.placeId !== entry.placeId),
  ].slice(0, CAP)
  if (store) {
    try {
      store.setItem(KEY, JSON.stringify(next))
    } catch {
      // Quota / locked-down browser — silently drop.
    }
  }
  return next
}

export function clearRecents(): void {
  const store = safeStorage()
  if (!store) return
  try {
    store.removeItem(KEY)
  } catch {
    // ignore
  }
}
