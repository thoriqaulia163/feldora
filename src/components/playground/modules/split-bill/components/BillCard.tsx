/**
 * BillCard — Single bill in the list
 *
 * Shows title + timestamp. Delete button always visible.
 */

import { Link } from '@tanstack/react-router'
import type { BillListItem } from '../hooks'

interface BillCardProps {
  readonly bill: BillListItem
  readonly onDelete: (id: string) => void
}

export function BillCard({ bill, onDelete }: BillCardProps) {
  return (
    <div className="relative border border-feldora-border/40 bg-feldora-surface hover:border-feldora-accent/30 rounded transition-colors">
      <Link
        to="/playground/split-bill/detail/$id"
        params={{ id: bill.id }}
        className="block px-4 py-3 pr-12"
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-feldora-text truncate">{bill.title}</h4>
          <span className="text-[10px] text-feldora-muted font-mono shrink-0">
            {formatRelativeDate(bill.updatedAt)}
          </span>
        </div>
      </Link>

      {/* Delete button — always visible */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(bill.id) }}
        className="absolute right-3 top-1/2 -translate-y-1/2 shrink-0 w-6 h-6 flex items-center justify-center rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
        aria-label={`Delete ${bill.title}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  )
}

function formatRelativeDate(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
