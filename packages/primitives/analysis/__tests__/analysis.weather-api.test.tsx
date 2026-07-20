import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createWeatherHooks } from '../react/analysis.weather-api'
import { createWrapper } from './test-utils'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockSdkClient = {
  weather: {
    getWeatherFileFromLocation: vi.fn(),
    getWeatherFileFromIdentifier: vi.fn(),
  },
}

const { useWeatherStations, useFullWeatherData } = createWeatherHooks(mockSdkClient)

// ─── Test fixtures ──────────────────────────────────────────────────────────

const mockStations = [
  { uuid: 'station-1', name: 'Barcelona Airport', distance: 5.2 },
  { uuid: 'station-2', name: 'Montjuic', distance: 1.8 },
]

const mockFullWeatherData = {
  uuid: 'station-1',
  fileName: 'barcelona.epw',
  location_data: {
    city: 'Barcelona',
    state: 'Catalonia',
    country: 'Spain',
    latitude: 41.39,
    longitude: 2.17,
    time_zone: 1,
    elevation: 15,
    station_id: 'BCN001',
    source: 'NOAA',
    type: 'TMY3',
  },
  weatherData: { hourly: [] },
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useWeatherStations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call SDK getWeatherFileFromLocation with lat/lng/radius', async () => {
    mockSdkClient.weather.getWeatherFileFromLocation.mockResolvedValue(mockStations)

    const { result } = renderHook(() => useWeatherStations(41.39, 2.17), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSdkClient.weather.getWeatherFileFromLocation).toHaveBeenCalledWith(41.39, 2.17, 1000)
  })

  it('should use custom radius when provided', async () => {
    mockSdkClient.weather.getWeatherFileFromLocation.mockResolvedValue(mockStations)

    const { result } = renderHook(() => useWeatherStations(41.39, 2.17, 500), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSdkClient.weather.getWeatherFileFromLocation).toHaveBeenCalledWith(41.39, 2.17, 500)
  })

  it('should return station data on success', async () => {
    mockSdkClient.weather.getWeatherFileFromLocation.mockResolvedValue(mockStations)

    const { result } = renderHook(() => useWeatherStations(41.39, 2.17), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockStations)
  })

  it('should handle SDK errors', async () => {
    const error = new Error('Weather API unavailable')
    mockSdkClient.weather.getWeatherFileFromLocation.mockRejectedValue(error)

    const { result } = renderHook(() => useWeatherStations(41.39, 2.17), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)
  })

  it('should fetch when latitude is 0 (equator is a valid coordinate)', async () => {
    mockSdkClient.weather.getWeatherFileFromLocation.mockResolvedValue(mockStations)

    renderHook(() => useWeatherStations(0, 2.17), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(mockSdkClient.weather.getWeatherFileFromLocation).toHaveBeenCalled())
    expect(mockSdkClient.weather.getWeatherFileFromLocation).toHaveBeenCalledWith(0, 2.17, 1000)
  })

  it('should fetch when longitude is 0 (prime meridian is a valid coordinate)', async () => {
    mockSdkClient.weather.getWeatherFileFromLocation.mockResolvedValue(mockStations)

    renderHook(() => useWeatherStations(41.39, 0), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(mockSdkClient.weather.getWeatherFileFromLocation).toHaveBeenCalled())
    expect(mockSdkClient.weather.getWeatherFileFromLocation).toHaveBeenCalledWith(41.39, 0, 1000)
  })

  it('should NOT fetch when latitude is NaN', async () => {
    const { result } = renderHook(() => useWeatherStations(Number.NaN, 2.17), {
      wrapper: createWrapper(),
    })

    await new Promise((r) => setTimeout(r, 50))

    expect(result.current.isFetching).toBe(false)
    expect(mockSdkClient.weather.getWeatherFileFromLocation).not.toHaveBeenCalled()
  })

  it('should NOT fetch when longitude is Infinity', async () => {
    const { result } = renderHook(() => useWeatherStations(41.39, Number.POSITIVE_INFINITY), {
      wrapper: createWrapper(),
    })

    await new Promise((r) => setTimeout(r, 50))

    expect(result.current.isFetching).toBe(false)
    expect(mockSdkClient.weather.getWeatherFileFromLocation).not.toHaveBeenCalled()
  })
})

describe('useFullWeatherData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call SDK getWeatherFileFromIdentifier', async () => {
    mockSdkClient.weather.getWeatherFileFromIdentifier.mockResolvedValue(mockFullWeatherData)

    const { result } = renderHook(() => useFullWeatherData('station-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockSdkClient.weather.getWeatherFileFromIdentifier).toHaveBeenCalledWith('station-1')
  })

  it('should return full weather data on success', async () => {
    mockSdkClient.weather.getWeatherFileFromIdentifier.mockResolvedValue(mockFullWeatherData)

    const { result } = renderHook(() => useFullWeatherData('station-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockFullWeatherData)
  })

  it('should NOT fetch when identifier is null', async () => {
    const { result } = renderHook(() => useFullWeatherData(null), {
      wrapper: createWrapper(),
    })

    await new Promise((r) => setTimeout(r, 50))

    expect(result.current.isFetching).toBe(false)
    expect(mockSdkClient.weather.getWeatherFileFromIdentifier).not.toHaveBeenCalled()
  })

  it('should handle SDK errors', async () => {
    const error = new Error('Station data not found')
    mockSdkClient.weather.getWeatherFileFromIdentifier.mockRejectedValue(error)

    const { result } = renderHook(() => useFullWeatherData('station-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 10000 })
    expect(result.current.error).toBe(error)
  })
})
