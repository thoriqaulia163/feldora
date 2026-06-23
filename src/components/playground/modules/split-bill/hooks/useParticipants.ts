/**
 * useParticipants — Global reusable participant list
 *
 * Provides CRUD operations + loading/error state.
 * Participants are shared across all bills.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getAllParticipants,
  addParticipant as dbAddParticipant,
  updateParticipant as dbUpdateParticipant,
  deleteParticipant as dbDeleteParticipant,
  participantNameExists,
  type ParticipantRecord,
} from '../db'

interface UseParticipantsReturn {
  participants: ParticipantRecord[]
  loading: boolean
  error: string | null
  addParticipant: (name: string) => Promise<ParticipantRecord | null>
  updateParticipant: (id: string, name: string) => Promise<boolean>
  deleteParticipant: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useParticipants(): UseParticipantsReturn {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadParticipants = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllParticipants()
      setParticipants(data)
      setError(null)
    } catch (err) {
      setError('Failed to load people')
      console.error('[useParticipants] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadParticipants()
  }, [loadParticipants])

  const addParticipant = useCallback(async (name: string): Promise<ParticipantRecord | null> => {
    const trimmed = name.trim()
    if (!trimmed) return null

    const exists = await participantNameExists(trimmed)
    if (exists) {
      setError('Name already exists')
      return null
    }

    try {
      const record = await dbAddParticipant(trimmed)
      setParticipants((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)))
      setError(null)
      return record
    } catch (err) {
      setError('Failed to add person')
      console.error('[useParticipants] add error:', err)
      return null
    }
  }, [])

  const updateParticipant = useCallback(async (id: string, name: string): Promise<boolean> => {
    const trimmed = name.trim()
    if (!trimmed) return false

    const exists = await participantNameExists(trimmed)
    if (exists) {
      setError('Name already exists')
      return false
    }

    try {
      const updated = await dbUpdateParticipant(id, trimmed)
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
  }, [])

  const deleteParticipant = useCallback(async (id: string): Promise<void> => {
    try {
      // Optimistic UI
      setParticipants((prev) => prev.filter((p) => p.id !== id))
      await dbDeleteParticipant(id)
    } catch (err) {
      // Rollback on failure
      await loadParticipants()
      setError('Failed to delete person')
      console.error('[useParticipants] delete error:', err)
    }
  }, [loadParticipants])

  return {
    participants,
    loading,
    error,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    refresh: loadParticipants,
  }
}
