/**
 * useBills + useBillDetail — Bill list & detail hooks
 *
 * List: decrypt titles only (no payload decrypt for performance).
 * Detail: decrypt full payload on demand.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getActiveBills,
  deleteBill as dbDeleteBill,
  getBillRecord,
  decryptBillTitle,
  decryptBillPayload,
  updateBill,
  type BillListRecord,
} from '../db'
import type { BillPayload, DecryptedBill, PaymentStatus } from '../types'

// ─── useBills (list — title only, no payload decrypt) ────────────────

export interface BillListItem {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

interface UseBillsReturn {
  bills: BillListItem[]
  loading: boolean
  error: string | null
  deleteBill: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useBills(dek: CryptoKey | null): UseBillsReturn {
  const [bills, setBills] = useState<BillListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBills = useCallback(async () => {
    if (!dek) { setLoading(false); return }

    try {
      setLoading(true)
      const records = await getActiveBills(dek)
      setBills(records.map((r) => ({ id: r.id, title: r.title, createdAt: r.createdAt, updatedAt: r.updatedAt })))
      setError(null)
    } catch (err) {
      setError('Failed to load bills')
      console.error('[useBills] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [dek])

  useEffect(() => { loadBills() }, [loadBills])

  const deleteBill = useCallback(async (id: string): Promise<void> => {
    try {
      setBills((prev) => prev.filter((b) => b.id !== id))
      await dbDeleteBill(id)
    } catch (err) {
      await loadBills()
      setError('Failed to delete bill')
      console.error('[useBills] delete error:', err)
    }
  }, [loadBills])

  return { bills, loading, error, deleteBill, refresh: loadBills }
}

// ─── useBillDetail (full payload decrypt) ────────────────────────────

interface UseBillDetailReturn {
  bill: DecryptedBill | null
  loading: boolean
  error: string | null
  togglePayment: (participantId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useBillDetail(id: string, dek: CryptoKey | null): UseBillDetailReturn {
  const [bill, setBill] = useState<DecryptedBill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBill = useCallback(async () => {
    if (!dek || !id) { setLoading(false); return }

    try {
      setLoading(true)
      const record = await getBillRecord(id)
      if (!record) { setError('Bill not found'); setLoading(false); return }

      const title = await decryptBillTitle(record, dek)
      const payload = await decryptBillPayload<BillPayload>(record.encryptedPayload, dek)
      setBill({ id: record.id, title, createdAt: record.createdAt, updatedAt: record.updatedAt, status: record.status, payload })
      setError(null)
    } catch (err) {
      setError('Failed to load bill detail')
      console.error('[useBillDetail] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [id, dek])

  useEffect(() => { loadBill() }, [loadBill])

  const togglePayment = useCallback(
    async (participantId: string): Promise<void> => {
      if (!bill || !dek) return

      const updatedPayments = bill.payload.payments.map((p) => {
        if (p.participantId !== participantId) return p
        const newStatus: PaymentStatus = p.status === 'paid' ? 'unpaid' : 'paid'
        return { ...p, status: newStatus }
      })

      const updatedPayload: BillPayload = { ...bill.payload, payments: updatedPayments }
      setBill((prev) => (prev ? { ...prev, payload: updatedPayload, updatedAt: Date.now() } : prev))

      try {
        await updateBill(bill.id, bill.title, updatedPayload, dek)
      } catch (err) {
        await loadBill()
        console.error('[useBillDetail] toggle payment error:', err)
      }
    },
    [bill, dek, loadBill]
  )

  return { bill, loading, error, togglePayment, refresh: loadBill }
}
