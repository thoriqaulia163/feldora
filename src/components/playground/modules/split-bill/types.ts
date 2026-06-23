/**
 * Split Bill Module — Core Types
 *
 * Model: Each participant in a bill owns a list of items (name + price).
 * The total bill = sum of all items across all participants.
 * Split mode determines how "total per person" is calculated.
 */

// ─── Split Modes ─────────────────────────────────────────────────────
export type SplitMode = 'equal' | 'custom' | 'itemized'

// ─── Item ────────────────────────────────────────────────────────────
/** A single item belonging to a participant */
export interface BillItem {
  id: string
  name: string
  price: number
}

// ─── Participant in Bill ─────────────────────────────────────────────
/** A participant snapshot inside a bill, with their items */
export interface BillParticipant {
  participantId: string
  name: string
  items: BillItem[]
  /** Manual total override (used in custom mode only) */
  customTotal?: number
}

// ─── Payment ─────────────────────────────────────────────────────────
export type PaymentStatus = 'paid' | 'unpaid'

export interface PaymentEntry {
  participantId: string
  status: PaymentStatus
}

// ─── Bill Payload (decrypted) ────────────────────────────────────────
/**
 * The full decrypted content of a bill.
 * Encrypted with DEK before storage in IndexedDB.
 */
export interface BillPayload {
  /** How the bill is split */
  splitMode: SplitMode

  /** Participants with their items */
  participants: BillParticipant[]

  /** Per-participant payment status */
  payments: PaymentEntry[]
}

// ─── Computed Values (for display) ───────────────────────────────────

/** Per-participant breakdown for display */
export interface ParticipantSummary {
  participantId: string
  name: string
  items: BillItem[]
  itemsTotal: number
  owes: number // depends on split mode
  status: PaymentStatus
}

/** Bill with decrypted and computed data (for detail view) */
export interface DecryptedBill {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  status: 'active' | 'archived'
  payload: BillPayload
}

// ─── Form State ──────────────────────────────────────────────────────

/** State for create/edit bill form */
export interface BillFormState {
  title: string
  splitMode: SplitMode
  participants: BillParticipant[]
}

/** Validation errors for bill form */
export interface BillFormErrors {
  title?: string
  participants?: string
  items?: string
  customTotals?: string
}
