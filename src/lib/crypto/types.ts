/**
 * Crypto Layer Types
 *
 * Reusable encryption types for any module that needs
 * local data encryption (DEK + KEK architecture).
 */

/** Encrypted data with metadata needed for decryption */
export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string
  /** Base64-encoded IV (12 bytes for AES-GCM) */
  iv: string
}

/** Wrapped DEK stored in settings */
export interface WrappedDEK {
  /** DEK encrypted with KEK */
  encryptedKey: EncryptedPayload
  /** Salt used for KEK derivation */
  salt: string
}

/** KEK derivation mode */
export type KEKMode = 'hardcoded' | 'pin'

/** Settings stored in IndexedDB for crypto state */
export interface CryptoSettings {
  /** The wrapped (encrypted) DEK */
  wrappedDEK: WrappedDEK
  /** Whether PIN protection is enabled */
  pinMode: boolean
}
