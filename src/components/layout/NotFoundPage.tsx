import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Large 404 with geometric accents */}
        <div className="relative inline-block mb-8">
          {/* Corner accents */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-feldora-accent" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-feldora-accent" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-feldora-accent" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-feldora-accent" />

          <h1 className="text-[8rem] md:text-[10rem] font-black leading-none tracking-tighter text-feldora-text">
            4<span className="text-feldora-accent">0</span>4
          </h1>
        </div>

        {/* Message */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="diamond-marker !w-2 !h-2" />
          <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">
            Lost in the void
          </span>
          <div className="diamond-marker !w-2 !h-2" />
        </div>

        <p className="text-feldora-text-secondary text-lg mb-10">
          This page doesn't exist in the Feldora universe.
        </p>

        {/* CTA */}
        <Link to="/" className="btn-angular-primary">
          Return Home
        </Link>
      </div>
    </div>
  )
}
