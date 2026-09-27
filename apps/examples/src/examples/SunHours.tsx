// Example 1 — "How many hours of direct sun does my street get?"
// Analysis: direct-sun-hours. No weather file. It needs a time window.
import { useState } from 'react'
import { GridExample } from '../components/GridExample'

export function SunHours() {
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(21)
  // Keep the window between sunrise and sunset: night hours count as sun.
  const startHour = 8
  const endHour = 18

  return (
    <GridExample
      title="Sun hours at my address"
      intro={
        <p>
          Hours of direct sun on the ground on one day, {startHour}:00 to {endHour}:00. Uses
          buildings and trees from open data.
        </p>
      }
      analysisType="direct-sun-hours"
      scale={{ min: 0, max: endHour - startHour + 1, unit: 'hours' }}
      start={{ lat: 48.2082, lon: 16.3738 }}
      controls={
        <label>
          Day{' '}
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          {' / '}
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          />
          <small> (month / day)</small>
        </label>
      }
      prepare={async (client, { center, polygon, say }) => {
        say('Reading buildings and trees...')
        const buildings = await client.buildings.getBuildingsInArea(polygon)
        const vegetation = await client.vegetation.getArea(polygon)
        return {
          input: {
            analysisType: 'direct-sun-hours',
            latitude: center.lat,
            longitude: center.lon,
            // The time window. `dateFilters` is turned into `timePeriod` for you.
            dateFilters: {
              period: {
                start: { month, day, hour: startHour },
                end: { month, day, hour: endHour },
              },
            },
          },
          // Pass the whole objects, not only `.buildings`: the SDK checks
          // that they were read with a wide enough margin.
          options: { buildings, vegetation },
        }
      }}
    />
  )
}
