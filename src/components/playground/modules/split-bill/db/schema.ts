/**
 * IndexedDB Schema for Split Bill Module
 *
 * Database: db-playground-split-bill
 * Stores:
 *   - participants: global reusable people
 *   - splitBills: encrypted bill data
 *   - settings: key-value config (crypto keys, preferences)
 */

import type { DBSchema } from 'idb'
import type { EncryptedPayload } from '~/lib/crypto'

/** Participant record in global store */
export interface ParticipantRecord {
  id: string
  name: string
  createdAt: number
}

/** Bill record with encrypted payload */
export interface BillRecord {
  id: string
  title: string
  encryptedPayload: EncryptedPayload
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
    indexes: { 'by-name': string }
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
export const DB_VERSION = 1
