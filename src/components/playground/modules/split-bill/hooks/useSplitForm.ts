/**
 * useSplitForm — Form state management for Create/Edit bill
 *
 * New model: each participant has items. No paidBy.
 * Total = sum of all items. Split mode determines per-person cost.
 */

import { useState, useCallback } from 'react'
import { createBill, updateBill } from '../db'
import { validateBillForm, hasErrors } from '../validation'
import type {
  BillFormState,
  BillFormErrors,
  BillItem,
  BillParticipant,
  BillPayload,
  DecryptedBill,
  SplitMode,
} from '../types'

function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyForm(): BillFormState {
  return {
    title: '',
    splitMode: 'equal',
    participants: [],
  }
}

function billToFormState(bill: DecryptedBill): BillFormState {
  return {
    title: bill.title,
    splitMode: bill.payload.splitMode,
    participants: bill.payload.participants,
  }
}

interface UseSplitFormReturn {
  form: BillFormState
  errors: BillFormErrors
  submitting: boolean

  setTitle: (title: string) => void
  setSplitMode: (mode: SplitMode) => void

  // Participant management
  addParticipantToForm: (participantId: string, name: string) => void
  removeParticipantFromForm: (participantId: string) => void

  // Item management (per participant)
  addItemToParticipant: (participantId: string) => void
  removeItem: (participantId: string, itemId: string) => void
  updateItemName: (participantId: string, itemId: string, name: string) => void
  updateItemPrice: (participantId: string, itemId: string, price: number) => void

  // Custom mode
  setCustomTotal: (participantId: string, amount: number) => void

  // Actions
  validate: () => boolean
  submit: (dek: CryptoKey) => Promise<string | null>
}

export function useSplitForm(existingBill?: DecryptedBill): UseSplitFormReturn {
  const [form, setForm] = useState<BillFormState>(
    existingBill ? billToFormState(existingBill) : createEmptyForm()
  )
  const [errors, setErrors] = useState<BillFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const setTitle = useCallback((title: string) => {
    setForm((prev) => ({ ...prev, title }))
    setErrors((prev) => ({ ...prev, title: undefined }))
  }, [])

  const setSplitMode = useCallback((splitMode: SplitMode) => {
    setForm((prev) => ({ ...prev, splitMode }))
    setErrors((prev) => ({ ...prev, customTotals: undefined }))
  }, [])

  // ─── Participant Management ────────────────────────────────────────

  const addParticipantToForm = useCallback((participantId: string, name: string) => {
    setForm((prev) => {
      const exists = prev.participants.some((p) => p.participantId === participantId)
      if (exists) return prev
      const newParticipant: BillParticipant = {
        participantId,
        name,
        items: [],
      }
      return { ...prev, participants: [...prev.participants, newParticipant] }
    })
    setErrors((prev) => ({ ...prev, participants: undefined }))
  }, [])

  const removeParticipantFromForm = useCallback((participantId: string) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.participantId !== participantId),
    }))
  }, [])

  // ─── Item Management ───────────────────────────────────────────────

  const addItemToParticipant = useCallback((participantId: string) => {
    const newItem: BillItem = { id: generateItemId(), name: '', price: 0 }
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.participantId === participantId
          ? { ...p, items: [...p.items, newItem] }
          : p
      ),
    }))
    setErrors((prev) => ({ ...prev, items: undefined }))
  }, [])

  const removeItem = useCallback((participantId: string, itemId: string) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.participantId === participantId
          ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
          : p
      ),
    }))
  }, [])

  const updateItemName = useCallback((participantId: string, itemId: string, name: string) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.participantId === participantId
          ? { ...p, items: p.items.map((i) => (i.id === itemId ? { ...i, name } : i)) }
          : p
      ),
    }))
  }, [])

  const updateItemPrice = useCallback((participantId: string, itemId: string, price: number) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.participantId === participantId
          ? { ...p, items: p.items.map((i) => (i.id === itemId ? { ...i, price } : i)) }
          : p
      ),
    }))
    setErrors((prev) => ({ ...prev, items: undefined }))
  }, [])

  // ─── Custom Mode ──────────────────────────────────────────────────

  const setCustomTotal = useCallback((participantId: string, amount: number) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.participantId === participantId ? { ...p, customTotal: amount } : p
      ),
    }))
    setErrors((prev) => ({ ...prev, customTotals: undefined }))
  }, [])

  // ─── Submit ────────────────────────────────────────────────────────

  const validate = useCallback((): boolean => {
    const formErrors = validateBillForm(form)
    setErrors(formErrors)
    return !hasErrors(formErrors)
  }, [form])

  const submit = useCallback(
    async (dek: CryptoKey): Promise<string | null> => {
      const formErrors = validateBillForm(form)
      setErrors(formErrors)
      if (hasErrors(formErrors)) return null

      setSubmitting(true)
      try {
        const payload: BillPayload = {
          splitMode: form.splitMode,
          participants: form.participants,
          // Edit resets all payments to unpaid
          payments: form.participants.map((p) => ({
            participantId: p.participantId,
            status: 'unpaid' as const,
          })),
        }

        if (existingBill) {
          const updated = await updateBill(existingBill.id, form.title, payload, dek)
          return updated ? existingBill.id : null
        }

        const created = await createBill(form.title, payload, dek)
        return created.id
      } catch (err) {
        console.error('[useSplitForm] submit error:', err)
        setErrors({ title: 'Failed to save bill' })
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [form, existingBill]
  )

  return {
    form,
    errors,
    submitting,
    setTitle,
    setSplitMode,
    addParticipantToForm,
    removeParticipantFromForm,
    addItemToParticipant,
    removeItem,
    updateItemName,
    updateItemPrice,
    setCustomTotal,
    validate,
    submit,
  }
}
