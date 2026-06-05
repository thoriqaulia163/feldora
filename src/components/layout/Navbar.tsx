import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { NAVIGATION_LINKS } from '~/constants/navigation'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 md:px-12 lg:px-16 flex items-center justify-between bg-feldora-bg/90 backdrop-blur-md border-b border-feldora-border/20">
        {/* Logo with angular accent */}
        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-5 bg-feldora-accent-secondary skew-x-[-8deg]" />
          <span className="text-lg font-black uppercase tracking-[0.15em] text-feldora-text">
            FELDORA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAVIGATION_LINKS.map((link) => {
            const isActive = currentPath === link.path ||
              (link.path !== '/' && currentPath.startsWith(link.path))
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-feldora-text-secondary hover:text-feldora-text'
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-feldora-accent-secondary clip-parallelogram" />
                )}
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-10 w-9 h-9 flex flex-col justify-center items-center gap-[5px] border border-feldora-border/50 hover:border-feldora-accent/50 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className={`block w-4 h-[2px] bg-feldora-text transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-4 h-[2px] bg-feldora-text transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : ''}`} />
          <span className={`block w-4 h-[2px] bg-feldora-text transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-feldora-bg flex flex-col items-center justify-center transition-all duration-400 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-[300px] h-[2px] bg-feldora-accent/10 rotate-[-30deg]" />
          <div className="absolute bottom-1/3 -left-20 w-[250px] h-[2px] bg-feldora-accent/10 rotate-[20deg]" />
          <div className="absolute top-20 left-8 w-8 h-8 border-l-2 border-t-2 border-feldora-accent/20" />
          <div className="absolute bottom-20 right-8 w-8 h-8 border-r-2 border-b-2 border-feldora-accent/20" />
        </div>

        <div className="relative flex flex-col items-center gap-2 w-full max-w-xs">
          {NAVIGATION_LINKS.map((link, i) => {
            const isActive = currentPath === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`w-full text-center py-4 text-lg font-bold uppercase tracking-wider transition-all duration-300 border-b border-feldora-border/20 ${
                  isActive
                    ? 'text-feldora-accent'
                    : 'text-feldora-text-secondary hover:text-feldora-text'
                }`}
                style={{
                  transitionDelay: isOpen ? `${i * 60}ms` : '0ms',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                }}
              >
                {link.label}
                {isActive && <span className="ml-2 inline-block diamond-marker !w-2 !h-2" />}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
