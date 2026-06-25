/**
 * IndexedDB Schema for Split Bill Module
 *
 * Database: db-playground-split-bill
 * Stores:
 *   - participants: global reusable people (name encrypted)
 *   - splitBills: bill data (title + payload encrypted, metadata plain)
 *   - settings: key-value config (crypto keys, preferences)
 */

import type { DBSchema } from 'idb'
import type { EncryptedPayload } from '~/lib/crypto'

/** Participant record — name is encrypted */
export interface ParticipantRecord {
  id: string
  /** Encrypted name */
  encryptedName: EncryptedPayload
  createdAt: number
}

/** Bill record — title + payload encrypted, metadata plain */
export interface BillRecord {
  id: string
  /** Encrypted title */
  encryptedTitle: EncryptedPayload
  /** Encrypted bill payload (participants, items, payments, splitMode) */
  encryptedPayload: EncryptedPayload
  /** Plaintext metadata */
  createdAt: number
  updatedAt: number
  status: 'active' | 'archived'
}

/** Settings key-value pairs */
export type SettingsKey = 'crypto' | 'pinEnabled'

export interface SettingsRecord {
  key: SettingsKey
  value: unknown
}

/** Full DB schema for type-safe idb usage */
export interface SplitBillDB extends DBSchema {
  participants: {
    key: string
    value: ParticipantRecord
  }
  splitBills: {
    key: string
    value: BillRecord
    indexes: { 'by-updatedAt': number; 'by-status': string }
  }
  settings: {
    key: string
    value: SettingsRecord
  }
}

export const DB_NAME = 'db-playground-split-bill'
export const DB_VERSION = 2
