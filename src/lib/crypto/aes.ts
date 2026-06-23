/**
 * AES-GCM Encrypt / Decrypt Primitives
 *
 * Low-level functions using Web Crypto API.
 * Not security-grade — intended to prevent casual reading of IndexedDB data.
 */

import type { EncryptedPayload } from './types'

/**
 * Encode ArrayBuffer to Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCodePoint(bytes[i])
  }
  return btoa(binary)
}

/**
 * Decode Base64 string to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i)!
  }
  return bytes.buffer
}

/**
 * Encrypt plaintext string using AES-GCM with the given CryptoKey.
 * Returns ciphertext + IV as base64 strings.
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // 12-byte random IV (recommended for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv.buffer),
  }
}

/**
 * Decrypt AES-GCM encrypted payload back to plaintext string.
 * Throws if key is wrong (authentication failure).
 */
export async function decrypt(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const cipherBuffer = base64ToBuffer(payload.ciphertext)
  const iv = base64ToBuffer(payload.iv)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    cipherBuffer
  )

  const decoder = new TextDecoder()
  return decoder.decode(plainBuffer)
}

/**
 * Generate a random salt (16 bytes) as base64 string.
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return bufferToBase64(salt.buffer)
}

/**
 * Export a CryptoKey to raw bytes as base64.
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bufferToBase64(raw)
}

/**
 * Import raw base64 bytes as an AES-GCM CryptoKey.
 */
export async function importKey(base64: string): Promise<CryptoKey> {
  const raw = base64ToBuffer(base64)
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )
}

export { bufferToBase64, base64ToBuffer }
