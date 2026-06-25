/**
 * DB Services — Participants, Bills, Settings
 *
 * Encryption strategy:
 * - Participants: name encrypted, id plain
 * - Bills: title + payload encrypted, metadata (createdAt, updatedAt, status) plain
 * - Settings: DEK wrapper + config (not user data)
 */

import { encrypt, decrypt, type EncryptedPayload } from '~/lib/crypto'
import { getDB } from './database'
import type { ParticipantRecord, BillRecord, SettingsKey } from './schema'

// ─── ID Generators ───────────────────────────────────────────────────

function generateParticipantId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function generateBillId(): string {
  return `bill_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Participants ────────────────────────────────────────────────────

/** Decrypted participant for in-memory use */
export interface DecryptedParticipant {
  id: string
  name: string
  createdAt: number
}

/**
 * Get all participants and decrypt names.
 * Returns decrypted records sorted by name.
 */
export async function getAllParticipants(dek: CryptoKey): Promise<DecryptedParticipant[]> {
  const db = await getDB()
  const all = await db.getAll('participants')
  const decrypted: DecryptedParticipant[] = []

  for (const record of all) {
    try {
      const name = await decrypt(record.encryptedName, dek)
      decrypted.push({ id: record.id, name, createdAt: record.createdAt })
    } catch {
      // Skip corrupted records
    }
  }

  return decrypted.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Add a new participant (encrypt name).
 */
export async function addParticipant(name: string, dek: CryptoKey): Promise<DecryptedParticipant> {
  const db = await getDB()
  const encryptedName = await encrypt(name.trim(), dek)
  const record: ParticipantRecord = {
    id: generateParticipantId(),
    encryptedName,
    createdAt: Date.now(),
  }
  await db.put('participants', record)
  return { id: record.id, name: name.trim(), createdAt: record.createdAt }
}

/**
 * Update participant name (re-encrypt).
 */
export async function updateParticipant(id: string, name: string, dek: CryptoKey): Promise<DecryptedParticipant | undefined> {
  const db = await getDB()
  const existing = await db.get('participants', id)
  if (!existing) return undefined

  const encryptedName = await encrypt(name.trim(), dek)
  const updated: ParticipantRecord = { ...existing, encryptedName }
  await db.put('participants', updated)
  return { id, name: name.trim(), createdAt: existing.createdAt }
}

/**
 * Delete a participant.
 */
export async function deleteParticipant(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('participants', id)
}

/**
 * Check if a participant name exists (requires decrypting all names).
 */
export async function participantNameExists(name: string, dek: CryptoKey): Promise<boolean> {
  const all = await getAllParticipants(dek)
  const normalized = name.trim().toLowerCase()
  return all.some((p) => p.name.toLowerCase() === normalized)
}

// ─── Bills ───────────────────────────────────────────────────────────

/** Decrypted bill title for list display */
export interface BillListRecord {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  status: 'active' | 'archived'
}

/**
 * Get all active bills with decrypted titles (no payload decrypt).
 * Sorted by updatedAt DESC.
 */
export async function getActiveBills(dek: CryptoKey): Promise<BillListRecord[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('splitBills', 'by-status', 'active')
  const results: BillListRecord[] = []

  for (const record of all) {
    try {
      const title = await decrypt(record.encryptedTitle, dek)
      results.push({ id: record.id, title, createdAt: record.createdAt, updatedAt: record.updatedAt, status: record.status })
    } catch {
      results.push({ id: record.id, title: '[Encrypted]', createdAt: record.createdAt, updatedAt: record.updatedAt, status: record.status })
    }
  }

  return results.sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * Get a single bill record (raw, still encrypted).
 */
export async function getBillRecord(id: string): Promise<BillRecord | undefined> {
  const db = await getDB()
  return db.get('splitBills', id)
}

/**
 * Decrypt a bill's title.
 */
export async function decryptBillTitle(record: BillRecord, dek: CryptoKey): Promise<string> {
  return decrypt(record.encryptedTitle, dek)
}

/**
 * Decrypt a bill's payload.
 */
export async function decryptBillPayload<T>(encryptedPayload: EncryptedPayload, dek: CryptoKey): Promise<T> {
  const json = await decrypt(encryptedPayload, dek)
  return JSON.parse(json) as T
}

/**
 * Create a new bill (encrypt title + payload).
 */
export async function createBill(title: string, payload: unknown, dek: CryptoKey): Promise<BillListRecord> {
  const db = await getDB()
  const now = Date.now()
  const encryptedTitle = await encrypt(title.trim(), dek)
  const encryptedPayload = await encrypt(JSON.stringify(payload), dek)

  const record: BillRecord = {
    id: generateBillId(),
    encryptedTitle,
    encryptedPayload,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  }
  await db.put('splitBills', record)
  return { id: record.id, title: title.trim(), createdAt: now, updatedAt: now, status: 'active' }
}

/**
 * Update an existing bill (re-encrypt title + payload).
 */
export async function updateBill(id: string, title: string, payload: unknown, dek: CryptoKey): Promise<BillListRecord | undefined> {
  const db = await getDB()
  const existing = await db.get('splitBills', id)
  if (!existing) return undefined

  const encryptedTitle = await encrypt(title.trim(), dek)
  const encryptedPayload = await encrypt(JSON.stringify(payload), dek)
  const now = Date.now()

  const updated: BillRecord = { ...existing, encryptedTitle, encryptedPayload, updatedAt: now }
  await db.put('splitBills', updated)
  return { id, title: title.trim(), createdAt: existing.createdAt, updatedAt: now, status: existing.status }
}

/**
 * Delete a bill.
 */
export async function deleteBill(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('splitBills', id)
}

/**
 * Archive a bill (soft delete — metadata only, no decrypt needed).
 */
export async function archiveBill(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('splitBills', id)
  if (!existing) return
  await db.put('splitBills', { ...existing, status: 'archived', updatedAt: Date.now() })
}

// ─── Settings ────────────────────────────────────────────────────────

export async function getSetting<T>(key: SettingsKey): Promise<T | undefined> {
  const db = await getDB()
  const record = await db.get('settings', key)
  return record?.value as T | undefined
}

export async function setSetting<T>(key: SettingsKey, value: T): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key, value })
}

export async function deleteSetting(key: SettingsKey): Promise<void> {
  const db = await getDB()
  await db.delete('settings', key)
}

export async function hasSetting(key: SettingsKey): Promise<boolean> {
  const db = await getDB()
  const record = await db.get('settings', key)
  return record !== undefined
}
