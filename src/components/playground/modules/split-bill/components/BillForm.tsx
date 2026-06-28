/**
 * BillForm — Shared form for Create and Edit bill
 *
 * Flow:
 * 1. Title
 * 2. Split mode selector
 * 3. Participants (searchable dropdown from global list + add new)
 * 4. Per-person: items (name + price) + computed/custom total
 * 5. Bill total (read-only, auto-computed)
 */

import { useState, useRef, useEffect } from 'react'
import { useToast } from '~/components/ui/Toast'
import { useParticipants } from '../hooks'
import { useSplitForm } from '../hooks/useSplitForm'
import { computeTotalBill, computeOwes, sumItems, formatCurrency } from '../splitCalculator'
import { validateBillForm, hasErrors, collectErrorMessages } from '../validation'
import { SplitModeSelector } from './SplitModeSelector'
import type { BillParticipant, DecryptedBill } from '../types'
import type { DecryptedParticipant } from '../db'

interface BillFormProps {
  readonly dek: CryptoKey
  readonly existingBill?: DecryptedBill
  readonly onSuccess: (billId: string) => void
  readonly onCancel: () => void
}

export function BillForm({ dek, existingBill, onSuccess, onCancel }: BillFormProps) {
  const { participants: globalParticipants, addParticipant } = useParticipants(dek)
  const { toast } = useToast()

  const {
    form,
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
    submit,
  } = useSplitForm(existingBill)

  const totalBill = computeTotalBill(form.participants)

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    // Validate and show all errors via toast
    const formErrors = validateBillForm(form)
    if (hasErrors(formErrors)) {
      const messages = collectErrorMessages(formErrors)
      for (const msg of messages) {
        toast(msg, 'error')
      }
      return
    }
    const billId = await submit(dek)
    if (billId) onSuccess(billId)
  }

  async function handleAddNewPerson(name: string) {
    const record = await addParticipant(name)
    if (record) {
      addParticipantToForm(record.id, record.name)
    }
  }

  function handleSelectPerson(p: DecryptedParticipant) {
    const exists = form.participants.some((fp) => fp.participantId === p.id)
    if (!exists) {
      addParticipantToForm(p.id, p.name)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Title */}
      <FieldGroup label="Title" icon={<svg className="w-3.5 h-3.5 text-feldora-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>}>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lunch, groceries, etc..."
          className="w-full bg-feldora-surface-light border border-feldora-border rounded px-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
          maxLength={100}
        />
      </FieldGroup>

      {/* 2. Split Mode */}
      <FieldGroup label="Split Method" icon={<svg className="w-3.5 h-3.5 text-feldora-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>}>
        <SplitModeSelector value={form.splitMode} onChange={setSplitMode} />
        <p className="text-[11px] text-feldora-muted mt-1.5">
          {form.splitMode === 'equal' && 'Total bill divided equally among all people'}
          {form.splitMode === 'custom' && 'Set how much each person pays manually'}
          {form.splitMode === 'itemized' && 'Each person pays for their own items'}
        </p>
      </FieldGroup>

      {/* 3. Participants — searchable dropdown */}
      <FieldGroup label="People" icon={<svg className="w-3.5 h-3.5 text-feldora-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}>
        <ParticipantSearch
          globalParticipants={globalParticipants}
          selectedIds={form.participants.map((p) => p.participantId)}
          onSelect={handleSelectPerson}
          onAddNew={handleAddNewPerson}
        />
        {/* Selected people chips */}
        {form.participants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.participants.map((p) => (
              <span
                key={p.participantId}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-feldora-accent/15 border border-feldora-accent/40 text-feldora-accent"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => removeParticipantFromForm(p.participantId)}
                  className="hover:text-red-400 transition-colors"
                  aria-label={`Remove ${p.name}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </FieldGroup>

      {/* 4. Per-person items */}
      {form.participants.length > 0 && (
        <div className="space-y-4">
          {form.participants.map((participant) => (
            <ParticipantCard
              key={participant.participantId}
              participant={participant}
              allParticipants={form.participants}
              splitMode={form.splitMode}
              onAddItem={() => addItemToParticipant(participant.participantId)}
              onRemoveItem={(itemId) => removeItem(participant.participantId, itemId)}
              onUpdateItemName={(itemId, name) => updateItemName(participant.participantId, itemId, name)}
              onUpdateItemPrice={(itemId, price) => updateItemPrice(participant.participantId, itemId, price)}
              onSetCustomTotal={(amount) => setCustomTotal(participant.participantId, amount)}
            />
          ))}
        </div>
      )}

      {/* 5. Total bill (read-only) */}
      {totalBill > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-feldora-surface-light/50 border border-feldora-border/30 rounded">
          <span className="text-sm text-feldora-text-secondary">Total Bill</span>
          <span className="text-lg font-bold text-feldora-text">{formatCurrency(totalBill)}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-feldora-border/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-angular-primary px-6 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
        >
          {submitting ? 'Saving...' : getSubmitLabel(!!existingBill)}
        </button>
      </div>
    </form>
  )
}

// ─── ParticipantSearch (searchable dropdown) ─────────────────────────

function ParticipantSearch({
  globalParticipants,
  selectedIds,
  onSelect,
  onAddNew,
}: Readonly<{
  globalParticipants: DecryptedParticipant[]
  selectedIds: string[]
  onSelect: (p: DecryptedParticipant) => void
  onAddNew: (name: string) => void
}>) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = globalParticipants.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  )

  const canAddNew = query.trim().length > 0 && !globalParticipants.some(
    (p) => p.name.toLowerCase() === query.trim().toLowerCase()
  )

  function handleSelect(p: DecryptedParticipant) {
    onSelect(p)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleAddNew() {
    onAddNew(query.trim())
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-feldora-muted" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search or add person..."
          className="w-full bg-feldora-surface-light border border-feldora-border rounded pl-9 pr-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto bg-feldora-surface border border-feldora-border rounded shadow-lg" style={{ scrollbarWidth: 'thin' }}>
          {/* Always show +Add as first option */}
          {canAddNew && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full text-left px-3 py-2 text-sm text-feldora-accent hover:bg-feldora-surface-light transition-colors"
            >
              + Add &quot;{query.trim()}&quot;
            </button>
          )}
          {!canAddNew && query.trim().length === 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="w-full text-left px-3 py-2 text-sm text-feldora-muted cursor-default"
              disabled
            >
              Type a name to add...
            </button>
          )}
          {/* Existing participants */}
          {filtered.slice(0, 10).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 text-sm text-feldora-text hover:bg-feldora-surface-light transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ParticipantCard ─────────────────────────────────────────────────

function ParticipantCard({
  participant,
  allParticipants,
  splitMode,
  onAddItem,
  onRemoveItem,
  onUpdateItemName,
  onUpdateItemPrice,
  onSetCustomTotal,
}: Readonly<{
  participant: BillParticipant
  allParticipants: BillParticipant[]
  splitMode: string
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateItemName: (itemId: string, name: string) => void
  onUpdateItemPrice: (itemId: string, price: number) => void
  onSetCustomTotal: (amount: number) => void
}>) {
  const itemsTotal = sumItems(participant.items)
  const owes = computeOwes(participant, allParticipants, splitMode)

  return (
    <div className="border border-feldora-border/40 rounded p-4 space-y-3">
      {/* Person header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-feldora-accent/15 text-feldora-accent">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-feldora-text">{participant.name}</span>
        </div>
        <span className="text-xs text-feldora-text-secondary font-mono">
          {formatCurrency(owes)}
        </span>
      </div>

      {/* Items */}
      {participant.items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdateItemName(item.id, e.target.value)}
            placeholder="Item name..."
            className="flex-1 bg-feldora-surface-light border border-feldora-border rounded px-2.5 py-1.5 text-xs text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
          />
          <div className="relative w-24">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-feldora-muted">Rp</span>
            <input
              type="number"
              min={0}
              value={item.price || ''}
              onChange={(e) => onUpdateItemPrice(item.id, Number.parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-feldora-surface-light border border-feldora-border rounded pl-6 pr-2 py-1.5 text-xs text-feldora-text text-right placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            className="text-feldora-muted hover:text-red-400 transition-colors p-0.5"
            aria-label="Remove item"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Add item button */}
      <button
        type="button"
        onClick={onAddItem}
        className="text-[11px] text-feldora-accent hover:text-feldora-accent/80 transition-colors"
      >
        + Add Item
      </button>

      {/* Item subtotal */}
      {participant.items.length > 0 && itemsTotal > 0 && (
        <p className="text-[10px] text-feldora-muted border-t border-feldora-border/20 pt-2">
          Subtotal: {formatCurrency(itemsTotal)}
        </p>
      )}

      {/* Custom mode: manual total input */}
      {splitMode === 'custom' && (
        <div className="border-t border-feldora-border/20 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-feldora-text-secondary">Pays:</span>
            <div className="relative flex-1 max-w-32">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-feldora-muted">Rp</span>
              <input
                type="number"
                min={0}
                value={participant.customTotal || ''}
                onChange={(e) => onSetCustomTotal(Number.parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-feldora-surface-light border border-feldora-border rounded pl-6 pr-2 py-1 text-xs text-feldora-text text-right placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getSubmitLabel(isEdit: boolean): string {
  return isEdit ? 'Save Changes' : 'Create Bill'
}

function FieldGroup({
  label,
  icon,
  children,
}: Readonly<{
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}>) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-white font-mono uppercase tracking-wider mb-2">
        {icon}
        {label}
      </p>
      {children}
    </div>
  )
}
