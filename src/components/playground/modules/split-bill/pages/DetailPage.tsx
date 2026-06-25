/**
 * Bill Detail Page — /playground/split-bill/detail/:id
 *
 * Shows full bill breakdown with payment toggles, edit button, and share button.
 */

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useCryptoContext } from '../CryptoProvider'
import { useBillDetail } from '../hooks'
import { BillBreakdown } from '../components/BillBreakdown'
import { ShareModal } from '../components/ShareModal'
import type { QRBillData } from '../qr'

interface DetailPageProps {
  readonly id: string
}

export default function DetailPage({ id }: DetailPageProps) {
  const { status, dek } = useCryptoContext()
  const { bill, loading, error, togglePayment } = useBillDetail(id, dek)
  const [showShare, setShowShare] = useState(false)

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

  const shareData: QRBillData = { title: bill.title, payload: bill.payload }

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

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Share button */}
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-feldora-accent-secondary/40 text-feldora-accent-secondary hover:bg-feldora-accent-secondary/10 rounded transition-colors"
            aria-label="Share bill"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
            </svg>
          </button>
          {/* Edit button */}
          <Link
            to="/playground/split-bill/edit/$id"
            params={{ id }}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-feldora-accent/40 text-feldora-accent hover:bg-feldora-accent/10 rounded transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Breakdown */}
      <BillBreakdown payload={bill.payload} onTogglePayment={togglePayment} />

      {/* Share Modal */}
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        billData={shareData}
        dek={dek}
      />
    </div>
  )
}
