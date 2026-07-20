import { Group } from '@visx/group'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Bar } from '@visx/shape'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Named color map for binned distribution charts. */
const defaultValueFormatter = (v: number) => String(v)

export const BAR_CHART_COLORS = {
  blue: '#3b82f6',
  'light-blue': '#60a5fa',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
} as const

export type BarChartColor = keyof typeof BAR_CHART_COLORS

export interface BarChartDatum {
  label: string
  value: number
  color?: string
}

export interface BarChartProps {
  /** Data to render as horizontal bars. */
  data: BarChartDatum[]
  /** Chart width in pixels. If not provided, fills container width via ResizeObserver. */
  width?: number
  /** Height of each bar in pixels. */
  barHeight?: number
  /** Whether to show labels on the left side of bars. */
  showLabels?: boolean
  /** Whether to show values on/after bars. */
  showValues?: boolean
  /** Optional formatter for displayed values. */
  valueFormatter?: (value: number) => string
  /** Additional CSS class name for the container. */
  className?: string
}

const DEFAULT_BAR_HEIGHT = 20
const LABEL_WIDTH_RATIO = 0.35
const VALUE_WIDTH = 50
const VERTICAL_PADDING = 4
const DEFAULT_WIDTH = 300

function useContainerWidth(fixedWidth: number | undefined) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [measuredWidth, setMeasuredWidth] = useState<number>(DEFAULT_WIDTH)

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (entry) {
      const width = Math.round(entry.contentRect.width)
      if (width > 0) {
        setMeasuredWidth(width)
      }
    }
  }, [])

  useEffect(() => {
    if (fixedWidth != null) return

    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [fixedWidth, handleResize])

  return { containerRef, chartWidth: fixedWidth ?? measuredWidth }
}

export function BarChart({
  data,
  width: fixedWidth,
  barHeight = DEFAULT_BAR_HEIGHT,
  showLabels = true,
  showValues = true,
  valueFormatter = defaultValueFormatter,
  className,
}: BarChartProps) {
  const { containerRef, chartWidth } = useContainerWidth(fixedWidth)

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 0), [data])

  const labelWidth = showLabels ? Math.round(chartWidth * LABEL_WIDTH_RATIO) : 0
  const valueWidth = showValues ? VALUE_WIDTH : 0
  const barAreaWidth = Math.max(chartWidth - labelWidth - valueWidth, 0)

  const totalHeight = data.length * (barHeight + VERTICAL_PADDING) + VERTICAL_PADDING

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: data.map((d) => d.label),
        range: [VERTICAL_PADDING, totalHeight - VERTICAL_PADDING],
        padding: 0.2,
      }),
    [data, totalHeight],
  )

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxValue || 1],
        range: [0, barAreaWidth],
      }),
    [maxValue, barAreaWidth],
  )

  if (data.length === 0) return null

  return (
    <div ref={containerRef} className={className} style={{ width: fixedWidth ?? '100%' }}>
      <svg width={chartWidth} height={totalHeight} role="img" aria-label="Bar chart">
        <Group>
          {data.map((d) => {
            const barWidth = xScale(d.value)
            const barY = yScale(d.label) ?? 0
            const bandHeight = yScale.bandwidth()
            const fillColor = d.color
              ? (BAR_CHART_COLORS[d.color as BarChartColor] ?? d.color)
              : 'var(--color-primary, #3b82f6)'

            return (
              <Group key={d.label}>
                {showLabels && (
                  <text
                    x={labelWidth - 8}
                    y={barY + bandHeight / 2}
                    textAnchor="end"
                    dominantBaseline="central"
                    className="fill-foreground"
                    fontSize={12}
                  >
                    {d.label}
                  </text>
                )}
                <Bar
                  x={labelWidth}
                  y={barY}
                  width={Math.max(barWidth, 0)}
                  height={bandHeight}
                  fill={fillColor}
                  rx={3}
                />
                {showValues && (
                  <text
                    x={labelWidth + Math.max(barWidth, 0) + 6}
                    y={barY + bandHeight / 2}
                    textAnchor="start"
                    dominantBaseline="central"
                    className="fill-foreground"
                    fontSize={12}
                  >
                    {valueFormatter(d.value)}
                  </text>
                )}
              </Group>
            )
          })}
        </Group>
      </svg>
    </div>
  )
}
