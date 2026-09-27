// Example 3 — "Where is it too hot on a summer afternoon?"
// Analysis: thermal-comfort-index (UTCI, °C "feels like").
// Needs: weather rows + a time window, buildings, trees, ground materials.
import { useState } from 'react'
import { GridExample } from '../components/GridExample'

export function HeatMap() {
  const [month, setMonth] = useState(7)

  return (
    <GridExample
      title="UTCI heat map"
      intro={
        <p>
          Outdoor thermal comfort (UTCI, °C) for afternoons 13:00 to 16:00 in one month, with
          weather from the nearest station. Above 32 °C is strong heat stress.
        </p>
      }
      analysisType="thermal-comfort-index"
      scale={{ min: 20, max: 46, unit: '°C UTCI' }}
      start={{ lat: 48.1986, lon: 16.3417 }}
      controls={
        <label>
          Month{' '}
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </label>
      }
      prepare={async (client, { center, polygon, say }) => {
        const period = {
          start: { month, day: 1, hour: 13 },
          end: { month, day: 28, hour: 16 },
        }
        say('Reading the nearest weather station...')
        const stations = await client.weather.getWeatherFileFromLocation(center.lat, center.lon)
        if (stations.length === 0) throw new Error('No weather station within 100 km')
        const weatherData = await client.weather.filterWeatherData(stations[0].uuid, { period })
        say('Reading buildings, trees and ground materials (the slowest step)...')
        const [buildings, vegetation, groundMaterials] = await Promise.all([
          client.buildings.getBuildingsInArea(polygon),
          client.vegetation.getArea(polygon),
          client.groundMaterials.getArea(polygon),
        ])
        return {
          input: {
            analysisType: 'thermal-comfort-index',
            latitude: center.lat,
            longitude: center.lon,
            weatherData,
            dateFilters: { period },
          },
          options: { buildings, vegetation, groundMaterials },
        }
      }}
    />
  )
}
