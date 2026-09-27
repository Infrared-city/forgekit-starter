import { useState } from 'react'
import { geocode, type LatLon } from '../lib/geo'

/** Type an address, or click the map. */
export function PlacePicker({
  onPlace,
  disabled,
}: {
  onPlace: (p: LatLon) => void
  disabled?: boolean
}) {
  const [text, setText] = useState('')
  const [note, setNote] = useState('Or click the map.')

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const hit = await geocode(text)
      onPlace(hit)
      setNote(hit.label)
    } catch (err) {
      setNote(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <form className="picker" onSubmit={search}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Address, e.g. Stephansplatz, Vienna"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>
        Go
      </button>
      <small>{note}</small>
    </form>
  )
}
