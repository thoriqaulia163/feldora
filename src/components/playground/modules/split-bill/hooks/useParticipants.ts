/**
 * useParticipants — Global reusable participant list
 *
 * Names are encrypted in DB, decrypted in memory.
 * Requires DEK to operate.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getAllParticipants,
  addParticipant as dbAddParticipant,
  updateParticipant as dbUpdateParticipant,
  deleteParticipant as dbDeleteParticipant,
  participantNameExists,
  type DecryptedParticipant,
} from '../db'

interface UseParticipantsReturn {
  participants: DecryptedParticipant[]
  loading: boolean
  error: string | null
  addParticipant: (name: string) => Promise<DecryptedParticipant | null>
  updateParticipant: (id: string, name: string) => Promise<boolean>
  deleteParticipant: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useParticipants(dek: CryptoKey | null): UseParticipantsReturn {
  const [participants, setParticipants] = useState<DecryptedParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadParticipants = useCallback(async () => {
    if (!dek) { setLoading(false); return }
    try {
      setLoading(true)
      const data = await getAllParticipants(dek)
      setParticipants(data)
      setError(null)
    } catch (err) {
      setError('Failed to load people')
      console.error('[useParticipants] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [dek])

  useEffect(() => { loadParticipants() }, [loadParticipants])

  const addParticipant = useCallback(async (name: string): Promise<DecryptedParticipant | null> => {
    if (!dek) return null
    const trimmed = name.trim()
    if (!trimmed) return null

    const exists = await participantNameExists(trimmed, dek)
    if (exists) {
      setError('Name already exists')
      return null
    }

    try {
      const record = await dbAddParticipant(trimmed, dek)
      // Update memory with raw decrypted data
      setParticipants((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)))
      setError(null)
      return record
    } catch (err) {
      setError('Failed to add person')
      console.error('[useParticipants] add error:', err)
      return null
    }
  }, [dek])

  const updateParticipant = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!dek) return false
    const trimmed = name.trim()
    if (!trimmed) return false

    const exists = await participantNameExists(trimmed, dek)
    if (exists) {
      setError('Name already exists')
      return false
    }

    try {
      const updated = await dbUpdateParticipant(id, trimmed, dek)
      if (!updated) return false
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      )
      setError(null)
      return true
    } catch (err) {
      setError('Failed to rename person')
      console.error('[useParticipants] update error:', err)
      return false
    }
  }, [dek])

  const deleteParticipant = useCallback(async (id: string): Promise<void> => {
    try {
      setParticipants((prev) => prev.filter((p) => p.id !== id))
      await dbDeleteParticipant(id)
    } catch (err) {
      await loadParticipants()
      setError('Failed to delete person')
      console.error('[useParticipants] delete error:', err)
    }
  }, [loadParticipants])

  return { participants, loading, error, addParticipant, updateParticipant, deleteParticipant, refresh: loadParticipants }
}
