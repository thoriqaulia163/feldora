/**
 * PinGate — Lock screen shown when PIN is enabled and DEK is locked
 *
 * User must enter correct PIN to unlock and access bill data.
 */

import { useState, useRef, useEffect } from 'react'

interface PinGateProps {
  readonly onUnlock: (pin: string) => Promise<boolean>
  readonly error: string | null
}

export function PinGate({ onUnlock, error: externalError }: PinGateProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!pin.trim()) {
      setLocalError('Enter PIN')
      return
    }

    setLoading(true)
    setLocalError('')
    const success = await onUnlock(pin)
    setLoading(false)

    if (!success) {
      setLocalError('Wrong PIN')
      setPin('')
      inputRef.current?.focus()
    }
  }

  const displayError = localError || externalError

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="card-polygon p-8 w-full max-w-xs text-center">
        {/* Lock icon */}
        <div className="w-14 h-14 rounded-full bg-feldora-surface-light border border-feldora-border flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-feldora-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>

        <h2 className="text-feldora-text font-bold text-lg mb-1">Split Bill Locked</h2>
        <p className="text-feldora-text-secondary text-xs mb-6">Enter PIN to unlock</p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setLocalError('')
            }}
            placeholder="PIN"
            maxLength={20}
            className="w-full bg-feldora-surface-light border border-feldora-border rounded px-4 py-3 text-center text-lg text-feldora-text tracking-[0.5em] placeholder:text-feldora-muted placeholder:tracking-normal focus:outline-none focus:border-feldora-accent/50 transition-colors"
            disabled={loading}
            autoComplete="off"
          />

          {displayError && (
            <p className="text-red-400 text-xs mt-2">{displayError}</p>
          )}

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full btn-angular-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider mt-4 disabled:opacity-40"
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
