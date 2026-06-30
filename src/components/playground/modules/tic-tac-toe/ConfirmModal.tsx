/**
 * Tic Tac Toe — Confirm Modal
 *
 * Generic confirm dialog used for:
 *   - Reset game in progress
 *   - Change game mode while in progress
 *   - Change bot level while in progress
 */

interface ConfirmModalProps {
  readonly open: boolean
  readonly title: string
  readonly message: string
  readonly confirmLabel?: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        aria-label="Close modal"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm card-polygon p-6 animate-fade-in">
        {/* Icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 border border-amber-500/30 rotate-45 flex-shrink-0">
            <svg
              className="-rotate-45 w-4 h-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h3 className="text-feldora-text font-bold text-base">{title}</h3>
        </div>

        <p className="text-feldora-text-secondary text-sm mb-6 pl-11">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-feldora-accent/15 border border-feldora-accent/40 text-feldora-accent hover:bg-feldora-accent/25 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
