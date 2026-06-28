/**
 * BillBreakdown — Full bill detail view with payment toggles
 *
 * Colorful and icon-rich for easy readability.
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
    <div className="space-y-6">
      {/* Bill meta cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetaCard
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>}
          iconColor="text-emerald-400"
          bgColor="bg-emerald-500/10 border-emerald-500/20"
          label="Total Bill"
          value={formatCurrency(totalBill)}
        />
        <MetaCard
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>}
          iconColor="text-feldora-accent"
          bgColor="bg-feldora-accent/10 border-feldora-accent/20"
          label="Method"
          value={formatSplitMode(payload.splitMode)}
        />
        <MetaCard
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
          iconColor="text-feldora-accent-secondary"
          bgColor="bg-feldora-accent-secondary/10 border-feldora-accent-secondary/20"
          label="People"
          value={`${payload.participants.length} people`}
        />
        <MetaCard
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          iconColor={paidCount === summaries.length ? 'text-emerald-400' : 'text-amber-400'}
          bgColor={paidCount === summaries.length ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-400/10 border-amber-400/20'}
          label="Status"
          value={`${paidCount}/${summaries.length} paid`}
        />
      </div>

      {/* Participant breakdown */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-xs text-white font-mono uppercase tracking-wider">
          <svg className="w-3.5 h-3.5 text-feldora-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Breakdown
        </h3>
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

function MetaCard({
  icon,
  iconColor,
  bgColor,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode
  iconColor: string
  bgColor: string
  label: string
  value: string
}>) {
  return (
    <div className={`rounded px-3 py-2.5 border ${bgColor}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={iconColor}>{icon}</span>
        <p className="text-[10px] text-feldora-muted uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm text-feldora-text font-semibold">{value}</p>
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
  const isPaid = summary.status === 'paid'

  return (
    <div className={`border rounded p-3 space-y-2 transition-colors ${
      isPaid
        ? 'border-emerald-500/20 bg-emerald-500/5'
        : 'border-feldora-border/30 bg-feldora-surface-light/20'
    }`}>
      {/* Name + owes + payment toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Person icon avatar */}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-feldora-accent/15 text-feldora-accent'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <span className="text-sm text-feldora-text font-semibold">{summary.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-semibold ${
            isPaid ? 'text-emerald-400 line-through opacity-60' : 'text-feldora-accent'
          }`}>
            {formatCurrency(summary.owes)}
          </span>
          <PaymentToggle status={summary.status} onToggle={onToggle} />
        </div>
      </div>

      {/* Items list */}
      {summary.items.length > 0 && (
        <div className="space-y-1 pl-8">
          {summary.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-feldora-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
                <span className="text-feldora-text-secondary">{item.name || 'Unnamed item'}</span>
              </div>
              <span className="text-feldora-muted font-mono">{formatCurrency(item.price)}</span>
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
