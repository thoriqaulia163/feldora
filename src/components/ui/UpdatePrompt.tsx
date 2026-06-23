/**
 * UpdatePrompt — Shown when a new Service Worker version is ready.
 * Uses a persistent banner (not auto-dismiss) with "Update now" action.
 */

import { useState, useEffect, useCallback } from 'react'

interface UpdatePromptProps {
  version?: string
}

export function UpdatePrompt({ version }: UpdatePromptProps) {
  const [show, setShow] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Listen for SW update messages (from SW postMessage)
    const msgHandler = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_READY') {
        setShow(true)
      }
    }

    // Listen for custom event (from inline registration script, fires before React hydrates)
    const eventHandler = () => setShow(true)

    navigator.serviceWorker?.addEventListener('message', msgHandler)
    window.addEventListener('sw-update-ready', eventHandler)

    // Check if SW is already waiting on mount
    navigator.serviceWorker?.ready.then((reg) => {
      if (reg.waiting) setShow(true)
    })

    return () => {
      navigator.serviceWorker?.removeEventListener('message', msgHandler)
      window.removeEventListener('sw-update-ready', eventHandler)
    }
  }, [])

  const handleUpdate = useCallback(() => {
    setUpdating(true)
    // Tell the waiting SW to activate
    navigator.serviceWorker?.controller?.postMessage({ type: 'SKIP_WAITING' })

    // Also try sending to the waiting registration
    navigator.serviceWorker?.ready.then((reg) => {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
    })

    // Listen for controller change, then reload
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    // Fallback: reload after 3s if controllerchange doesn't fire
    setTimeout(() => window.location.reload(), 3000)
  }, [])

  const handleDismiss = useCallback(() => {
    setShow(false)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-6 left-6 z-[120] max-w-sm animate-fade-up">
      <div className="bg-feldora-surface border border-feldora-accent/40 p-4 shadow-lg shadow-feldora-accent-glow clip-notch-br">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-feldora-accent animate-pulse-slow" />
          <span className="text-feldora-text font-mono text-[10px] uppercase tracking-wider">
            New version available
          </span>
        </div>

        {/* Message */}
        <p className="text-feldora-text-secondary text-xs leading-relaxed mb-3">
          {version
            ? `Version ${version} is ready. Update for the latest features and improvements.`
            : 'A new version is ready. Update for the latest features and improvements.'}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="btn-angular-primary !px-4 !py-1.5 !text-[10px] disabled:opacity-60"
          >
            {updating ? 'Updating...' : 'Update now'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider hover:text-feldora-text-secondary transition-colors px-2 py-1.5"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
