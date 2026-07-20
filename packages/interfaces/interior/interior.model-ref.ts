/**
 * Module-level ref for the current FragmentsModel instance.
 *
 * Three.js / ThatOpen imperative objects cannot be stored in Zustand
 * (non-serializable). This module-level ref is the bridge between:
 *  - InteriorCanvas (sets the ref after IfcImporter.import())
 *  - ModelTreePanel (reads the ref to call getSpatialStructure / setVisible)
 *
 * The ref is cleared on model dispose and route unmount.
 */

import type * as FRAGS from '@thatopen/fragments'

export const modelRef: { current: FRAGS.FragmentsModel | null } = {
  current: null,
}
