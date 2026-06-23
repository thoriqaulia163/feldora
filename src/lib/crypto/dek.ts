/**
 * DEK (Data Encryption Key) Management
 *
 * - generateDEK(): create a fresh random AES-256 key
 * - wrapDEK(): encrypt DEK with KEK for storage
 * - unwrapDEK(): decrypt stored DEK using KEK
 * - migrateDEK(): re-wrap DEK with a new KEK (PIN toggle)
 */

import { encrypt, decrypt, exportKey, importKey } from './aes'
import type { EncryptedPayload } from './types'

/**
 * Generate a new random DEK (AES-256-GCM).
 */
export async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable — needed for wrap/unwrap
    ['encrypt', 'decrypt']
  )
}

/**
 * Wrap (encrypt) the DEK with KEK for safe storage.
 * Returns encrypted payload that can be stored in IndexedDB settings.
 */
export async function wrapDEK(
  dek: CryptoKey,
  kek: CryptoKey
): Promise<EncryptedPayload> {
  const dekBase64 = await exportKey(dek)
  return encrypt(dekBase64, kek)
}

/**
 * Unwrap (decrypt) the DEK from storage using KEK.
 * Throws if KEK is wrong (wrong PIN / tampered data).
 */
export async function unwrapDEK(
  wrappedDEK: EncryptedPayload,
  kek: CryptoKey
): Promise<CryptoKey> {
  const dekBase64 = await decrypt(wrappedDEK, kek)
  return importKey(dekBase64)
}

/**
 * Migrate DEK wrapper when PIN is toggled ON/OFF.
 * The DEK itself never changes — only the KEK wrapper is replaced.
 *
 * @param wrappedDEK - current wrapped DEK (encrypted with oldKEK)
 * @param oldKEK - current KEK (to unwrap)
 * @param newKEK - new KEK (to re-wrap)
 * @returns new EncryptedPayload wrapping the same DEK
 */
export async function migrateDEK(
  wrappedDEK: EncryptedPayload,
  oldKEK: CryptoKey,
  newKEK: CryptoKey
): Promise<EncryptedPayload> {
  const dek = await unwrapDEK(wrappedDEK, oldKEK)
  return wrapDEK(dek, newKEK)
}
