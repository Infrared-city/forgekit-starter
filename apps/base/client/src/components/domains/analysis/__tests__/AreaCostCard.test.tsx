import type { AreaPreviewQueryResult } from '@forge-kit/analysis'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AreaCostCard,
  formatEstimatedCost,
  formatEstimatedTime,
  formatTileCount,
} from '../AreaCostCard'

function makeQuery(overrides: Partial<AreaPreviewQueryResult> = {}): AreaPreviewQueryResult {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('format helpers', () => {
  describe('formatTileCount', () => {
    it('singular for 1', () => {
      expect(formatTileCount(1)).toBe('1 tile')
    })
    it('plural for 0 and N>1', () => {
      expect(formatTileCount(0)).toBe('0 tiles')
      expect(formatTileCount(12)).toBe('12 tiles')
    })
  })

  describe('formatEstimatedTime', () => {
    it('seconds branch', () => {
      expect(formatEstimatedTime(45)).toBe('~45 s')
      expect(formatEstimatedTime(59.4)).toBe('~59 s')
    })
    it('minutes branch', () => {
      expect(formatEstimatedTime(120)).toBe('~2 min')
      expect(formatEstimatedTime(90)).toBe('~2 min') // 1.5 → round → 2
    })
    it('hours branch', () => {
      expect(formatEstimatedTime(3600)).toBe('~1 h')
      expect(formatEstimatedTime(7200)).toBe('~2 h')
    })
  })

  describe('formatEstimatedCost', () => {
    it('adds thousands separators', () => {
      expect(formatEstimatedCost(1200)).toBe('~1,200 tokens')
      expect(formatEstimatedCost(1234567)).toBe('~1,234,567 tokens')
      expect(formatEstimatedCost(0)).toBe('~0 tokens')
    })
  })
})

describe('AreaCostCard', () => {
  it('renders skeletons and a disabled run button when pending', () => {
    render(<AreaCostCard query={makeQuery({ isPending: true })} onRun={vi.fn()} />)
    const runButton = screen.getByRole('button', { name: 'Run analysis' })
    expect(runButton).toBeDisabled()
    // Skeletons are marked aria-hidden but we can find their wrapper via the
    // accessible label.
    expect(screen.getByLabelText(/Loading area preview/i)).toBeInTheDocument()
  })

  it('shows the error message and a Retry button when isError', () => {
    const refetch = vi.fn()
    render(
      <AreaCostCard
        query={makeQuery({ isError: true, error: new Error('bad polygon'), refetch })}
        onRun={vi.fn()}
      />,
    )
    expect(screen.getByText('bad polygon')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledTimes(1)
    // Run button in error state is disabled.
    expect(screen.getByRole('button', { name: 'Run analysis' })).toBeDisabled()
  })

  it('renders the three stats and an enabled run button when data has tiles', () => {
    const onRun = vi.fn()
    render(
      <AreaCostCard
        query={makeQuery({
          data: { tileCount: 12, estimatedTimeS: 120, estimatedCostTokens: 1200 },
        })}
        onRun={onRun}
      />,
    )
    expect(screen.getByText('12 tiles')).toBeInTheDocument()
    expect(screen.getByText('~2 min')).toBeInTheDocument()
    expect(screen.getByText('~1,200 tokens')).toBeInTheDocument()

    const runButton = screen.getByRole('button', { name: 'Run analysis' })
    expect(runButton).toBeEnabled()
    fireEvent.click(runButton)
    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('shows the singular tile label when tileCount is 1', () => {
    render(
      <AreaCostCard
        query={makeQuery({
          data: { tileCount: 1, estimatedTimeS: 30, estimatedCostTokens: 100 },
        })}
        onRun={vi.fn()}
      />,
    )
    expect(screen.getByText('1 tile')).toBeInTheDocument()
    expect(screen.getByText('~30 s')).toBeInTheDocument()
  })

  it('shows the outside-tileable-area message when tileCount is 0', () => {
    render(
      <AreaCostCard
        query={makeQuery({
          data: { tileCount: 0, estimatedTimeS: 0, estimatedCostTokens: 0 },
        })}
        onRun={vi.fn()}
      />,
    )
    expect(screen.getByText(/outside the tileable area/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Run analysis' })).toBeDisabled()
  })

  it('shows the over-budget badge when estimatedTimeS exceeds the threshold', () => {
    render(
      <AreaCostCard
        query={makeQuery({
          data: { tileCount: 80, estimatedTimeS: 800, estimatedCostTokens: 8000 },
        })}
        onRun={vi.fn()}
      />,
    )
    expect(screen.getByText(/May exceed server timeout/i)).toBeInTheDocument()
    // Run is NOT blocked — warning is advisory only.
    expect(screen.getByRole('button', { name: 'Run analysis' })).toBeEnabled()
  })

  it('does NOT show the over-budget badge when exactly at the threshold', () => {
    // Threshold is > 720, so 720 itself must NOT trigger the warning.
    render(
      <AreaCostCard
        query={makeQuery({
          data: { tileCount: 20, estimatedTimeS: 720, estimatedCostTokens: 2000 },
        })}
        onRun={vi.fn()}
      />,
    )
    expect(screen.queryByText(/May exceed server timeout/i)).toBeNull()
  })
})
