import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message }])

    // Auto dismiss setelah 4 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const TYPE_STYLES: Record<ToastType, { border: string; dot: string }> = {
  success: { border: 'border-emerald-500/40', dot: 'bg-emerald-400' },
  error: { border: 'border-red-500/40', dot: 'bg-red-400' },
  warning: { border: 'border-amber-500/40', dot: 'bg-amber-400' },
  info: { border: 'border-sky-500/40', dot: 'bg-sky-400' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const style = TYPE_STYLES[toast.type]

  return (
    <div className={`animate-fade-up flex items-center gap-3 px-4 py-3 bg-feldora-surface border ${style.border} shadow-lg`}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
      <span className="text-feldora-text text-sm flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="text-feldora-muted hover:text-feldora-text transition-colors shrink-0"
        aria-label="Tutup"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
