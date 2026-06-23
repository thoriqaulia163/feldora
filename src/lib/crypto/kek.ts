/**
 * KEK (Key Encryption Key) Derivation
 *
 * Two modes:
 * - Mode A (env): KEK derived from VITE_SPLIT_BILL_KEK env variable. Default mode.
 * - Mode B (PIN): KEK derived from user-provided PIN via PBKDF2.
 *
 * Both use PBKDF2 with a salt to produce a consistent AES-256 key.
 * Module is disabled if VITE_SPLIT_BILL_KEK is not set.
 */

import { base64ToBuffer } from './aes'

/** PBKDF2 iterations */
const PBKDF2_ITERATIONS = 100_000

/**
 * Check if the KEK env variable is configured.
 * Module should be disabled if this returns false.
 */
export function isKEKConfigured(): boolean {
  return !!import.meta.env.VITE_SPLIT_BILL_KEK
}

/**
 * Derive KEK from env passphrase (Mode A — no PIN).
 * Throws if VITE_SPLIT_BILL_KEK is not set.
 */
export async function deriveKEKFromHardcoded(salt: string): Promise<CryptoKey> {
  const passphrase = import.meta.env.VITE_SPLIT_BILL_KEK
  if (!passphrase) {
    throw new Error('VITE_SPLIT_BILL_KEK environment variable is not configured')
  }
  return deriveKEK(passphrase, salt)
}

/**
 * Derive KEK from user PIN (Mode B — PIN enabled).
 */
export async function deriveKEKFromPIN(pin: string, salt: string): Promise<CryptoKey> {
  return deriveKEK(pin, salt)
}

/**
 * Core PBKDF2 derivation: passphrase + salt → AES-256 CryptoKey.
 */
async function deriveKEK(passphrase: string, saltBase64: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const salt = base64ToBuffer(saltBase64)

  // Import passphrase as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // Derive AES-256-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}
