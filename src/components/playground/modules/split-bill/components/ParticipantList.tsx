/**
 * ParticipantList — Scrollable list of global participants
 *
 * Fixed height with overflow scroll. Delete button always visible (mobile-friendly).
 * Delete triggers confirmation modal, not immediate removal.
 */

import { useState } from 'react'
import type { ParticipantRecord } from '../db'
import { DeleteConfirmModal } from './Modals'

interface ParticipantListProps {
  readonly participants: ParticipantRecord[]
  readonly onDelete: (id: string) => void
}

export function ParticipantList({ participants, onDelete }: ParticipantListProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  function handleConfirmDelete() {
    if (!deleteTarget) return
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <div className="h-48 overflow-y-scroll border border-feldora-accent-secondary/50 rounded p-2 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-3 py-2 bg-feldora-surface-light/50 border border-feldora-border/30 rounded hover:border-feldora-accent/20 transition-colors"
          >
            <span className="text-sm text-feldora-text truncate">{p.name}</span>
            <button
              type="button"
              onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
              aria-label={`Delete ${p.name}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        title="Delete Person?"
        message={`"${deleteTarget?.name ?? ''}" will be removed from the list. Existing bills are not affected.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
