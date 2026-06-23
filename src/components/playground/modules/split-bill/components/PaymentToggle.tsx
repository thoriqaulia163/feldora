/**
 * PaymentToggle — Paid/Unpaid toggle per participant
 *
 * Click toggles between paid and unpaid states.
 */

import type { PaymentStatus } from '../types'

interface PaymentToggleProps {
  readonly status: PaymentStatus
  readonly onToggle: () => void
}

export function PaymentToggle({ status, onToggle }: PaymentToggleProps) {
  const isPaid = status === 'paid'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded border transition-colors ${
        isPaid
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          : 'bg-feldora-surface-light border-feldora-border/50 text-feldora-muted hover:text-feldora-text-secondary'
      }`}
      aria-label={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
    >
      {isPaid ? 'Paid' : 'Unpaid'}
    </button>
  )
}
