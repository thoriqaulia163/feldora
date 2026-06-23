/**
 * Split Bill Home Page — /playground/split-bill
 *
 * Sections:
 * 1. Header + settings icon (top-right) + back to playground
 * 2. People section (global participants list + add button)
 * 3. Bills section (encrypted bill list + create button)
 */

import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCryptoContext } from '../CryptoProvider'
import { useParticipants, useBills } from '../hooks'
import {
  EmptyState,
  ParticipantModal,
  ParticipantList,
  BillCard,
  DeleteConfirmModal,
  SkeletonParticipants,
  SkeletonBills,
} from '../components'
import { PinSetup } from '../components/PinSetup'
import type { ParticipantRecord } from '../db'
import type { BillListItem } from '../hooks'

export default function HomePage() {
  const { status, dek, pinEnabled, enablePIN, disablePIN } = useCryptoContext()
  const { participants, loading: loadingPeople, addParticipant, deleteParticipant } = useParticipants()
  const { bills, loading: loadingBills, deleteBill } = useBills(dek)
  const navigate = useNavigate()

  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  if (status === 'loading') {
    return (
      <div className="space-y-8">
        <HeaderSkeleton />
        <SkeletonParticipants />
        <SkeletonBills />
      </div>
    )
  }

  async function handleAddPerson(name: string): Promise<boolean> {
    const result = await addParticipant(name)
    return result !== null
  }

  function handleDeleteBillClick(id: string) {
    const bill = bills.find((b) => b.id === id)
    if (bill) setDeleteTarget({ id, title: bill.title })
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deleteBill(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/playground"
            className="text-xs text-feldora-muted hover:text-feldora-accent font-mono uppercase tracking-wider transition-colors"
          >
            &larr; Playground
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-feldora-text uppercase tracking-tight mt-1">
            Split <span className="text-feldora-accent">Bill</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-feldora-accent-secondary border border-feldora-accent-secondary/40 px-2 py-0.5 uppercase tracking-widest">
            Tool
          </span>
          {/* Settings icon */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 flex items-center justify-center rounded border border-feldora-border/40 text-feldora-muted hover:text-feldora-text hover:border-feldora-accent/30 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* People Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-feldora-text uppercase tracking-wide">
            People ({participants.length})
          </h2>
          <button
            type="button"
            onClick={() => setShowAddPerson(true)}
            className="text-xs text-feldora-accent hover:text-feldora-accent/80 font-semibold transition-colors"
          >
            + Add
          </button>
        </div>

        <PeopleContent
          loading={loadingPeople}
          participants={participants}
          onDelete={deleteParticipant}
          onAdd={() => setShowAddPerson(true)}
        />
      </section>

      {/* Bills Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-feldora-text uppercase tracking-wide">
            Bills ({bills.length})
          </h2>
          <Link
            to="/playground/split-bill/create"
            className="text-xs text-feldora-accent hover:text-feldora-accent/80 font-semibold transition-colors"
          >
            + Create
          </Link>
        </div>

        <BillsContent
          loading={loadingBills}
          bills={bills}
          onDelete={handleDeleteBillClick}
          onCreateBill={() => navigate({ to: '/playground/split-bill/create' })}
        />
      </section>

      {/* Modals */}
      <ParticipantModal
        open={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onSubmit={handleAddPerson}
      />

      <DeleteConfirmModal
        open={deleteTarget !== null}
        title="Delete Bill?"
        message={`"${deleteTarget?.title ?? ''}" will be permanently deleted.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        pinEnabled={pinEnabled}
        onEnablePIN={enablePIN}
        onDisablePIN={disablePIN}
      />
    </div>
  )
}

// ─── Settings Modal ──────────────────────────────────────────────────

function SettingsModal({
  open,
  onClose,
  pinEnabled,
  onEnablePIN,
  onDisablePIN,
}: Readonly<{
  open: boolean
  onClose: () => void
  pinEnabled: boolean
  onEnablePIN: (pin: string) => Promise<void>
  onDisablePIN: (pin: string) => Promise<boolean>
}>) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-sm card-polygon p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-feldora-text font-bold text-lg">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-feldora-muted hover:text-feldora-text transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PinSetup pinEnabled={pinEnabled} onEnablePIN={onEnablePIN} onDisablePIN={onDisablePIN} />
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-feldora-surface rounded mb-2" />
      <div className="h-8 w-40 bg-feldora-surface rounded" />
    </div>
  )
}

function PeopleContent({
  loading,
  participants,
  onDelete,
  onAdd,
}: Readonly<{
  loading: boolean
  participants: ParticipantRecord[]
  onDelete: (id: string) => void
  onAdd: () => void
}>) {
  if (loading) return <SkeletonParticipants />
  if (participants.length === 0) {
    return (
      <EmptyState
        icon="people"
        title="No people yet"
        description="Add people you usually split bills with"
        actionLabel="Add Person"
        onAction={onAdd}
      />
    )
  }
  return <ParticipantList participants={participants} onDelete={onDelete} />
}

function BillsContent({
  loading,
  bills,
  onDelete,
  onCreateBill,
}: Readonly<{
  loading: boolean
  bills: BillListItem[]
  onDelete: (id: string) => void
  onCreateBill: () => void
}>) {
  if (loading) return <SkeletonBills />
  if (bills.length === 0) {
    return (
      <EmptyState
        icon="bill"
        title="No bills yet"
        description="Create your first bill to start splitting"
        actionLabel="Create Bill"
        onAction={onCreateBill}
      />
    )
  }
  return (
    <div className="border border-feldora-accent/50 rounded p-2 space-y-2">
      {bills.map((bill) => (
        <BillCard key={bill.id} bill={bill} onDelete={onDelete} />
      ))}
    </div>
  )
}
