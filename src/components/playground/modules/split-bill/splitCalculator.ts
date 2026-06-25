/**
 * Split Calculator — Equal / Custom / Itemized
 *
 * Each participant has items. The total bill = sum of all items across all participants.
 * Split mode determines "total per person":
 *   - Equal: totalBill / participantCount
 *   - Custom: user-entered customTotal per person (must sum to totalBill)
 *   - Itemized: sum of that person's own items
 */

import type { BillItem, BillParticipant, BillPayload, ParticipantSummary } from './types'

/**
 * Compute total price of a list of items.
 */
export function sumItems(items: BillItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

/**
 * Compute total bill amount (all items from all participants).
 */
export function computeTotalBill(participants: BillParticipant[]): number {
  return participants.reduce((sum, p) => sum + sumItems(p.items), 0)
}

/**
 * Compute "owes" per participant based on split mode.
 */
export function computeOwes(
  participant: BillParticipant,
  allParticipants: BillParticipant[],
  splitMode: string
): number {
  switch (splitMode) {
    case 'equal': {
      const total = computeTotalBill(allParticipants)
      const count = allParticipants.length
      return count > 0 ? Math.round((total / count) * 100) / 100 : 0
    }
    case 'custom':
      return participant.customTotal ?? 0
    case 'itemized':
      return sumItems(participant.items)
    default:
      return 0
  }
}

/**
 * Compute sum of all customTotals across participants.
 */
export function computeCustomTotalsSum(participants: BillParticipant[]): number {
  return participants.reduce((sum, p) => sum + (p.customTotal ?? 0), 0)
}

/**
 * Generate full summary for bill display.
 */
export function computeBillSummary(payload: BillPayload): ParticipantSummary[] {
  return payload.participants.map((p) => {
    const payment = payload.payments.find((pm) => pm.participantId === p.participantId)
    return {
      participantId: p.participantId,
      name: p.name,
      items: p.items,
      itemsTotal: sumItems(p.items),
      owes: computeOwes(p, payload.participants, payload.splitMode),
      status: payment?.status ?? 'unpaid',
    }
  })
}

/**
 * Generate short summary text for bill cards.
 */
export function generateBillSummaryText(
  participants: BillParticipant[],
  splitMode: string
): string {
  const people = `${participants.length} people`
  const total = formatCurrency(computeTotalBill(participants))
  const mode = splitMode.charAt(0).toUpperCase() + splitMode.slice(1)
  return `${people} · ${total} · ${mode}`
}

/**
 * Format number as Indonesian Rupiah.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
