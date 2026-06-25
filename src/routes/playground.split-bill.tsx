import { useState } from 'react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { isKEKConfigured } from '~/lib/crypto'
import { CryptoProvider, useCryptoContext } from '~/components/playground/modules/split-bill/CryptoProvider'
import { PinGate } from '~/components/playground/modules/split-bill/components/PinGate'
import { DeleteConfirmModal } from '~/components/playground/modules/split-bill/components/Modals'

export const Route = createFileRoute('/playground/split-bill')({
  head: () => ({
    meta: [{ title: 'FELDORA — Split Bill' }],
  }),
  component: SplitBillLayout,
})

function SplitBillLayout() {
  if (!isKEKConfigured()) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <section className="px-6 md:px-12 lg:px-20 max-w-5xl mx-auto">
          <div className="card-polygon p-8 text-center">
            <p className="text-feldora-text font-bold text-lg mb-2">Module Not Available</p>
            <p className="text-feldora-text-secondary text-sm mb-4">
              Split Bill is not configured in this environment.
            </p>
            <Link
              to="/playground"
              className="text-xs text-feldora-accent hover:text-feldora-accent/80 font-mono uppercase tracking-wider transition-colors"
            >
              &larr; Back to Playground
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <CryptoProvider>
      <div className="min-h-screen pt-24 pb-20">
        <section className="px-6 md:px-12 lg:px-20 max-w-5xl mx-auto">
          <SplitBillGate />
        </section>
      </div>
    </CryptoProvider>
  )
}

function SplitBillGate() {
  const { status, unlockWithPIN, resetAll, error } = useCryptoContext()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  if (status === 'locked') {
    return <PinGate onUnlock={unlockWithPIN} error={error} />
  }

  if (status === 'error') {
    return (
      <>
        <div className="card-polygon p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-feldora-text font-bold text-lg">Encryption Key Mismatch</p>
            <p className="text-feldora-text-secondary text-sm mt-1">
              The encryption key has changed. Old data cannot be decrypted with the current key.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 rounded transition-colors"
            >
              Reset All Data
            </button>
            <Link
              to="/playground"
              className="text-xs text-feldora-muted hover:text-feldora-accent font-mono uppercase tracking-wider transition-colors"
            >
              &larr; Back to Playground
            </Link>
          </div>
        </div>

        <DeleteConfirmModal
          open={showResetConfirm}
          title="Reset All Data?"
          message="All bills, participants, and encryption keys will be permanently deleted. This cannot be undone. A fresh setup will start with the current key."
          onConfirm={async () => {
            setShowResetConfirm(false)
            await resetAll()
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      </>
    )
  }

  return <Outlet />
}
