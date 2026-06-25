/**
 * useCrypto — Manage DEK lifecycle (init, unlock, PIN toggle)
 *
 * On first use: generates DEK + wraps with hardcoded KEK.
 * On subsequent loads: unwraps DEK from settings.
 * When PIN is enabled: unwraps with user-provided PIN instead.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  generateDEK,
  wrapDEK,
  unwrapDEK,
  migrateDEK,
  deriveKEKFromHardcoded,
  deriveKEKFromPIN,
  generateSalt,
  type EncryptedPayload,
} from '~/lib/crypto'
import { getSetting, setSetting, deleteDatabase } from '../db'

/** Crypto state stored in IndexedDB settings */
interface StoredCryptoState {
  wrappedDEK: EncryptedPayload
  salt: string
  pinEnabled: boolean
}

type CryptoStatus = 'loading' | 'locked' | 'unlocked' | 'error'

interface UseCryptoReturn {
  /** Current status of the crypto system */
  status: CryptoStatus
  /** Unlocked DEK (available when status === 'unlocked') */
  dek: CryptoKey | null
  /** Whether PIN is enabled */
  pinEnabled: boolean
  /** Unlock with PIN (only needed when pinEnabled) */
  unlockWithPIN: (pin: string) => Promise<boolean>
  /** Enable PIN protection */
  enablePIN: (pin: string) => Promise<void>
  /** Disable PIN protection (requires current PIN) */
  disablePIN: (currentPin: string) => Promise<boolean>
  /** Reset all data and start fresh (for key mismatch recovery) */
  resetAll: () => Promise<void>
  /** Error message if status === 'error' */
  error: string | null
}

export function useCrypto(): UseCryptoReturn {
  const [status, setStatus] = useState<CryptoStatus>('loading')
  const [dek, setDek] = useState<CryptoKey | null>(null)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)

  // Initialize crypto on mount
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    initializeCrypto()
  }, [])

  async function initializeCrypto() {
    try {
      const stored = await getSetting<StoredCryptoState>('crypto')

      if (!stored) {
        // First time — generate DEK, wrap with hardcoded KEK
        await firstTimeSetup()
        return
      }

      setPinEnabled(stored.pinEnabled)

      if (stored.pinEnabled) {
        // Need PIN to unlock
        setStatus('locked')
      } else {
        // Auto-unlock with hardcoded KEK
        const kek = await deriveKEKFromHardcoded(stored.salt)
        const decryptedDEK = await unwrapDEK(stored.wrappedDEK, kek)
        setDek(decryptedDEK)
        setStatus('unlocked')
      }
    } catch (err) {
      setError('Failed to initialize encryption')
      setStatus('error')
      console.error('[useCrypto] init error:', err)
    }
  }

  async function firstTimeSetup() {
    const salt = generateSalt()
    const newDEK = await generateDEK()
    const kek = await deriveKEKFromHardcoded(salt)
    const wrapped = await wrapDEK(newDEK, kek)

    const state: StoredCryptoState = {
      wrappedDEK: wrapped,
      salt,
      pinEnabled: false,
    }
    await setSetting('crypto', state)

    setDek(newDEK)
    setPinEnabled(false)
    setStatus('unlocked')
  }

  const unlockWithPIN = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const stored = await getSetting<StoredCryptoState>('crypto')
      if (!stored) return false

      const kek = await deriveKEKFromPIN(pin, stored.salt)
      const decryptedDEK = await unwrapDEK(stored.wrappedDEK, kek)

      setDek(decryptedDEK)
      setStatus('unlocked')
      setError(null)
      return true
    } catch {
      setError('Wrong PIN')
      return false
    }
  }, [])

  const enablePIN = useCallback(async (pin: string): Promise<void> => {
    const stored = await getSetting<StoredCryptoState>('crypto')
    if (!stored) throw new Error('Crypto not initialized')

    // Current KEK (hardcoded) → new KEK (PIN)
    const oldKEK = await deriveKEKFromHardcoded(stored.salt)
    const newKEK = await deriveKEKFromPIN(pin, stored.salt)
    const newWrapped = await migrateDEK(stored.wrappedDEK, oldKEK, newKEK)

    const updated: StoredCryptoState = {
      wrappedDEK: newWrapped,
      salt: stored.salt,
      pinEnabled: true,
    }
    await setSetting('crypto', updated)
    setPinEnabled(true)
  }, [])

  const disablePIN = useCallback(async (currentPin: string): Promise<boolean> => {
    try {
      const stored = await getSetting<StoredCryptoState>('crypto')
      if (!stored) return false

      // Verify current PIN works
      const oldKEK = await deriveKEKFromPIN(currentPin, stored.salt)
      const newKEK = await deriveKEKFromHardcoded(stored.salt)
      const newWrapped = await migrateDEK(stored.wrappedDEK, oldKEK, newKEK)

      const updated: StoredCryptoState = {
        wrappedDEK: newWrapped,
        salt: stored.salt,
        pinEnabled: false,
      }
      await setSetting('crypto', updated)
      setPinEnabled(false)
      return true
    } catch {
      setError('Wrong PIN — cannot disable')
      return false
    }
  }, [])

  const resetAll = useCallback(async (): Promise<void> => {
    await deleteDatabase()
    // Re-initialize with fresh state
    setDek(null)
    setError(null)
    setPinEnabled(false)
    initRef.current = false
    await firstTimeSetup()
  }, [])

  return { status, dek, pinEnabled, unlockWithPIN, enablePIN, disablePIN, resetAll, error }
}
