import { Link } from '@tanstack/react-router'
import { HOME_COPY } from '~/constants/copy'
import { HERO_CAROUSEL_CONFIG } from './heroCarouselConfig'
import { useGetPosts } from '~/lib/queries'
import { Carousel } from '~/components/ui/Carousel'
import type { Post } from '~/lib/graphql'

export function HeroSection() {
  const { data: postsData } = useGetPosts()
  const latestPost: Post | null = postsData?.[0]?.node ?? null

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(139,92,246,0.3) 1px, transparent 1px),
            linear-gradient(-30deg, rgba(139,92,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Decorative elements */}
      <div className="absolute -right-32 top-1/4 w-[600px] h-[200px] bg-feldora-accent/[0.04] rotate-[-12deg] hidden lg:block" />
      <div className="absolute -left-20 bottom-1/3 w-[400px] h-[3px] bg-gradient-to-r from-feldora-accent/40 to-transparent rotate-[-8deg] hidden lg:block" />
      <div className="absolute top-20 left-8 hidden lg:block">
        <div className="w-16 h-16 border-l-2 border-t-2 border-feldora-accent/40" />
      </div>
      <div className="absolute bottom-20 right-8 hidden lg:block">
        <div className="w-16 h-16 border-r-2 border-b-2 border-feldora-accent/40" />
      </div>
      <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-feldora-accent/20 to-transparent hidden lg:block" />

      {/* Carousel */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <Carousel autoScroll interval={10000} pauseOnHover>
          <SlideIntro />
          <SlidePlayground />
          <SlideStory post={latestPost} />
          <SlideAbout />
        </Carousel>
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

// ─── Slide: Intro ──────────────────────────────────────────────────────────

function SlideIntro() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="diamond-marker" />
          <span className="text-feldora-accent-secondary font-mono text-xs uppercase tracking-[0.4em]">
            {HOME_COPY.hero.label}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-feldora-accent-secondary/40 to-transparent max-w-24" />
        </div>

        <h1 className="text-7xl md:text-8xl lg:text-[7rem] xl:text-[9rem] font-black uppercase leading-[0.8] tracking-tighter">
          <span className="text-feldora-text">FEL</span>
          <span className="text-feldora-accent-secondary">D</span>
          <span className="text-feldora-text">O</span>
          <span className="text-feldora-accent">R</span>
          <span className="text-feldora-text">A</span>
        </h1>

        <div className="mt-6 pl-4 border-l-2 border-feldora-accent-secondary/60">
          <p className="text-feldora-text-secondary text-base md:text-lg max-w-lg leading-relaxed">
            {HOME_COPY.hero.subtitle}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/story" className="btn-angular-primary">
            {HOME_COPY.hero.cta.primary}
          </Link>
          <Link to="/about" className="btn-angular-outline">
            {HOME_COPY.hero.cta.secondary}
          </Link>
        </div>
      </div>

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
  )
}

// ─── Slide: Playground Highlight ───────────────────────────────────────────

function SlidePlayground() {
  const mod = HERO_CAROUSEL_CONFIG.highlightedModule

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="diamond-marker" />
          <span className="text-feldora-accent-secondary font-mono text-xs uppercase tracking-[0.4em]">
            Playground
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.85] mb-4">
          <span className="text-feldora-text">{mod.name}</span>
        </h2>

        <div className="pl-4 border-l-2 border-feldora-accent/50 mb-6">
          <p className="text-feldora-text-secondary text-base md:text-lg leading-relaxed max-w-xl">
            {mod.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border bg-feldora-accent/20 text-feldora-accent border-feldora-accent/30">
            {mod.label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border bg-feldora-surface-light text-feldora-muted border-feldora-border/50">
            {mod.estimatedDownloadSize}
          </span>
        </div>

        <Link to="/playground/local-weather-forecast" className="btn-angular-primary">
          View Module
        </Link>
      </div>

      {/* Visual: Weather/AI illustration */}
      <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
        <div className="relative w-full max-w-[340px] aspect-square">
          {/* Outer frame */}
          <div className="absolute inset-0 border border-feldora-accent/20 rotate-3" />
          <div className="absolute inset-3 border border-feldora-border/40 -rotate-2" />

          {/* Central weather icon area */}
          <div className="absolute inset-8 bg-feldora-surface/60 border border-feldora-border/30 flex flex-col items-center justify-center gap-4">
            {/* Cloud + rain icon */}
            <svg className="w-16 h-16 text-feldora-accent" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 38c-4.4 0-8-3.6-8-8 0-3.7 2.5-6.8 6-7.7C18.6 16.5 23.8 12 30 12c5.5 0 10.2 3.5 12 8.4C43.2 20.1 44.6 20 46 20c5.5 0 10 4.5 10 10s-4.5 10-10 10H20z" />
              <path d="M24 44v6M32 44v8M40 44v5" strokeLinecap="round" />
            </svg>

            {/* Fake prediction output */}
            <div className="text-center">
              <div className="text-feldora-accent font-mono text-xs uppercase tracking-wider mb-1">Prediction</div>
              <div className="text-2xl font-black text-feldora-text">Rain</div>
              <div className="text-feldora-muted font-mono text-[10px] mt-1">Confidence: 72%</div>
            </div>

            {/* Mini feature grid */}
            <div className="grid grid-cols-4 gap-2 w-full px-4">
              {['🌡', '📍', '🏔', '🌊'].map((icon) => (
                <div key={icon} className="flex items-center justify-center h-7 bg-feldora-bg/60 border border-feldora-border/30 text-xs">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-feldora-accent-secondary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-feldora-accent-secondary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-feldora-accent-secondary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-feldora-accent-secondary" />

          {/* 514 cities badge */}
          <div className="absolute -bottom-3 -right-3 bg-feldora-accent-secondary px-2 py-1">
            <span className="text-white font-mono text-[9px] font-bold">514 CITIES</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slide: Latest Story ───────────────────────────────────────────────────

function SlideStory({ post }: Readonly<{ post: Post | null }>) {
  if (post) {
    return (
      <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="diamond-marker" />
            <span className="text-feldora-accent-secondary font-mono text-xs uppercase tracking-[0.4em]">
              Latest Story
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.85] mb-4">
            <span className="text-feldora-text">{post.title}</span>
          </h2>

          <div className="pl-4 border-l-2 border-feldora-accent-secondary/50 mb-8">
            <p className="text-feldora-text-secondary text-base md:text-lg leading-relaxed max-w-xl">
              {post.excerpt}
            </p>
          </div>

          <Link to="/story/$slug" params={{ slug: post.slug }} className="btn-angular-primary">
            Read Story
          </Link>
        </div>

        {/* Story featured image */}
        <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
          <div className="relative w-full max-w-[360px]">
            <div className="card-polygon overflow-hidden">
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full h-[260px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-feldora-surface via-transparent to-transparent" />
            </div>
            {/* Corner accents */}
            <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-feldora-accent" />
            <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-feldora-accent" />
          </div>
        </div>
      </div>
    )
  }

  // Fallback: no API data
  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="diamond-marker" />
        <span className="text-feldora-accent-secondary font-mono text-xs uppercase tracking-[0.4em]">
          Stories
        </span>
      </div>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.85] mb-4">
        <span className="text-feldora-text">Explore</span>{' '}
        <span className="text-feldora-accent">Stories</span>
      </h2>

      <div className="pl-4 border-l-2 border-feldora-accent-secondary/50 mb-8">
        <p className="text-feldora-text-secondary text-base md:text-lg leading-relaxed max-w-xl">
          Dive into stories crafted at the intersection of technology, design, and creativity. From engineering deep-dives to design philosophy.
        </p>
      </div>

      <Link to="/story" className="btn-angular-primary">
        Explore Stories
      </Link>
    </div>
  )
}

// ─── Slide: About & Log ────────────────────────────────────────────────────

function SlideAbout() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
      <div className="lg:col-span-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="diamond-marker" />
          <span className="text-feldora-accent-secondary font-mono text-xs uppercase tracking-[0.4em]">
            Behind the Scenes
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.85] mb-4">
          <span className="text-feldora-text">Get to</span>{' '}
          <span className="text-feldora-accent">Know Us</span>
        </h2>

        <div className="pl-4 border-l-2 border-feldora-accent/50 mb-8">
          <p className="text-feldora-text-secondary text-base md:text-lg leading-relaxed max-w-xl">
            Discover the philosophy, architecture, and evolution behind Feldora. From design principles to the full development changelog — see how this platform is built and how it grows.
          </p>
        </div>

        <Link to="/about" className="btn-angular-primary">
          About Feldora
        </Link>
      </div>

      {/* Visual: Architecture/Blueprint illustration */}
      <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
        <div className="relative w-full max-w-[320px] aspect-square">
          {/* Layered frames representing architecture layers */}
          <div className="absolute inset-0 border border-feldora-accent/20 rotate-2" />
          <div className="absolute inset-3 border border-feldora-border/40 -rotate-1" />

          <div className="absolute inset-6 bg-feldora-surface/60 border border-feldora-border/30 p-5 flex flex-col justify-between">
            {/* Top: design system hint */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rotate-45 bg-feldora-accent-secondary" />
              <span className="text-feldora-accent-secondary font-mono text-[9px] uppercase tracking-wider">Design System</span>
            </div>

            {/* Middle: color palette preview */}
            <div className="flex items-center gap-2 my-3">
              <div className="w-6 h-6 bg-feldora-accent rounded-sm" />
              <div className="w-6 h-6 bg-feldora-accent-secondary rounded-sm" />
              <div className="w-6 h-6 bg-feldora-surface-light border border-feldora-border rounded-sm" />
              <div className="w-6 h-6 bg-feldora-bg border border-feldora-border rounded-sm" />
            </div>

            {/* Code-like lines */}
            <div className="space-y-2">
              <div className="h-1.5 w-3/4 bg-feldora-accent/20 rounded-full" />
              <div className="h-1.5 w-1/2 bg-feldora-border/40 rounded-full" />
              <div className="h-1.5 w-2/3 bg-feldora-accent-secondary/20 rounded-full" />
              <div className="h-1.5 w-5/6 bg-feldora-border/30 rounded-full" />
            </div>

            {/* Bottom: version badge */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-feldora-muted font-mono text-[9px]">v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : ''}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-mono text-[8px] uppercase">Active</span>
              </div>
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-feldora-accent" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-feldora-accent" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-feldora-accent" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-feldora-accent" />

          {/* Floating changelog hint */}
          <div className="absolute -bottom-3 -left-3 bg-feldora-accent px-2 py-1">
            <span className="text-white font-mono text-[9px] font-bold">CHANGELOG</span>
          </div>
        </div>
      </div>
    </div>
  )
}
