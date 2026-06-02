export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Geometric grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(220,38,38,0.3) 1px, transparent 1px),
            linear-gradient(-30deg, rgba(220,38,38,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Large diagonal accent slab */}
      <div className="absolute -right-32 top-1/4 w-[600px] h-[200px] bg-feldora-accent/[0.04] rotate-[-12deg] hidden lg:block" />
      <div className="absolute -left-20 bottom-1/3 w-[400px] h-[3px] bg-gradient-to-r from-feldora-accent/40 to-transparent rotate-[-8deg] hidden lg:block" />

      {/* Angular frame decorations */}
      <div className="absolute top-20 left-8 hidden lg:block">
        <div className="w-16 h-16 border-l-2 border-t-2 border-feldora-accent/40" />
      </div>
      <div className="absolute bottom-20 right-8 hidden lg:block">
        <div className="w-16 h-16 border-r-2 border-b-2 border-feldora-accent/40" />
      </div>

      {/* Vertical accent line left */}
      <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-feldora-accent/20 to-transparent hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7">
            {/* Accent tag */}
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div className="diamond-marker" />
              <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.4em]">
                Enter the Universe
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-feldora-accent/40 to-transparent max-w-24" />
            </div>

            {/* Main title */}
            <h1 className="text-7xl md:text-8xl lg:text-[7rem] xl:text-[9rem] font-black uppercase leading-[0.8] tracking-tighter animate-fade-up">
              <span className="text-feldora-text">FEL</span>
              <span className="text-feldora-accent">D</span>
              <span className="text-feldora-text">O</span>
              <span className="text-feldora-accent">R</span>
              <span className="text-feldora-text">A</span>
            </h1>

            {/* Subtitle */}
            <div className="mt-6 pl-4 border-l-2 border-feldora-accent/60 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <p className="text-feldora-text-secondary text-base md:text-lg max-w-lg leading-relaxed">
                A cinematic digital platform where technology meets bold storytelling.
                Explore stories, discover updates, and experience the future of the web.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <a href="/story" className="btn-angular-primary">
                Explore Stories
              </a>
              <a href="/about" className="btn-angular-outline">
                Learn More
              </a>
            </div>
          </div>

          {/* Right side - geometric art element */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[400px] aspect-square">
              <div className="absolute inset-8 border border-feldora-border/30 rotate-6" />
              <div className="absolute inset-4 border border-feldora-accent/20 -rotate-3" />
              <div className="absolute inset-16 rotate-45 bg-gradient-to-br from-feldora-accent/10 to-transparent border border-feldora-accent/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl font-black text-feldora-accent/10 select-none">F</div>
              </div>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-feldora-accent" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-feldora-accent" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-feldora-accent" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-feldora-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom angular cut */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full h-[60px]" preserveAspectRatio="none">
          <polygon points="0,60 1440,60 1440,20 0,60" fill="#0a0a0f" />
          <polygon points="0,60 1440,60 1440,30 0,50" fill="#12121a" opacity="0.5" />
        </svg>
      </div>
    </section>
  )
}
