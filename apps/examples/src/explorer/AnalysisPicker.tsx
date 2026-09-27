// The analysis picker: a grid of icon tiles (a radio group). Each tile has a
// short label and a tooltip with one plain sentence about the analysis.
import type { ReactNode } from 'react'
import type { AnalysisId, DemoAnalysis } from '../demo/analyses'

/** Short tile label and tooltip for each analysis in the picker. */
const TILES: Partial<Record<AnalysisId, { short: string; tip: string; icon: ReactNode }>> = {
  utci: {
    short: 'Heat',
    tip: 'Heat stress (UTCI): the "feels like" temperature outdoors.',
    icon: (
      <>
        <path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z" />
        <path d="M12 9v7" />
      </>
    ),
  },
  solar: {
    short: 'Solar',
    tip: 'Solar radiation: how much sun energy reaches the ground.',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  'sun-hours': {
    short: 'Sun hours',
    tip: 'Sun hours: how many hours each spot gets direct sun.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  svf: {
    short: 'Sky view',
    tip: 'Sky view factor: how much open sky you see from each spot.',
    icon: (
      <>
        <path d="M3 18a9 9 0 0 1 18 0" />
        <path d="M3 18h18M12 18V9M12 18l-5-6M12 18l5-6" />
      </>
    ),
  },
  daylight: {
    short: 'Daylight',
    tip: 'Daylight: the share of daytime hours with enough daylight.',
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M12 3v18M4 12h16" />
      </>
    ),
  },
  wind: {
    short: 'Wind',
    tip: 'Wind speed at pedestrian height, for one wind from the west.',
    icon: <path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8" />,
  },
  'wind-comfort': {
    short: 'Wind comfort',
    tip: 'Wind comfort (Lawson): is it comfortable to sit, stand or walk here?',
    icon: (
      <>
        <circle cx="15" cy="5" r="2" />
        <path d="M15 8v7l-2 6M15 15l2 6M12 11h6M2 9h6M2 13h5M2 17h6" />
      </>
    ),
  },
  'facade-sun': {
    short: 'Facades',
    tip: 'Facade sun hours: direct sun on every building wall (3D).',
    icon: (
      <>
        <path d="M4 21V9l6-3v15M10 21V4l8 3v14M2 21h20" />
        <path d="M13 10h2M13 14h2M6 12h2M6 16h2" />
      </>
    ),
  },
}

interface Props {
  analyses: readonly DemoAnalysis[]
  value: AnalysisId
  onChange: (id: AnalysisId) => void
}

export function AnalysisPicker({ analyses, value, onChange }: Props) {
  return (
    <fieldset className="analysis-grid" aria-label="Analysis" data-testid="analysis">
      {analyses.map((a) => {
        const tile = TILES[a.id]
        const on = a.id === value
        return (
          <label key={a.id} className={on ? 'on' : ''} data-tip={tile?.tip ?? a.label}>
            <input
              type="radio"
              name="analysis"
              value={a.id}
              checked={on}
              aria-label={a.label}
              onChange={() => onChange(a.id)}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {tile?.icon ?? <circle cx="12" cy="12" r="8" />}
            </svg>
            <span>{tile?.short ?? a.label}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
