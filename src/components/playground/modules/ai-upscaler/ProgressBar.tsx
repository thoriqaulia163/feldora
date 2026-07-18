interface ProgressBarProps {
  readonly current: number
  readonly total: number
  readonly label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
          {label ?? 'Processing'}
        </span>
        <span className="text-feldora-text-secondary font-mono text-[10px]">
          {current}/{total} — {pct}%
        </span>
      </div>
      <div className="w-full h-1 bg-feldora-border/40 overflow-hidden">
        <div
          className="h-full bg-feldora-accent transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
