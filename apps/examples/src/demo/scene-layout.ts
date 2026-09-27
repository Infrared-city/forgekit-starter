// The demo scene as plain data: a 512 m x 512 m square.
// Coordinates are METRES from the south-west corner: x east, y north, z up.
// West half (x 0-256): city blocks and streets. East half (x 256-512): a park.
// Change a number here and run `npm run demo:precompute` to see its effect.

/** A real place for sun angles and weather: open land east of Vienna, Austria. */
export const DEMO_CENTER = { lat: 48.25, lon: 16.6 } as const
export const SCENE_SIZE_M = 512

/** An axis-aligned rectangle [x0, y0, x1, y1] in metres. */
export type Rect = readonly [number, number, number, number]

export interface Block {
  id: string
  rect: Rect
  height: number
}

// ---- Streets (asphalt carriageway + concrete sidewalks) ----------------------

/**
 * The main street, "Linden Street": north-south, 24 m wide (32 m between the
 * facades). Baseline: 3 m sidewalk, 18 m asphalt, 3 m sidewalk.
 * The "greener" variant keeps 7 m of asphalt and turns the rest into
 * grass strips with a row of street trees on each side (see scene.ts).
 */
export const MAIN_STREET = { x0: 112, x1: 136, sidewalk: 3 } as const
export const GREEN_STREET = { asphaltX0: 120.5, asphaltX1: 127.5, treeSpacing: 10 } as const

/** Other streets: [rect, sidewalk width]. The 8 m east-west one is the narrow canyon. */
export const STREETS: ReadonlyArray<{ id: string; rect: Rect; sidewalk: number }> = [
  { id: 'west-edge', rect: [0, 0, 14, 512], sidewalk: 2.5 },
  { id: 'park-edge', rect: [236, 0, 256, 512], sidewalk: 3 },
  { id: 'south', rect: [0, 0, 256, 12], sidewalk: 2.5 },
  { id: 'cross', rect: [0, 120, 256, 136], sidewalk: 3 },
  { id: 'canyon', rect: [0, 300, 256, 308], sidewalk: 1.5 },
  { id: 'north', rect: [0, 420, 256, 436], sidewalk: 3 },
]

// ---- Buildings (flat roofs, heights in metres) --------------------------------

/** The courtyard block: four wings around a green inner yard. */
export const COURTYARD = { rect: [18, 16, 108, 116] as Rect, depth: 14, height: 21 }

export const BLOCKS: readonly Block[] = [
  // South-east of the main street: three slabs of rising height.
  { id: 'slab-a', rect: [140, 16, 232, 40], height: 12 },
  { id: 'slab-b', rect: [140, 56, 232, 78], height: 18 },
  { id: 'slab-c', rect: [140, 94, 232, 116], height: 24 },
  // Middle band. Tall on the canyon side (north), lower to the south.
  { id: 'mid-w-low', rect: [18, 140, 108, 214], height: 18 },
  { id: 'mid-w-high', rect: [18, 226, 108, 300], height: 30 },
  { id: 'podium', rect: [140, 140, 196, 214], height: 9 },
  { id: 'tower', rect: [202, 160, 232, 196], height: 60 },
  { id: 'mid-e-high', rect: [140, 226, 232, 300], height: 33 },
  // North of the canyon: the tallest blocks. The canyon is 8 m wide, so it is deep (H/W about 5).
  { id: 'canyon-w', rect: [18, 308, 108, 416], height: 36 },
  { id: 'canyon-e', rect: [140, 308, 232, 416], height: 42 },
  // Northern edge: mixed heights.
  { id: 'north-w1', rect: [18, 440, 60, 508], height: 15 },
  { id: 'north-w2', rect: [66, 440, 108, 508], height: 21 },
  { id: 'north-e1', rect: [140, 440, 190, 508], height: 24 },
  { id: 'north-e2', rect: [196, 440, 232, 508], height: 12 },
  // In the park, at the south-west foot of the hill (flat ground: more than
  // HILL.radius from the top). Shows a tall building next to the terrain.
  { id: 'hill-tower', rect: [336, 286, 360, 310], height: 45 },
]

// ---- Park (east half) ---------------------------------------------------------

/** The lake: an ellipse of water. */
export const LAKE = { cx: 395, cy: 135, rx: 58, ry: 34 } as const

/**
 * A gentle hill: a smooth bump in the terrain, `height` metres at the top
 * (steepest slope about 19°). Its south slope is open lawn, so the slope effect
 * on sun and radiation is easy to see. Trees stand on its north-west slope
 * and at its north-east foot; the hill tower stands at its south-west foot.
 */
export const HILL = { cx: 420, cy: 385, radius: 90, height: 20 } as const

/** Curved paths (concrete, `width` m), each drawn through these control points. */
export const PATHS: ReadonlyArray<{
  id: string
  width: number
  points: ReadonlyArray<[number, number]>
}> = [
  {
    id: 'promenade',
    width: 5,
    points: [
      [256, 60],
      [300, 70],
      [330, 100],
      [340, 190],
      [380, 230],
      [460, 250],
      [512, 245],
    ],
  },
  {
    id: 'hill-walk',
    width: 3.5,
    points: [
      [256, 330],
      [300, 318],
      [350, 340],
      [395, 385],
      [430, 430],
      [470, 470],
      [500, 512],
    ],
  },
  {
    id: 'north-link',
    width: 3,
    points: [
      [340, 190],
      [320, 260],
      [300, 318],
    ],
  },
]

/** A ring path around the lake, `offset` m from the shore. */
export const LAKE_RING = { offset: 9, width: 3 } as const

/**
 * A large open-air car park: bare asphalt, no shade. It is the hottest spot of
 * the baseline. The "greener" variant puts a tree ring and a middle row of
 * trees on grass strips around and through it (see ground.ts and scene.ts).
 */
export const PARKING_LOT: Rect = [262, 8, 338, 52]
export const GREEN_LOT = { border: 4, islandY0: 28, islandY1: 32, treeSpacing: 9 } as const

/** A small sand playground (soil). */
export const PLAYGROUND: Rect = [276, 440, 312, 476]

/**
 * Tree clusters: `count` trees scattered around the centre (spread = typical
 * distance in metres). Genus decides the crown shape (broadleaf, conifer,
 * columnar); heights and crowns vary inside the given ranges.
 */
export const TREE_CLUSTERS: ReadonlyArray<{
  cx: number
  cy: number
  spread: number
  count: number
  genus: readonly string[]
  height: readonly [number, number]
  crown: readonly [number, number]
}> = [
  {
    cx: 300,
    cy: 175,
    spread: 18,
    count: 22,
    genus: ['Quercus', 'Tilia'],
    height: [14, 22],
    crown: [9, 14],
  },
  { cx: 470, cy: 175, spread: 20, count: 24, genus: ['Pinus'], height: [12, 20], crown: [5, 8] },
  {
    cx: 480,
    cy: 60,
    spread: 16,
    count: 16,
    genus: ['Acer', 'Betula'],
    height: [9, 15],
    crown: [6, 10],
  },
  { cx: 398, cy: 296, spread: 14, count: 12, genus: ['Populus'], height: [16, 24], crown: [6, 9] },
  {
    cx: 488,
    cy: 468,
    spread: 16,
    count: 20,
    genus: ['Quercus', 'Fagus', 'Pinus'],
    height: [12, 22],
    crown: [7, 13],
  },
  {
    cx: 330,
    cy: 470,
    spread: 16,
    count: 14,
    genus: ['Tilia', 'Acer'],
    height: [10, 16],
    crown: [7, 11],
  },
  // On the north-west slope of the hill (the terrain seats them, see buildRequest).
  {
    cx: 390,
    cy: 425,
    spread: 14,
    count: 14,
    genus: ['Betula', 'Pinus', 'Acer'],
    height: [9, 15],
    crown: [6, 9],
  },
]

/** Trees in the courtyard. */
export const COURTYARD_TREES: ReadonlyArray<[number, number]> = [
  [52, 56],
  [74, 72],
  [58, 84],
]
