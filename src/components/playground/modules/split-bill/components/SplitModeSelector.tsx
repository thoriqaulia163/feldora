/**
 * SplitModeSelector — Tab selector for Equal / Custom / Itemized
 */

import type { SplitMode } from '../types'

interface SplitModeSelectorProps {
  readonly value: SplitMode
  readonly onChange: (mode: SplitMode) => void
}

const MODES: { key: SplitMode; label: string }[] = [
  { key: 'equal', label: 'Equal' },
  { key: 'custom', label: 'Custom' },
  { key: 'itemized', label: 'Itemized' },
]

export function SplitModeSelector({ value, onChange }: SplitModeSelectorProps) {
  return (
    <div className="flex border border-feldora-border rounded overflow-hidden">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          onClick={() => onChange(mode.key)}
          className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            value === mode.key
              ? 'bg-feldora-accent text-white'
              : 'bg-feldora-surface text-feldora-text-secondary hover:text-feldora-text hover:bg-feldora-surface-light'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
