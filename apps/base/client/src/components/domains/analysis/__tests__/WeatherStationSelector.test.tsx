import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WeatherStationSelector } from '../WeatherStationSelector'

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockSetSelectedStationId = vi.fn()
const mockSelectedStationId = { current: null as string | null }

vi.mock('@forge-kit/analysis', () => ({
  useAnalysisStore: Object.assign(
    (selector: (state: any) => any) => {
      const state = {
        selectedStationId: mockSelectedStationId.current,
        setSelectedStationId: mockSetSelectedStationId,
      }
      return selector(state)
    },
    {
      getState: () => ({
        selectedStationId: mockSelectedStationId.current,
        setSelectedStationId: mockSetSelectedStationId,
      }),
    },
  ),
}))

// ─── Configurable mock hook return values ─────────────────────────────────────

const mockStationsReturn = {
  current: {
    data: [
      {
        uuid: 'station-1',
        fileName: 'london.epw',
        location_data: { city: 'London' },
        distance_km: 5.2,
      },
      {
        uuid: 'station-2',
        fileName: 'paris.epw',
        location_data: { city: 'Paris' },
        distance_km: 12.8,
      },
    ] as any[],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}

const mockFullWeatherReturn = {
  current: {
    data: null as any,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}

// ─── Test fixtures ─────────────────────────────────────────────────────────────

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

/**
 * The WeatherStationSelector now receives hooks as props (DI pattern).
 * We pass mock hooks that return the configurable mock values.
 */
function renderSelector(
  props?: Partial<{ latitude: number; longitude: number }>,
  queryClient?: QueryClient,
) {
  const qc = queryClient ?? createQueryClient()

  const defaultProps = {
    latitude: 51.5,
    longitude: -0.1,
    useWeatherStations: () => mockStationsReturn.current,
    useFullWeatherData: () => mockFullWeatherReturn.current,
    ...props,
  }

  return {
    ...render(
      <QueryClientProvider client={qc}>
        <WeatherStationSelector {...defaultProps} />
      </QueryClientProvider>,
    ),
    queryClient: qc,
  }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('WeatherStationSelector', () => {
  beforeEach(() => {
    mockSelectedStationId.current = null
    mockSetSelectedStationId.mockClear()
    mockStationsReturn.current = {
      data: [
        {
          uuid: 'station-1',
          fileName: 'london.epw',
          location_data: { city: 'London' },
          distance_km: 5.2,
        },
        {
          uuid: 'station-2',
          fileName: 'paris.epw',
          location_data: { city: 'Paris' },
          distance_km: 12.8,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
    mockFullWeatherReturn.current = {
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
  })

  describe('rendering', () => {
    it('renders the header with Weather Station label', () => {
      renderSelector()
      expect(screen.getByText('Weather Station')).toBeInTheDocument()
    })

    it('renders the select label', () => {
      renderSelector()
      expect(screen.getByText('Select Station')).toBeInTheDocument()
    })

    it('renders station options when data is loaded', () => {
      renderSelector()
      expect(screen.getByText(/London/)).toBeInTheDocument()
      expect(screen.getByText(/Paris/)).toBeInTheDocument()
    })

    it('renders distance in station options', () => {
      renderSelector()
      expect(screen.getByText('London (5.2 km)')).toBeInTheDocument()
      expect(screen.getByText('Paris (12.8 km)')).toBeInTheDocument()
    })

    it('renders the default placeholder option', () => {
      renderSelector()
      expect(screen.getByText('-- Select a weather station --')).toBeInTheDocument()
    })
  })

  describe('selection', () => {
    it('calls setSelectedStationId when a station is selected', () => {
      renderSelector()
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'station-1' } })
      expect(mockSetSelectedStationId).toHaveBeenCalledWith('station-1')
    })

    it('calls setSelectedStationId with null when placeholder is selected', () => {
      mockSelectedStationId.current = 'station-1'
      renderSelector()
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: '' } })
      expect(mockSetSelectedStationId).toHaveBeenCalledWith(null)
    })
  })

  describe('loading state', () => {
    it('disables the select when stations are loading', () => {
      mockStationsReturn.current = {
        data: undefined as any,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      }

      renderSelector()
      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('shows error message when stations fail to load', () => {
      mockStationsReturn.current = {
        data: undefined as any,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      }

      renderSelector()
      expect(screen.getByText('Failed to load weather stations')).toBeInTheDocument()
    })

    it('shows retry button on error', () => {
      const mockRefetch = vi.fn()
      mockStationsReturn.current = {
        data: undefined as any,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      }

      renderSelector()
      const retryBtn = screen.getByText('Retry')
      fireEvent.click(retryBtn)
      expect(mockRefetch).toHaveBeenCalled()
    })

    it('does not show the select dropdown when stations error', () => {
      mockStationsReturn.current = {
        data: undefined as any,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      }

      renderSelector()
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })
  })

  describe('empty station list', () => {
    it('renders only the placeholder when station list is empty', () => {
      mockStationsReturn.current = {
        data: [],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }

      renderSelector()
      const select = screen.getByRole('combobox')
      // Only the placeholder option should exist
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(1)
      expect(options[0].textContent).toBe('-- Select a weather station --')
    })
  })

  describe('selected station status', () => {
    it('shows loading indicator when weather data is loading', () => {
      mockSelectedStationId.current = 'station-1'
      mockFullWeatherReturn.current = {
        data: null,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      }

      renderSelector()
      expect(screen.getByText('Loading weather data...')).toBeInTheDocument()
    })

    it('shows weather data when loaded successfully', () => {
      mockSelectedStationId.current = 'station-1'
      mockFullWeatherReturn.current = {
        data: {
          uuid: 'station-1',
          fileName: 'london.epw',
          location_data: {
            city: 'London',
            state: 'England',
            country: 'UK',
            elevation: 11,
            latitude: 51.5,
            longitude: -0.1,
            time_zone: 0,
            station_id: 'stn-1',
            source: 'test',
            type: 'test',
          },
          weatherData: {},
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }

      renderSelector()
      expect(screen.getByText('London')).toBeInTheDocument()
      expect(screen.getByText(/England, UK/)).toBeInTheDocument()
    })

    it('shows error state when weather data fails', () => {
      mockSelectedStationId.current = 'station-1'
      mockFullWeatherReturn.current = {
        data: null,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      }

      renderSelector()
      expect(screen.getByText('Failed to load weather data')).toBeInTheDocument()
    })

    it('does not show status card when no station is selected', () => {
      mockSelectedStationId.current = null

      renderSelector()
      expect(screen.queryByText('Loading weather data...')).not.toBeInTheDocument()
      expect(screen.queryByText('Failed to load weather data')).not.toBeInTheDocument()
    })
  })

  describe('station without uuid uses fileName', () => {
    it('uses fileName as value when uuid is missing', () => {
      mockStationsReturn.current = {
        data: [
          {
            fileName: 'custom-station.epw',
            location_data: null,
            distance_km: null,
          },
        ],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }

      renderSelector()
      expect(screen.getByText('custom-station.epw')).toBeInTheDocument()
    })
  })
})
