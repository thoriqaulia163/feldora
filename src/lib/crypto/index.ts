/**
 * Crypto Layer — Barrel Export
 *
 * Reusable DEK + KEK encryption for any playground module.
 *
 * Usage:
 *   import { encrypt, decrypt, generateDEK, deriveKEKFromHardcoded } from '~/lib/crypto'
 */

export { encrypt, decrypt, generateSalt, exportKey, importKey } from './aes'
export { deriveKEKFromHardcoded, deriveKEKFromPIN, isKEKConfigured } from './kek'
export { generateDEK, wrapDEK, unwrapDEK, migrateDEK } from './dek'
export type { EncryptedPayload, WrappedDEK, KEKMode, CryptoSettings } from './types'
