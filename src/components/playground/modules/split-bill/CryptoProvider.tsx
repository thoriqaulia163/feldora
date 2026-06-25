/**
 * CryptoProvider — Shared DEK context for all Split Bill routes
 *
 * Wraps the split-bill layout route to provide decrypted DEK
 * to all child pages without re-initializing on navigation.
 */

import { createContext, useContext, type ReactNode } from 'react'
import { useCrypto } from './hooks'

interface CryptoContextValue {
  status: 'loading' | 'locked' | 'unlocked' | 'error'
  dek: CryptoKey | null
  pinEnabled: boolean
  unlockWithPIN: (pin: string) => Promise<boolean>
  enablePIN: (pin: string) => Promise<void>
  disablePIN: (currentPin: string) => Promise<boolean>
  resetAll: () => Promise<void>
  error: string | null
}

const CryptoContext = createContext<CryptoContextValue | null>(null)

export function CryptoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const crypto = useCrypto()
  return <CryptoContext.Provider value={crypto}>{children}</CryptoContext.Provider>
}

export function useCryptoContext(): CryptoContextValue {
  const ctx = useContext(CryptoContext)
  if (!ctx) {
    throw new Error('useCryptoContext must be used within CryptoProvider')
  }
  return ctx
}
