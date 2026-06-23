/**
 * Edit Bill Page — /playground/split-bill/edit/:id
 *
 * Same as create but prefilled with existing bill data.
 * CRITICAL: On save, ALL payment statuses are RESET to 'unpaid'.
 */

import { Link, useNavigate } from '@tanstack/react-router'
import { useCryptoContext } from '../CryptoProvider'
import { useBillDetail } from '../hooks'
import { BillForm } from '../components/BillForm'

interface EditPageProps {
  readonly id: string
}

export default function EditPage({ id }: EditPageProps) {
  const { status, dek } = useCryptoContext()
  const { bill, loading, error } = useBillDetail(id, dek)
  const navigate = useNavigate()

  if (status !== 'unlocked' || !dek || loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-feldora-text-secondary text-sm">Loading data...</span>
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

  function handleSuccess(billId: string) {
    navigate({ to: '/playground/split-bill/detail/$id', params: { id: billId } })
  }

  function handleCancel() {
    navigate({ to: '/playground/split-bill/detail/$id', params: { id } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/playground/split-bill/detail/$id"
          params={{ id }}
          className="text-xs text-feldora-muted hover:text-feldora-accent font-mono uppercase tracking-wider transition-colors"
        >
          &larr; Back to Detail
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-feldora-text uppercase tracking-tight mt-1">
          Edit <span className="text-feldora-accent">Bill</span>
        </h1>
        <p className="text-xs text-amber-400 mt-1 font-mono">
          * All payment statuses will be reset on save
        </p>
      </div>

      {/* Form (prefilled) */}
      <BillForm
        dek={dek}
        existingBill={bill}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
