import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '~/components/ui/PageHeader'
import { ABOUT_COPY } from '~/constants/copy'

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
        <PageHeader
          label={ABOUT_COPY.header.label}
          title={<><span className="text-feldora-text">{ABOUT_COPY.header.heading}</span>{' '}<span className="text-feldora-accent">{ABOUT_COPY.header.headingAccent}</span></>}
          description={ABOUT_COPY.header.description}
        />
      </section>

      {/* Philosophy */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-24">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="card-polygon p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="diamond-marker !w-2 !h-2" />
              <h2 className="text-xl font-bold uppercase tracking-wider">{ABOUT_COPY.philosophy.title}</h2>
            </div>
            <p className="text-feldora-text-secondary leading-relaxed mb-4">
              {ABOUT_COPY.philosophy.paragraphs[0]}
            </p>
            <p className="text-feldora-text-secondary leading-relaxed">
              {ABOUT_COPY.philosophy.paragraphs[1]}
            </p>
          </div>
          <div className="card-polygon p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="diamond-marker !w-2 !h-2" />
              <h2 className="text-xl font-bold uppercase tracking-wider">{ABOUT_COPY.platform.title}</h2>
            </div>
            <p className="text-feldora-text-secondary leading-relaxed mb-4">
              {ABOUT_COPY.platform.paragraphs[0]}
            </p>
            <p className="text-feldora-text-secondary leading-relaxed">
              {ABOUT_COPY.platform.paragraphs[1]}
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
            {ABOUT_COPY.values.map((value, i) => (
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
                <span className="text-feldora-accent font-mono text-[10px] uppercase tracking-wider">{ABOUT_COPY.creator.label}</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-3">{ABOUT_COPY.creator.name}</h3>
              <p className="text-feldora-text-secondary leading-relaxed">
                {ABOUT_COPY.creator.bio}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


