/**
 * QR Sharing Utilities
 *
 * Encode: BillPayload → encrypt(DEK) → compress(pako) → base64 → QR string
 * Decode: QR string → base64 → decompress(pako) → decrypt(DEK) → BillPayload
 *
 * Max QR capacity: ~2,900 bytes. If compressed data exceeds this, reject.
 */

import pako from 'pako'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { encrypt, decrypt } from '~/lib/crypto'
import type { EncryptedPayload } from '~/lib/crypto'

const QR_MAX_BYTES = 2900
const QR_PREFIX = 'FDSB:' // Feldora Split Bill marker

/** Data structure shared via QR (bill title + payload) */
export interface QRBillData {
  title: string
  payload: unknown // BillPayload
}

// ─── Encode (Bill → QR Image) ────────────────────────────────────────

/**
 * Encode bill data into a QR code data URL.
 * Flow: JSON → encrypt → compress → base64 → QR image
 *
 * @returns data URL (png) or null if too large
 */
export async function encodeBillToQR(
  data: QRBillData,
  dek: CryptoKey
): Promise<string | null> {
  // 1. Encrypt
  const json = JSON.stringify(data)
  const encrypted = await encrypt(json, dek)

  // 2. Serialize encrypted payload to compact string
  const encStr = JSON.stringify(encrypted)

  // 3. Compress
  const compressed = pako.deflate(new TextEncoder().encode(encStr))

  // 4. Check size
  if (compressed.length > QR_MAX_BYTES) {
    return null // Too large
  }

  // 5. Base64 encode
  const base64 = uint8ToBase64(compressed)
  const qrContent = QR_PREFIX + base64

  // 6. Generate QR image
  const dataUrl = await QRCode.toDataURL(qrContent, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#000000', light: '#ffffff' },
  })

  return dataUrl
}

/**
 * Get compressed size in bytes (for UI feedback before generating QR).
 */
export async function getEncodedSize(data: QRBillData, dek: CryptoKey): Promise<number> {
  const json = JSON.stringify(data)
  const encrypted = await encrypt(json, dek)
  const encStr = JSON.stringify(encrypted)
  const compressed = pako.deflate(new TextEncoder().encode(encStr))
  return compressed.length
}

// ─── Decode (QR → Bill Data) ─────────────────────────────────────────

/**
 * Decode QR string content back to bill data.
 * Flow: QR string → base64 → decompress → decrypt → JSON
 */
export async function decodeQRToBill(
  qrContent: string,
  dek: CryptoKey
): Promise<QRBillData | null> {
  try {
    // 1. Check prefix
    if (!qrContent.startsWith(QR_PREFIX)) return null
    const base64 = qrContent.slice(QR_PREFIX.length)

    // 2. Base64 decode
    const compressed = base64ToUint8(base64)

    // 3. Decompress
    const decompressed = pako.inflate(compressed)
    const encStr = new TextDecoder().decode(decompressed)

    // 4. Parse encrypted payload
    const encrypted: EncryptedPayload = JSON.parse(encStr)

    // 5. Decrypt
    const json = await decrypt(encrypted, dek)

    // 6. Parse bill data
    return JSON.parse(json) as QRBillData
  } catch (err) {
    console.error('[QR] decode error:', err)
    return null
  }
}

// ─── QR Scanning ─────────────────────────────────────────────────────

/**
 * Scan QR code from an image file (File/Blob).
 * Returns the decoded string content, or null if no QR found.
 */
export async function scanQRFromImage(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  return result?.data ?? null
}

/**
 * Scan QR code from a video frame (for camera scanning).
 * Call this repeatedly with requestAnimationFrame.
 */
export function scanQRFromVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): string | null {
  const ctx = canvas.getContext('2d')
  if (!ctx || video.readyState < 2) return null

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  return result?.data ?? null
}

// ─── Helpers ─────────────────────────────────────────────────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCodePoint(bytes[i])
  }
  return btoa(binary)
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i)!
  }
  return bytes
}
