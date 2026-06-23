/**
 * DB Services — Participants, Bills, Settings
 *
 * All IndexedDB CRUD operations for the Split Bill module.
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

export async function getAllParticipants(): Promise<ParticipantRecord[]> {
  const db = await getDB()
  const all = await db.getAll('participants')
  return all.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getParticipant(id: string): Promise<ParticipantRecord | undefined> {
  const db = await getDB()
  return db.get('participants', id)
}

export async function addParticipant(name: string): Promise<ParticipantRecord> {
  const db = await getDB()
  const record: ParticipantRecord = {
    id: generateParticipantId(),
    name: name.trim(),
    createdAt: Date.now(),
  }
  await db.put('participants', record)
  return record
}

export async function updateParticipant(id: string, name: string): Promise<ParticipantRecord | undefined> {
  const db = await getDB()
  const existing = await db.get('participants', id)
  if (!existing) return undefined
  const updated: ParticipantRecord = { ...existing, name: name.trim() }
  await db.put('participants', updated)
  return updated
}

export async function deleteParticipant(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('participants', id)
}

export async function participantNameExists(name: string): Promise<boolean> {
  const all = await getAllParticipants()
  const normalized = name.trim().toLowerCase()
  return all.some((p) => p.name.toLowerCase() === normalized)
}

// ─── Bills ───────────────────────────────────────────────────────────

export async function getAllBills(): Promise<BillRecord[]> {
  const db = await getDB()
  const all = await db.getAll('splitBills')
  return all.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getActiveBills(): Promise<BillRecord[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('splitBills', 'by-status', 'active')
  return all.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getBillRecord(id: string): Promise<BillRecord | undefined> {
  const db = await getDB()
  return db.get('splitBills', id)
}

export async function decryptBillPayload<T>(encryptedPayload: EncryptedPayload, dek: CryptoKey): Promise<T> {
  const json = await decrypt(encryptedPayload, dek)
  return JSON.parse(json) as T
}

export async function createBill(title: string, payload: unknown, dek: CryptoKey): Promise<BillRecord> {
  const db = await getDB()
  const now = Date.now()
  const encryptedPayload = await encrypt(JSON.stringify(payload), dek)
  const record: BillRecord = {
    id: generateBillId(),
    title: title.trim(),
    encryptedPayload,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  }
  await db.put('splitBills', record)
  return record
}

export async function updateBill(id: string, title: string, payload: unknown, dek: CryptoKey): Promise<BillRecord | undefined> {
  const db = await getDB()
  const existing = await db.get('splitBills', id)
  if (!existing) return undefined
  const encryptedPayload = await encrypt(JSON.stringify(payload), dek)
  const updated: BillRecord = { ...existing, title: title.trim(), encryptedPayload, updatedAt: Date.now() }
  await db.put('splitBills', updated)
  return updated
}

export async function deleteBill(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('splitBills', id)
}

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
