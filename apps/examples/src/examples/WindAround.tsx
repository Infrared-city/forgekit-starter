// Example 2 — "Is it windy / comfortable around this building?"
// wind-speed: one wind speed + direction you choose (cheap, 10 AItokens a tile).
// pedestrian-wind-comfort: a wind ROSE from the nearest weather station, rated
// with a comfort criterion (50 AItokens a tile).
import { useState } from 'react'
import { GridExample } from '../components/GridExample'

export function WindAround() {
  const [mode, setMode] = useState<'wind-speed' | 'pedestrian-wind-comfort'>('wind-speed')
  const [speed, setSpeed] = useState(5)
  const [direction, setDirection] = useState(270)

  const comfort = mode === 'pedestrian-wind-comfort'
  return (
    <GridExample
      title="Wind around a building"
      intro={
        <p>
          Wind at 1.5 m above the ground. Direction is where the wind comes FROM (270 = west). Tip:
          use the 256 m area size for one wind tile.
        </p>
      }
      analysisType={mode}
      scale={
        comfort
          ? { min: 0, max: 5, unit: 'comfort class' }
          : { min: 0, max: speed * 1.6, unit: 'm/s' }
      }
      start={{ lat: 48.2102, lon: 16.3625 }}
      controls={
        <div className="controls">
          <label>
            <input type="radio" checked={!comfort} onChange={() => setMode('wind-speed')} /> Wind
            speed
          </label>
          <label>
            <input
              type="radio"
              checked={comfort}
              onChange={() => setMode('pedestrian-wind-comfort')}
            />{' '}
            Comfort (Lawson 2001, weather station)
          </label>
          {!comfort && (
            <label>
              Speed{' '}
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />{' '}
              m/s, from{' '}
              <input
                type="number"
                min={0}
                max={360}
                step={1}
                value={direction}
                onChange={(e) => setDirection(Math.round(Number(e.target.value)))}
              />
              °
            </label>
          )}
        </div>
      }
      prepare={async (client, { center, polygon, say }) => {
        say('Reading buildings...')
        // Wind models use buildings only (no trees, no ground materials).
        const buildings = await client.buildings.getBuildingsInArea(polygon, { analysisType: mode })
        if (!comfort) {
          return {
            input: { analysisType: 'wind-speed', windSpeed: speed, windDirection: direction },
            // Several wind tiles: blend them along the wind direction (no seams).
            options: { buildings, strategy: 'directional_blend', windDirectionDeg: direction },
          }
        }
        say('Reading the nearest weather station...')
        const stations = await client.weather.getWeatherFileFromLocation(center.lat, center.lon)
        if (stations.length === 0) throw new Error('No weather station within 100 km')
        const period = {
          start: { month: 1, day: 1, hour: 0 },
          end: { month: 12, day: 31, hour: 23 },
        }
        const weatherData = await client.weather.filterWeatherData(stations[0].uuid, { period })
        return {
          input: {
            analysisType: 'pedestrian-wind-comfort',
            criteria: 'lawson-2001',
            // The SDK builds the wind rose (windSpeed + windDirection lists) from these rows.
            weatherData,
            dateFilters: { period },
          },
          options: { buildings },
        }
      }}
    />
  )
}
