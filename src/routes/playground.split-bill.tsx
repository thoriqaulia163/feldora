import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { isKEKConfigured } from '~/lib/crypto'
import { CryptoProvider, useCryptoContext } from '~/components/playground/modules/split-bill/CryptoProvider'
import { PinGate } from '~/components/playground/modules/split-bill/components/PinGate'

export const Route = createFileRoute('/playground/split-bill')({
  head: () => ({
    meta: [{ title: 'FELDORA — Split Bill' }],
  }),
  component: SplitBillLayout,
})

function SplitBillLayout() {
  // Disable module entirely if env key is not set
  if (!isKEKConfigured()) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <section className="px-6 md:px-12 lg:px-20 max-w-5xl mx-auto">
          <div className="card-polygon p-8 text-center">
            <p className="text-feldora-text font-bold text-lg mb-2">Module Tidak Tersedia</p>
            <p className="text-feldora-text-secondary text-sm mb-4">
              Split Bill belum dikonfigurasi di environment ini.
            </p>
            <Link
              to="/playground"
              className="text-xs text-feldora-accent hover:text-feldora-accent/80 font-mono uppercase tracking-wider transition-colors"
            >
              &larr; Kembali ke Playground
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

/** Shows PinGate when locked, Outlet when unlocked */
function SplitBillGate() {
  const { status, unlockWithPIN, error } = useCryptoContext()

  if (status === 'locked') {
    return <PinGate onUnlock={unlockWithPIN} error={error} />
  }

  if (status === 'error') {
    return (
      <div className="card-polygon p-6 text-center">
        <p className="text-red-400 text-sm">{error || 'Terjadi kesalahan pada sistem enkripsi'}</p>
      </div>
    )
  }

  return <Outlet />
}
