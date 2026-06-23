/**
 * Bill Detail Page — /playground/split-bill/detail/:id
 *
 * Shows full bill breakdown with payment toggles and edit button.
 */

import { Link } from '@tanstack/react-router'
import { useCryptoContext } from '../CryptoProvider'
import { useBillDetail } from '../hooks'
import { BillBreakdown } from '../components/BillBreakdown'

interface DetailPageProps {
  readonly id: string
}

export default function DetailPage({ id }: DetailPageProps) {
  const { status, dek } = useCryptoContext()
  const { bill, loading, error, togglePayment } = useBillDetail(id, dek)

  if (status !== 'unlocked' || !dek || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-24 bg-feldora-surface rounded" />
        <div className="h-8 w-48 bg-feldora-surface rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-feldora-surface rounded" />
          <div className="h-16 bg-feldora-surface rounded" />
          <div className="h-16 bg-feldora-surface rounded" />
          <div className="h-16 bg-feldora-surface rounded" />
        </div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="card-polygon p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error || 'Bill not found'}</p>
        <Link
          to="/playground/split-bill"
          className="text-xs text-feldora-accent hover:text-feldora-accent/80 transition-colors"
        >
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/playground/split-bill"
            className="text-xs text-feldora-muted hover:text-feldora-accent font-mono uppercase tracking-wider transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-feldora-text uppercase tracking-tight mt-1">
            {bill.title}
          </h1>
          <p className="text-[10px] text-feldora-muted font-mono mt-1">
            {new Date(bill.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Edit button */}
        <Link
          to="/playground/split-bill/edit/$id"
          params={{ id }}
          className="shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-feldora-accent/40 text-feldora-accent hover:bg-feldora-accent/10 rounded transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Breakdown */}
      <BillBreakdown payload={bill.payload} onTogglePayment={togglePayment} />
    </div>
  )
}
