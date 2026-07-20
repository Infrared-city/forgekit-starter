import type { PwcCriteria, ThermalComfortStatisticsSubType } from '@forge-kit/analysis'
import {
  AnalysesName,
  PWC_CRITERIA_LABELS,
  TCS_SUBTYPE_LABELS,
  useAnalysisStore,
} from '@forge-kit/analysis'
import { Label, Slider } from 'ui'
import { useShallow } from 'zustand/react/shallow'

// ─── Type groupings ─────────────────────────────────────────────────────────

const WIND_TYPES = new Set<string>([AnalysesName.WindSpeed])
const NO_CONFIG_TYPES = new Set<string>([AnalysesName.SkyViewFactors])
const DATE_TYPES = new Set<string>([
  AnalysesName.DirectSunHours,
  AnalysesName.DaylightAvailability,
  AnalysesName.SolarRadiation,
  AnalysesName.ThermalComfortIndex,
  AnalysesName.ThermalComfortStatistics,
  AnalysesName.PedestrianWindComfort,
])

// ─── Shared select component ────────────────────────────────────────────────

function InlineSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs text-muted-foreground shrink-0">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Month names for the period picker ──────────────────────────────────────

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))

// ─── Wind config ────────────────────────────────────────────────────────────

function WindConfig() {
  const { windSpeed, windDirection, setWindSpeed, setWindDirection } = useAnalysisStore(
    useShallow((s) => ({
      windSpeed: s.windSpeed,
      windDirection: s.windDirection,
      setWindSpeed: s.setWindSpeed,
      setWindDirection: s.setWindDirection,
    })),
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Wind speed</Label>
          <span className="text-xs font-medium tabular-nums">{windSpeed} m/s</span>
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[windSpeed]}
          onValueChange={([v]) => setWindSpeed(v)}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Wind direction</Label>
          <span className="text-xs font-medium tabular-nums">{windDirection}°</span>
        </div>
        <Slider
          min={0}
          max={360}
          step={1}
          value={[windDirection]}
          onValueChange={([v]) => setWindDirection(v)}
        />
      </div>
    </div>
  )
}

// ─── Date / time period picker ──────────────────────────────────────────────

function stamp(
  label: string,
  value: number,
  options: ReadonlyArray<{ value: string; label: string }>,
  onChange: (v: number) => void,
) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground w-8 shrink-0">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 rounded border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, '0')}:00`,
}))

function DateFiltersConfig() {
  const { dateFilters, setDateFilters } = useAnalysisStore(
    useShallow((s) => ({
      dateFilters: s.dateFilters,
      setDateFilters: s.setDateFilters,
    })),
  )

  const update = (path: 'start' | 'end', field: 'month' | 'day' | 'hour', value: number) => {
    setDateFilters({
      period: {
        ...dateFilters.period,
        [path]: { ...dateFilters.period[path], [field]: value },
      },
    })
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Time period</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1 rounded-md border border-border p-2">
          <p className="text-[10px] font-medium uppercase text-muted-foreground">Start</p>
          {stamp('Mon', dateFilters.period.start.month, MONTH_OPTIONS, (v) =>
            update('start', 'month', v),
          )}
          {stamp('Day', dateFilters.period.start.day, DAY_OPTIONS, (v) =>
            update('start', 'day', v),
          )}
          {stamp('Hour', dateFilters.period.start.hour, HOUR_OPTIONS, (v) =>
            update('start', 'hour', v),
          )}
        </div>
        <div className="space-y-1 rounded-md border border-border p-2">
          <p className="text-[10px] font-medium uppercase text-muted-foreground">End</p>
          {stamp('Mon', dateFilters.period.end.month, MONTH_OPTIONS, (v) =>
            update('end', 'month', v),
          )}
          {stamp('Day', dateFilters.period.end.day, DAY_OPTIONS, (v) => update('end', 'day', v))}
          {stamp('Hour', dateFilters.period.end.hour, HOUR_OPTIONS, (v) =>
            update('end', 'hour', v),
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TCS subtype selector ───────────────────────────────────────────────────

const TCS_OPTIONS = Object.entries(TCS_SUBTYPE_LABELS).map(([value, label]) => ({
  value: value as ThermalComfortStatisticsSubType,
  label,
}))

function TcsConfig() {
  const { tcsSubtype, setTcsSubtype } = useAnalysisStore(
    useShallow((s) => ({ tcsSubtype: s.tcsSubtype, setTcsSubtype: s.setTcsSubtype })),
  )
  return (
    <InlineSelect
      label="Subtype"
      value={tcsSubtype as ThermalComfortStatisticsSubType}
      options={TCS_OPTIONS}
      onChange={setTcsSubtype}
    />
  )
}

// ─── PWC criteria selector ──────────────────────────────────────────────────

const PWC_OPTIONS = Object.entries(PWC_CRITERIA_LABELS).map(([value, label]) => ({
  value: value as PwcCriteria,
  label,
}))

function PwcConfig() {
  const { pwcCriteria, setPwcCriteria } = useAnalysisStore(
    useShallow((s) => ({ pwcCriteria: s.pwcCriteria, setPwcCriteria: s.setPwcCriteria })),
  )
  return (
    <InlineSelect
      label="Criteria"
      value={pwcCriteria as PwcCriteria}
      options={PWC_OPTIONS}
      onChange={setPwcCriteria}
    />
  )
}

// ─── Composite config panel ─────────────────────────────────────────────────

interface AnalysisConfigInputsProps {
  analysisType: AnalysesName
}

/**
 * Renders per-type configuration inputs based on the selected analysis type.
 *
 * - Wind Speed: wind speed + direction sliders
 * - SVF: nothing (geometry only)
 * - Solar (DSH, DA): time period picker
 * - Solar Radiation, UTCI: time period picker (weather auto-fetched by server)
 * - TCS: subtype dropdown + time period picker
 * - PWC: criteria dropdown + time period picker
 */
export function AnalysisConfigInputs({ analysisType }: AnalysisConfigInputsProps) {
  if (NO_CONFIG_TYPES.has(analysisType)) {
    return null
  }

  if (WIND_TYPES.has(analysisType)) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground">Wind parameters</p>
        <WindConfig />
      </div>
    )
  }

  if (DATE_TYPES.has(analysisType)) {
    const showTcs = analysisType === AnalysesName.ThermalComfortStatistics
    const showPwc = analysisType === AnalysesName.PedestrianWindComfort
    return (
      <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
        {showTcs && <TcsConfig />}
        {showPwc && <PwcConfig />}
        <DateFiltersConfig />
      </div>
    )
  }

  return null
}
