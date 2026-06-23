/**
 * BillBreakdown — Full bill detail view with payment toggles
 *
 * Shows: split mode, total, per-participant breakdown with items & payment status.
 */

import type { BillPayload, ParticipantSummary } from '../types'
import { computeBillSummary, computeTotalBill, formatCurrency } from '../splitCalculator'
import { PaymentToggle } from './PaymentToggle'

interface BillBreakdownProps {
  readonly payload: BillPayload
  readonly onTogglePayment: (participantId: string) => void
}

export function BillBreakdown({ payload, onTogglePayment }: BillBreakdownProps) {
  const summaries = computeBillSummary(payload)
  const totalBill = computeTotalBill(payload.participants)
  const paidCount = summaries.filter((s) => s.status === 'paid').length

  return (
    <div className="space-y-5">
      {/* Bill meta */}
      <div className="grid grid-cols-2 gap-3">
        <MetaItem label="Total Bill" value={formatCurrency(totalBill)} />
        <MetaItem label="Metode" value={formatSplitMode(payload.splitMode)} />
        <MetaItem label="Peserta" value={`${payload.participants.length} orang`} />
        <MetaItem label="Status" value={`${paidCount}/${summaries.length} lunas`} />
      </div>

      {/* Participant breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs text-white font-mono uppercase tracking-wider">Breakdown</h3>
        {summaries.map((summary) => (
          <ParticipantRow
            key={summary.participantId}
            summary={summary}
            onToggle={() => onTogglePayment(summary.participantId)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function MetaItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="bg-feldora-surface-light/30 rounded px-3 py-2">
      <p className="text-[10px] text-feldora-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm text-feldora-text font-semibold mt-0.5">{value}</p>
    </div>
  )
}

function ParticipantRow({
  summary,
  onToggle,
}: Readonly<{
  summary: ParticipantSummary
  onToggle: () => void
}>) {
  return (
    <div className="border border-feldora-border/20 rounded p-3 space-y-2">
      {/* Name + owes + payment toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-feldora-text font-semibold">{summary.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-feldora-text-secondary">
            {formatCurrency(summary.owes)}
          </span>
          <PaymentToggle status={summary.status} onToggle={onToggle} />
        </div>
      </div>

      {/* Items list */}
      {summary.items.length > 0 && (
        <div className="space-y-0.5 pl-2 border-l-2 border-feldora-border/20">
          {summary.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[11px]">
              <span className="text-feldora-text-secondary">{item.name || 'Item'}</span>
              <span className="text-feldora-muted">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatSplitMode(mode: string): string {
  switch (mode) {
    case 'equal': return 'Equal'
    case 'custom': return 'Custom'
    case 'itemized': return 'Itemized'
    default: return mode
  }
}
