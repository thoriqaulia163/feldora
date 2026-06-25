/**
 * IndexedDB Connection
 *
 * Opens and upgrades the split-bill database.
 * Uses `idb` for promise-based IndexedDB access.
 */

import { openDB, deleteDB, type IDBPDatabase } from 'idb'
import { DB_NAME, DB_VERSION, type SplitBillDB } from './schema'

let dbInstance: IDBPDatabase<SplitBillDB> | null = null

/**
 * Get (or create) the database instance.
 * Reuses a singleton connection for the session lifetime.
 */
export async function getDB(): Promise<IDBPDatabase<SplitBillDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<SplitBillDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Fresh install or upgrade from v1
      if (oldVersion < 1) {
        db.createObjectStore('participants', { keyPath: 'id' })
        const billStore = db.createObjectStore('splitBills', { keyPath: 'id' })
        billStore.createIndex('by-updatedAt', 'updatedAt')
        billStore.createIndex('by-status', 'status')
        db.createObjectStore('settings', { keyPath: 'key' })
      }

      // v1 → v2: participants no longer have 'by-name' index (name is encrypted)
      if (oldVersion === 1) {
        // Delete old stores and recreate (data was encrypted with old schema anyway)
        if (db.objectStoreNames.contains('participants')) {
          db.deleteObjectStore('participants')
        }
        db.createObjectStore('participants', { keyPath: 'id' })

        if (db.objectStoreNames.contains('splitBills')) {
          db.deleteObjectStore('splitBills')
        }
        const billStore = db.createObjectStore('splitBills', { keyPath: 'id' })
        billStore.createIndex('by-updatedAt', 'updatedAt')
        billStore.createIndex('by-status', 'status')
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

/**
 * Delete the entire database (factory reset).
 */
export async function deleteDatabase(): Promise<void> {
  closeDB()
  await deleteDB(DB_NAME)
}
