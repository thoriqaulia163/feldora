import { Link } from '@tanstack/react-router'

interface ErrorStateProps {
  label?: string
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
  backTo?: string
  backText?: string
}

export function ErrorState({
  label = 'Connection Error',
  title = 'Gagal memuat data',
  message = 'Periksa koneksi internet kamu lalu coba lagi.',
  onRetry,
  retryText = 'Coba Lagi',
  backTo,
  backText = 'Kembali',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="diamond-marker !w-2 !h-2" />
        <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">
          {label}
        </span>
        <div className="diamond-marker !w-2 !h-2" />
      </div>
      <p className="text-feldora-text text-lg font-medium mb-2">
        {title}
      </p>
      <p className="text-feldora-text-secondary mb-8 max-w-sm">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {onRetry && (
          <button onClick={onRetry} className="btn-angular-primary">
            {retryText}
          </button>
        )}
        {backTo && (
          <Link to={backTo} className="btn-angular-outline">
            {backText}
          </Link>
        )}
      </div>
    </div>
  )
}
