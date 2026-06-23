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
import type { ParticipantRecord } from '../db'

interface BillFormProps {
  readonly dek: CryptoKey
  readonly existingBill?: DecryptedBill
  readonly onSuccess: (billId: string) => void
  readonly onCancel: () => void
}

export function BillForm({ dek, existingBill, onSuccess, onCancel }: BillFormProps) {
  const { participants: globalParticipants, addParticipant } = useParticipants()
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

  function handleSelectPerson(p: ParticipantRecord) {
    const exists = form.participants.some((fp) => fp.participantId === p.id)
    if (!exists) {
      addParticipantToForm(p.id, p.name)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Title */}
      <FieldGroup label="Title">
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
      <FieldGroup label="Split Method">
        <SplitModeSelector value={form.splitMode} onChange={setSplitMode} />
        <p className="text-[11px] text-feldora-muted mt-1.5">
          {form.splitMode === 'equal' && 'Total bill divided equally among all people'}
          {form.splitMode === 'custom' && 'Set how much each person pays manually'}
          {form.splitMode === 'itemized' && 'Each person pays for their own items'}
        </p>
      </FieldGroup>

      {/* 3. Participants — searchable dropdown */}
      <FieldGroup label="People">
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
  globalParticipants: ParticipantRecord[]
  selectedIds: string[]
  onSelect: (p: ParticipantRecord) => void
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

  function handleSelect(p: ParticipantRecord) {
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
      {open && (filtered.length > 0 || canAddNew) && (
        <div className="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto bg-feldora-surface border border-feldora-border rounded shadow-lg" style={{ scrollbarWidth: 'thin' }}>
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
          {canAddNew && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full text-left px-3 py-2 text-sm text-feldora-accent border-t border-feldora-border/30 hover:bg-feldora-surface-light transition-colors"
            >
              + Add &quot;{query.trim()}&quot;
            </button>
          )}
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
        <span className="text-sm font-semibold text-feldora-text">{participant.name}</span>
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
  children,
}: Readonly<{
  label: string
  children: React.ReactNode
}>) {
  return (
    <div>
      <p className="block text-xs text-white font-mono uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}
