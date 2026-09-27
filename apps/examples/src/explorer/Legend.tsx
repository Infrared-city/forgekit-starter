import { type ColorScale, cssGradient, rampColor } from './colors'

/** Lawson 2001 wind comfort classes, calm to windy. */
export const LAWSON: Record<string, string> = {
  A: 'Sitting',
  B: 'Standing',
  C: 'Strolling',
  D: 'Walking fast',
  E: 'Uncomfortable',
  S: 'Unsafe',
}
const ORDER = Object.keys(LAWSON)

export function classColor(label: string): [number, number, number] {
  return rampColor('wind', Math.max(0, ORDER.indexOf(label)) / (ORDER.length - 1))
}

export function ContinuousLegend({
  scale,
  unit,
  diff,
}: {
  scale: ColorScale
  unit: string
  diff: boolean
}) {
  const fmt = (v: number) => (diff && v > 0 ? `+${v}` : `${v}`)
  return (
    <div className="legend" data-testid="legend">
      <div className="bar" style={{ background: cssGradient(scale.ramp) }} />
      <div className="labels">
        <span>{fmt(scale.min)}</span>
        <span>{diff ? `change, ${unit}` : unit}</span>
        <span>{fmt(scale.max)}</span>
      </div>
      {diff && (
        <div className="labels muted">
          <span>lower in the variant</span>
          <span>no change</span>
          <span>higher</span>
        </div>
      )}
    </div>
  )
}

export function ClassLegend({ labels }: { labels: readonly string[] }) {
  return (
    <div className="class-legend" data-testid="legend">
      {labels.map((l) => {
        const [r, g, b] = classColor(l)
        return (
          <span key={l}>
            <i style={{ background: `rgb(${r},${g},${b})` }} /> {l}: {LAWSON[l] ?? l}
          </span>
        )
      })}
    </div>
  )
}
