import type { UpscalerParams, UpscaleFactor, OutputFormat, UpscaleAlgorithm } from './types'
import { ALGORITHM_NEEDS_WEBGPU } from './types'
import { PLAYGROUND_COPY } from '~/constants/copy/playground'

const C = PLAYGROUND_COPY.quickUpscaler

interface ControlPanelProps {
  readonly params: UpscalerParams
  readonly webGPUAvailable: boolean
  readonly onChange: (updates: Partial<UpscalerParams>) => void
  readonly disabled: boolean
}

// ── Sub-components ─────────────────────────────────────────────────────

function ToggleGroup<T extends string>({
  options, value, onChange, disabled, colorMap,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  disabled: boolean
  colorMap?: Partial<Record<T, string>>
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const isActive = opt.value === value
        const active = colorMap?.[opt.value] ?? 'border-feldora-accent text-feldora-accent bg-feldora-accent/10'
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
              disabled
                ? 'opacity-40 cursor-not-allowed border-feldora-border/30 text-feldora-muted'
                : isActive
                  ? active
                  : 'border-feldora-border/50 text-feldora-muted hover:text-feldora-text-secondary hover:border-feldora-border'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function AlgorithmSelector({
  value, onChange, webGPUAvailable, disabled,
}: {
  value: UpscaleAlgorithm
  onChange: (v: UpscaleAlgorithm) => void
  webGPUAvailable: boolean
  disabled: boolean
}) {
  const options = (Object.keys(C.algorithms) as UpscaleAlgorithm[]).map((key) => ({
    value: key,
    label: C.algorithms[key].label,
    desc:  C.algorithms[key].desc,
  }))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const needsGPU    = ALGORITHM_NEEDS_WEBGPU[opt.value]
          const unavailable = needsGPU && !webGPUAvailable
          const isActive    = opt.value === value
          const isDisabled  = disabled || unavailable

          return (
            <button
              key={opt.value}
              type="button"
              disabled={isDisabled}
              title={unavailable ? C.webGPURequiredTooltip : opt.desc}
              onClick={() => !isDisabled && onChange(opt.value)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
                isDisabled
                  ? 'opacity-35 cursor-not-allowed border-feldora-border/30 text-feldora-muted'
                  : isActive
                    ? 'border-feldora-accent text-feldora-accent bg-feldora-accent/10'
                    : 'border-feldora-border/50 text-feldora-muted hover:text-feldora-text-secondary hover:border-feldora-border'
              }`}
            >
              {opt.label}
              {needsGPU && (
                <span className={`ml-1.5 text-[8px] ${unavailable ? 'text-feldora-muted/50' : isActive ? 'text-feldora-accent/70' : 'text-feldora-muted/70'}`}>
                  GPU
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!webGPUAvailable && (
        <p className="text-amber-400/80 font-mono text-[9px] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-400/80 rotate-45 inline-block flex-shrink-0" />
          {C.webGPUDisabledNote}
        </p>
      )}
    </div>
  )
}

function RangeSlider({
  label, value, min, max, step, displayValue, onChange, disabled,
}: {
  label: string; value: number; min: number; max: number; step: number
  displayValue: string; onChange: (v: number) => void; disabled: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">{label}</span>
        <span className="text-feldora-text-secondary font-mono text-[10px]">{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-feldora-border/40 appearance-none cursor-pointer accent-feldora-accent disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  )
}

// ── Control Panel ──────────────────────────────────────────────────────

export function ControlPanel({ params, webGPUAvailable, onChange, disabled }: ControlPanelProps) {
  const scaleOptions = [
    { value: '2', label: C.scale2x },
    { value: '4', label: C.scale4x },
  ]
  const rcasOptions = [
    { value: 'on',  label: C.rcasOn },
    { value: 'off', label: C.rcasOff },
  ]
  const formatOptions: { value: OutputFormat; label: string }[] = [
    { value: 'png',  label: C.formatPng },
    { value: 'jpeg', label: C.formatJpeg },
  ]

  const rcasAvailable = params.algorithm !== 'bicubic'

  return (
    <div className="space-y-5">

      {/* WebGPU status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${webGPUAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-feldora-muted">
          {webGPUAvailable ? C.webGPUAvailable : C.webGPUUnavailable}
        </span>
      </div>

      {/* Algorithm */}
      <div className="space-y-2">
        <span className="block text-feldora-muted font-mono text-[10px] uppercase tracking-wider">{C.algorithmLabel}</span>
        <AlgorithmSelector
          value={params.algorithm}
          onChange={(v) => onChange({ algorithm: v })}
          webGPUAvailable={webGPUAvailable}
          disabled={disabled}
        />
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <span className="block text-feldora-muted font-mono text-[10px] uppercase tracking-wider">{C.scaleLabel}</span>
        <ToggleGroup
          options={scaleOptions}
          value={String(params.scale)}
          onChange={(v) => onChange({ scale: Number(v) as UpscaleFactor })}
          disabled={disabled}
        />
      </div>

      {/* RCAS — only for GPU algorithms */}
      <div className="space-y-2">
        <span className={`block font-mono text-[10px] uppercase tracking-wider ${rcasAvailable ? 'text-feldora-muted' : 'text-feldora-muted/40'}`}>
          {C.sharpeningLabel}
        </span>
        <ToggleGroup
          options={rcasOptions}
          value={params.rcasEnabled ? 'on' : 'off'}
          onChange={(v) => onChange({ rcasEnabled: v === 'on' })}
          disabled={disabled || !rcasAvailable}
        />
        {params.rcasEnabled && rcasAvailable && (
          <RangeSlider
            label={C.strengthLabel}
            value={params.rcasStrength}
            min={0} max={1} step={0.05}
            displayValue={`${Math.round((1 - params.rcasStrength) * 100)}%`}
            onChange={(v) => onChange({ rcasStrength: v })}
            disabled={disabled}
          />
        )}
        {!rcasAvailable && (
          <p className="text-feldora-muted/50 font-mono text-[9px]">{C.rcasNotAvailable}</p>
        )}
      </div>

      {/* Output format */}
      <div className="space-y-2">
        <span className="block text-feldora-muted font-mono text-[10px] uppercase tracking-wider">{C.formatLabel}</span>
        <ToggleGroup
          options={formatOptions}
          value={params.outputFormat}
          onChange={(v) => onChange({ outputFormat: v as OutputFormat })}
          disabled={disabled}
        />
        {params.outputFormat === 'jpeg' && (
          <RangeSlider
            label={C.qualityLabel}
            value={params.jpegQuality}
            min={50} max={95} step={1}
            displayValue={`${params.jpegQuality}`}
            onChange={(v) => onChange({ jpegQuality: v })}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  )
}
