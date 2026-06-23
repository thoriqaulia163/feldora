/**
 * IndexedDB Connection
 *
 * Opens and upgrades the split-bill database.
 * Uses `idb` for promise-based IndexedDB access.
 */

import { openDB, type IDBPDatabase } from 'idb'
import { DB_NAME, DB_VERSION, type SplitBillDB } from './schema'

let dbInstance: IDBPDatabase<SplitBillDB> | null = null

/**
 * Get (or create) the database instance.
 * Reuses a singleton connection for the session lifetime.
 */
export async function getDB(): Promise<IDBPDatabase<SplitBillDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<SplitBillDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Participants store
      if (!db.objectStoreNames.contains('participants')) {
        const participantStore = db.createObjectStore('participants', { keyPath: 'id' })
        participantStore.createIndex('by-name', 'name')
      }

      // Bills store
      if (!db.objectStoreNames.contains('splitBills')) {
        const billStore = db.createObjectStore('splitBills', { keyPath: 'id' })
        billStore.createIndex('by-updatedAt', 'updatedAt')
        billStore.createIndex('by-status', 'status')
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    },
  })

  return dbInstance
}

/**
 * Close the database connection (cleanup).
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
