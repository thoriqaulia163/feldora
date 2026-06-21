import { Link } from '@tanstack/react-router'
import { HOME_COPY } from '~/constants/copy'

export function CTASection() {
  return (
    <section className="relative py-36 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rotate-45 border border-feldora-accent/[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rotate-45 border border-feldora-accent/[0.1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rotate-45 bg-feldora-accent/[0.03]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="diamond-marker" />
        </div>

        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.85]">
          <span className="text-feldora-text">{HOME_COPY.cta.heading}</span>
          <br />
          <span className="text-gradient-accent">{HOME_COPY.cta.headingAccent}</span>
        </h2>

        <p className="mt-6 text-feldora-text-secondary text-lg max-w-xl mx-auto">
          {HOME_COPY.cta.description}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/playground" className="btn-angular-primary">
            {HOME_COPY.cta.primary}
          </Link>
          <Link to="/playground/local-weather-forecast" className="btn-angular-outline">
            {HOME_COPY.cta.secondary}
          </Link>
        </div>
      </div>
    </section>
  )
}
