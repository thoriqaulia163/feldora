import { Link, useRouter } from '@tanstack/react-router'

export function ErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icon with geometric accents */}
        <div className="relative inline-block mb-8">
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-feldora-accent" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-feldora-accent" />

          <h1 className="text-[6rem] md:text-[8rem] font-black leading-none tracking-tighter text-feldora-text">
            <span className="text-feldora-accent">!</span>
          </h1>
        </div>

        {/* Message */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="diamond-marker !w-2 !h-2" />
          <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">
            System Error
          </span>
          <div className="diamond-marker !w-2 !h-2" />
        </div>

        <p className="text-feldora-text-secondary text-lg mb-10">
          Something went wrong. The page encountered an unexpected error.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.invalidate()}
            className="btn-angular-primary"
          >
            Try Again
          </button>
          <Link to="/" className="btn-angular-outline">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
