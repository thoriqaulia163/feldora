import { Link } from '@tanstack/react-router'
import { NAVIGATION_LINKS } from '~/constants/navigation'

export function Footer() {
  return (
    <footer className="relative bg-feldora-surface/50 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-feldora-accent/50 to-transparent" />

      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto pt-20 pb-10">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-2 h-5 bg-feldora-accent-secondary skew-x-[-8deg]" />
              <span className="text-xl font-black uppercase tracking-[0.15em] text-feldora-text">
                FELDORA
              </span>
            </Link>
            <p className="mt-5 text-feldora-text-secondary text-sm leading-relaxed max-w-sm">
              A cinematic digital universe. Where technology meets bold visual
              storytelling and angular design philosophy.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-12 h-[2px] bg-feldora-accent-secondary/40" />
              <div className="w-2 h-2 rotate-45 border border-feldora-accent-secondary/40" />
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="flex items-center gap-2 text-feldora-text font-bold text-xs uppercase tracking-wider mb-5">
              <div className="diamond-marker !w-2 !h-2" />
              Navigate
            </h3>
            <div className="flex flex-col gap-3">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div className="md:col-span-4">
            <h3 className="flex items-center gap-2 text-feldora-text font-bold text-xs uppercase tracking-wider mb-5">
              <div className="diamond-marker !w-2 !h-2" />
              Connect
            </h3>
            <div className="flex flex-col gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200">
                GitHub
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200">
                Discord
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-feldora-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            © FELDORA 2026. All rights reserved.
          </span>
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : ''} — Built with precision & angular philosophy.
          </span>
        </div>
      </div>
    </footer>
  )
}
