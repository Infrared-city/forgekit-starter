import { ramp, type Scale } from '../lib/colors'

export function Legend({ scale }: { scale: Scale }) {
  const stops = Array.from({ length: 9 }, (_, i) => {
    const [r, g, b] = ramp(i / 8)
    return `rgb(${r},${g},${b}) ${(i / 8) * 100}%`
  })
  return (
    <div className="legend">
      <div
        className="bar"
        style={{ background: `linear-gradient(to right, ${stops.join(',')})` }}
      />
      <div className="labels">
        <span>{scale.min}</span>
        <span>{scale.unit}</span>
        <span>{scale.max}</span>
      </div>
    </div>
  )
}
