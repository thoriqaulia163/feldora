import { useState, useEffect } from 'react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      setIsDismissed(false)
    }
    const handleOnline = () => {
      setIsOffline(false)
      setIsDismissed(false)
    }

    setIsOffline(!globalThis.navigator?.onLine)

    globalThis.addEventListener('offline', handleOffline)
    globalThis.addEventListener('online', handleOnline)

    return () => {
      globalThis.removeEventListener('offline', handleOffline)
      globalThis.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline || isDismissed) return null

  return (
    <div className="fixed top-20 right-6 z-[100] animate-fade-up">
      <div className="flex items-center gap-3 px-5 py-3 bg-feldora-surface border border-feldora-border/60 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <span className="text-feldora-text text-sm font-medium whitespace-nowrap">
          You're offline
        </span>
        <span className="text-feldora-muted text-xs hidden sm:inline whitespace-nowrap">
          — some features may be unavailable
        </span>
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-2 text-feldora-muted hover:text-feldora-text transition-colors shrink-0"
          aria-label="Tutup notifikasi"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
