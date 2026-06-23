/**
 * PinSetup — Toggle PIN protection ON/OFF
 */

import { useState } from 'react'

interface PinSetupProps {
  readonly pinEnabled: boolean
  readonly onEnablePIN: (pin: string) => Promise<void>
  readonly onDisablePIN: (currentPin: string) => Promise<boolean>
}

export function PinSetup({ pinEnabled, onEnablePIN, onDisablePIN }: PinSetupProps) {
  const [showForm, setShowForm] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleEnable() {
    if (!pin.trim() || pin.length < 4) {
      setError('PIN must be at least 4 characters')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onEnablePIN(pin)
      setSuccess('PIN enabled successfully')
      setShowForm(false)
      setPin('')
      setConfirmPin('')
    } catch {
      setError('Failed to enable PIN')
    }
    setLoading(false)
  }

  async function handleDisable() {
    if (!pin.trim()) {
      setError('Enter current PIN')
      return
    }

    setLoading(true)
    setError('')
    const ok = await onDisablePIN(pin)
    setLoading(false)

    if (ok) {
      setSuccess('PIN disabled successfully')
      setShowForm(false)
      setPin('')
    } else {
      setError('Wrong PIN')
    }
  }

  return (
    <div className="border border-feldora-border/40 rounded p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-feldora-text font-semibold">PIN Protection</p>
          <p className="text-[11px] text-feldora-text-secondary mt-0.5">
            {pinEnabled ? 'Active — data locked with PIN' : 'Inactive — data encrypted without PIN'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm)
            setError('')
            setSuccess('')
            setPin('')
            setConfirmPin('')
          }}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            pinEnabled ? 'bg-feldora-accent' : 'bg-feldora-border'
          }`}
          aria-label={pinEnabled ? 'Disable PIN' : 'Enable PIN'}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              pinEnabled ? 'left-5.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {success && !showForm && (
        <p className="text-emerald-400 text-xs mt-2">{success}</p>
      )}

      {showForm && (
        <div className="mt-4 space-y-3">
          {pinEnabled ? (
            <>
              <p className="text-xs text-feldora-text-secondary">Enter current PIN to disable:</p>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError('') }}
                placeholder="Current PIN"
                maxLength={20}
                className="w-full bg-feldora-surface-light border border-feldora-border rounded px-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleDisable}
                disabled={loading}
                className="w-full py-2 text-xs font-semibold uppercase tracking-wider bg-red-500/15 border border-red-500/30 text-red-400 rounded hover:bg-red-500/25 transition-colors disabled:opacity-40"
              >
                {loading ? 'Processing...' : 'Disable PIN'}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-feldora-text-secondary">Create a new PIN (min 4 characters):</p>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError('') }}
                placeholder="New PIN"
                maxLength={20}
                className="w-full bg-feldora-surface-light border border-feldora-border rounded px-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
                autoComplete="off"
              />
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => { setConfirmPin(e.target.value); setError('') }}
                placeholder="Confirm PIN"
                maxLength={20}
                className="w-full bg-feldora-surface-light border border-feldora-border rounded px-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleEnable}
                disabled={loading}
                className="w-full btn-angular-primary py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
              >
                {loading ? 'Processing...' : 'Enable PIN'}
              </button>
            </>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
    </div>
  )
}
