/**
 * Create Bill Page — /playground/split-bill/create
 *
 * Fresh form to create a new bill. Navigates to detail on success.
 */

import { Link, useNavigate } from '@tanstack/react-router'
import { useCryptoContext } from '../CryptoProvider'
import { BillForm } from '../components/BillForm'
import { PLAYGROUND_COPY } from '~/constants/copy/playground'

const C = PLAYGROUND_COPY.splitBill

export default function CreatePage() {
  const { status, dek } = useCryptoContext()
  const navigate = useNavigate()

  if (status !== 'unlocked' || !dek) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-feldora-text-secondary text-sm">{C.loadingEncryption}</span>
      </div>
    )
  }

  function handleSuccess(billId: string) {
    navigate({ to: '/playground/split-bill/detail/$id', params: { id: billId } })
  }

  function handleCancel() {
    navigate({ to: '/playground/split-bill' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/playground/split-bill"
          className="text-xs text-feldora-muted hover:text-feldora-accent font-mono uppercase tracking-wider transition-colors"
        >
          {C.backToBills}
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-feldora-text uppercase tracking-tight mt-1">
          {C.createPageTitle} <span className="text-feldora-accent">{C.createPageTitleAccent}</span>
        </h1>
      </div>

      {/* Form */}
      <BillForm dek={dek} onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
