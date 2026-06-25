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
import { ImportQRModal } from '../components/ImportQRModal'
import type { DecryptedParticipant } from '../db'
import { createBill } from '../db'
import type { BillListItem } from '../hooks'
import type { QRBillData } from '../qr'

export default function HomePage() {
  const { status, dek, pinEnabled, enablePIN, disablePIN } = useCryptoContext()
  const { participants, loading: loadingPeople, addParticipant, deleteParticipant } = useParticipants(dek)
  const { bills, loading: loadingBills, deleteBill } = useBills(dek)
  const navigate = useNavigate()

  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showImportQR, setShowImportQR] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [billSearch, setBillSearch] = useState('')

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

  async function handleImportQR(data: QRBillData) {
    if (!dek) return
    const record = await createBill(data.title, data.payload, dek)
    navigate({ to: '/playground/split-bill/detail/$id', params: { id: record.id } })
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
          <h2 className="flex items-center gap-2 text-sm font-semibold text-feldora-text uppercase tracking-wide">
            <svg className="w-4 h-4 text-feldora-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
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
          <h2 className="flex items-center gap-2 text-sm font-semibold text-feldora-text uppercase tracking-wide">
            <svg className="w-4 h-4 text-feldora-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Bills ({bills.length})
          </h2>
          <Link
            to="/playground/split-bill/create"
            className="text-xs text-feldora-accent hover:text-feldora-accent/80 font-semibold transition-colors"
          >
            + Create
          </Link>
        </div>

        {/* Bill search + import QR */}
        {bills.length > 0 && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={billSearch}
              onChange={(e) => setBillSearch(e.target.value)}
              placeholder="Search bills..."
              className="flex-1 bg-feldora-surface-light border border-feldora-border rounded px-3 py-1.5 text-xs text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowImportQR(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-feldora-accent-secondary border border-feldora-accent-secondary/40 hover:bg-feldora-accent-secondary/10 rounded transition-colors"
              aria-label="Import bill from QR"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
              </svg>
              QR
            </button>
          </div>
        )}

        <BillsContent
          loading={loadingBills}
          bills={bills.filter((b) => b.title.toLowerCase().includes(billSearch.toLowerCase()))}
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

      {/* Import QR Modal */}
      <ImportQRModal
        open={showImportQR}
        onClose={() => setShowImportQR(false)}
        dek={dek}
        onImport={handleImportQR}
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
  participants: DecryptedParticipant[]
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
