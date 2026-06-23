/**
 * Modals — ParticipantModal + DeleteConfirmModal
 */

import { useState, useRef, useEffect } from 'react'

// ─── ParticipantModal ────────────────────────────────────────────────

interface ParticipantModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onSubmit: (name: string) => Promise<boolean>
  readonly initialName?: string
  readonly title?: string
}

export function ParticipantModal({
  open,
  onClose,
  onSubmit,
  initialName = '',
  title = 'Add Person',
}: ParticipantModalProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, initialName])

  if (!open) return null

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name cannot be empty')
      return
    }

    setLoading(true)
    setError('')
    const success = await onSubmit(trimmed)
    setLoading(false)

    if (success) {
      setName('')
      onClose()
    } else {
      setError('Name already exists')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-sm card-polygon p-6 animate-fade-in">
        <h3 className="text-feldora-text font-bold text-lg mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="participant-name" className="block text-xs text-white font-mono uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              ref={inputRef}
              id="participant-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Enter name..."
              className="w-full bg-feldora-surface-light border border-feldora-border rounded px-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
              maxLength={50}
              disabled={loading}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="btn-angular-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── DeleteConfirmModal ──────────────────────────────────────────────

interface DeleteConfirmModalProps {
  readonly open: boolean
  readonly title: string
  readonly message: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

export function DeleteConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-sm card-polygon p-6 animate-fade-in">
        <h3 className="text-feldora-text font-bold text-lg mb-2">{title}</h3>
        <p className="text-feldora-text-secondary text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
