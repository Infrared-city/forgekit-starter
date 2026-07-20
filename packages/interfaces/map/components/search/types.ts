import type { PlaceDetails, PlaceSuggestion } from '../../lib/places.types'
import type { RecentPlace } from '../../lib/recent-places'

export type SuggestionRow =
  | { kind: 'recent'; recent: RecentPlace }
  | { kind: 'place'; suggestion: PlaceSuggestion }

export interface SearchPickedPlace {
  details: PlaceDetails
  /** True when the pick came from the recents row (no Google call). */
  fromRecents: boolean
}
