import { useAnalysisStore } from '@forge-kit/analysis'
import { Check, Cloud, Loader2, RefreshCw } from 'lucide-react'
import { Button, cn, InlineError } from 'ui'
import { useShallow } from 'zustand/react/shallow'

interface WeatherStationSelectorProps {
  latitude: number
  longitude: number
  /** Injected hook to fetch weather stations */
  useWeatherStations: (
    lat: number,
    lng: number,
  ) => {
    data: any[] | undefined
    isLoading: boolean
    isError: boolean
    refetch: () => void
  }
  /** Injected hook to fetch full weather data (optional) */
  useFullWeatherData?: (identifier: string | null) => {
    data: any | undefined
    isLoading: boolean
    isError: boolean
    refetch: () => void
  }
}

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'
const selectClass =
  'w-full px-3 py-2.5 pr-8 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer'

/** No-op fallback when useFullWeatherData is not provided */
const NULL_WEATHER_RESULT = { data: undefined, isLoading: false, isError: false, refetch: () => {} }
function useNullWeatherData(_identifier: string | null) {
  return NULL_WEATHER_RESULT
}

export function WeatherStationSelector({
  latitude,
  longitude,
  useWeatherStations,
  useFullWeatherData: useFullWeatherDataProp,
}: WeatherStationSelectorProps) {
  'use no memo' // Opts out of React Compiler -- calls injected hook functions (useWeatherStations, useFullWeatherData)
  const { selectedStationId, setSelectedStationId } = useAnalysisStore(
    useShallow((s) => ({
      selectedStationId: s.selectedStationId,
      setSelectedStationId: s.setSelectedStationId,
    })),
  )

  const {
    data: stations,
    isLoading: stationsLoading,
    isError: stationsError,
    refetch: refetchStations,
  } = useWeatherStations(latitude, longitude)

  const useFullWeatherDataHook = useFullWeatherDataProp ?? useNullWeatherData

  const {
    data: fullWeatherData,
    isLoading: weatherLoading,
    isError: weatherError,
    refetch: refetchWeather,
  } = useFullWeatherDataHook(selectedStationId)

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedStationId(value || null)
  }

  if (stationsError) {
    return (
      <InlineError message="Failed to load weather stations" onRetry={() => refetchStations()} />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-card-foreground">Weather Station</span>
      </div>

      {/* Select dropdown */}
      <div className="relative">
        <label className={labelClass}>Select Station</label>
        <select
          value={selectedStationId || ''}
          onChange={handleStationChange}
          disabled={stationsLoading}
          className={cn(selectClass, stationsLoading && 'opacity-60')}
        >
          <option value="">-- Select a weather station --</option>
          {stations?.map((station: any) => (
            <option key={station.uuid || station.fileName} value={station.uuid || station.fileName}>
              {station.location_data?.city || station.fileName}
              {station.distance_km && ` (${station.distance_km.toFixed(1)} km)`}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 bottom-3 h-4 w-4 text-muted-foreground pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

        {stationsLoading && (
          <div className="absolute right-10 bottom-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Selected station status card — only when useFullWeatherData is provided */}
      {selectedStationId && useFullWeatherDataProp && (
        <div
          className={cn(
            'p-3 rounded-lg border text-sm transition-all duration-200',
            weatherError
              ? 'bg-destructive/10 border-destructive/30'
              : weatherLoading
                ? 'bg-muted/50 border-border'
                : 'bg-primary/5 border-primary/20',
          )}
        >
          {weatherError ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-destructive text-xs">Failed to load weather data</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchWeather()}
                className="h-7 px-2 shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : weatherLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              <span className="text-xs">Loading weather data...</span>
            </div>
          ) : fullWeatherData ? (
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground text-sm truncate">
                  {fullWeatherData.location_data?.city || fullWeatherData.fileName}
                </div>
                {fullWeatherData.location_data && (
                  <div className="text-xs text-muted-foreground truncate">
                    {fullWeatherData.location_data.state &&
                      `${fullWeatherData.location_data.state}, `}
                    {fullWeatherData.location_data.country}
                    {fullWeatherData.location_data.elevation &&
                      ` · ${fullWeatherData.location_data.elevation}m`}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
