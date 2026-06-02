import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'FELDORA — About' }],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="relative px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-24 overflow-hidden">
        <div className="absolute -right-40 top-0 w-[500px] h-[500px] border border-feldora-accent/[0.04] rotate-45 hidden lg:block" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="diamond-marker" />
            <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">About</span>
            <div className="h-px flex-1 bg-gradient-to-r from-feldora-accent/30 to-transparent max-w-32" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.85]">
            <span className="text-feldora-text">The</span>{' '}
            <span className="text-feldora-accent">Vision</span>
          </h1>
          <div className="mt-6 pl-4 border-l-2 border-feldora-accent/50 max-w-2xl">
            <p className="text-feldora-text-secondary text-lg leading-relaxed">
              Feldora is a digital universe crafted at the intersection of technology,
              creativity, and cinematic storytelling. We believe that the web should feel
              immersive — not just functional, but experiential.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-24">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="card-polygon p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="diamond-marker !w-2 !h-2" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Our Philosophy</h2>
            </div>
            <p className="text-feldora-text-secondary leading-relaxed mb-4">
              Every pixel is deliberate. Every interaction tells a story. We don't build
              websites — we craft digital experiences that resonate with the same intensity
              as a cinematic masterpiece.
            </p>
            <p className="text-feldora-text-secondary leading-relaxed">
              Performance isn't sacrificed for aesthetics. We prove that premium design and
              lightning-fast load times aren't mutually exclusive.
            </p>
          </div>
          <div className="card-polygon p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="diamond-marker !w-2 !h-2" />
              <h2 className="text-xl font-bold uppercase tracking-wider">The Platform</h2>
            </div>
            <p className="text-feldora-text-secondary leading-relaxed mb-4">
              Feldora serves as a living showcase — a platform where modern web technology
              meets bold visual design. It's a space for stories, experiments, and
              digital craftsmanship.
            </p>
            <p className="text-feldora-text-secondary leading-relaxed">
              Built with cutting-edge tools yet designed to be maintainable by a single
              developer. Scalable architecture without enterprise-level complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 bg-feldora-surface/30 -skew-y-1" />
        <div className="absolute top-0 left-0 w-1/4 h-[2px] bg-gradient-to-r from-feldora-accent/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="diamond-marker" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Core <span className="text-feldora-accent">Values</span>
            </h2>
            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-feldora-border to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value, i) => (
              <div key={i} className="group clip-notch-br bg-feldora-surface border border-feldora-border/40 p-6 hover:border-feldora-accent/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="hex-badge w-7 h-7 text-[9px] font-bold text-white">{i + 1}</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider group-hover:text-feldora-accent transition-colors duration-300">
                    {value.title}
                  </h3>
                </div>
                <p className="text-feldora-text-secondary text-sm leading-relaxed pl-10">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mt-24">
        <div className="panel-frame p-8 md:p-12 bg-feldora-surface/50">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="hex-badge w-20 h-20 shrink-0">
              <span className="text-2xl font-black text-white">F</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="diamond-marker !w-2 !h-2" />
                <span className="text-feldora-accent font-mono text-[10px] uppercase tracking-wider">Creator</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-3">Feldora Developer</h3>
              <p className="text-feldora-text-secondary leading-relaxed">
                A solo developer passionate about the intersection of cinematic design
                and web performance. Building Feldora as a creative platform that pushes
                the boundaries of what a personal website can be.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const values = [
  { title: 'Performance First', description: 'Every decision is measured against its impact on load time and runtime performance.' },
  { title: 'Cinematic Quality', description: 'Visual storytelling that elevates the web experience beyond conventional design.' },
  { title: 'Clean Architecture', description: 'Maintainable, readable code that scales without unnecessary complexity.' },
  { title: 'Bold Simplicity', description: 'Premium aesthetics achieved through restraint and angular precision.' },
  { title: 'Immersive Experience', description: 'Every interaction should feel intentional and contribute to the narrative.' },
  { title: 'Future Ready', description: 'Built on modern foundations that embrace the evolving web platform.' },
]
