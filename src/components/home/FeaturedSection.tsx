const features = [
  {
    tag: 'Stories',
    title: 'Digital Narratives',
    description:
      'Deep-dive articles exploring technology, creativity, and the craft of building for the web.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop',
  },
  {
    tag: 'Updates',
    title: 'Platform Evolution',
    description:
      'Track every iteration and improvement as Feldora evolves into its full vision.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
  },
  {
    tag: 'Vision',
    title: 'Cinematic Web',
    description:
      'Pushing the boundaries of what a web platform can feel like — immersive, bold, and performant.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
  },
]

export function FeaturedSection() {
  return (
    <section className="relative py-28 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-feldora-accent/30 to-transparent" />
      <div className="absolute -right-40 top-20 w-[500px] h-[2px] bg-feldora-accent/10 rotate-[-35deg]" />
      <div className="absolute -left-40 bottom-40 w-[400px] h-[2px] bg-feldora-accent/10 rotate-[25deg]" />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="diamond-marker" />
              <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">
                Featured
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
              Explore <span className="text-feldora-accent">Feldora</span>
            </h2>
          </div>
          <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-feldora-border to-transparent" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group card-polygon hover:border-feldora-accent/40 transition-all duration-500"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-feldora-surface via-feldora-surface/60 to-transparent" />
                <div className="absolute top-4 left-0">
                  <div className="clip-arrow-right bg-feldora-accent px-4 pr-6 py-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                      {feature.tag}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-feldora-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6 relative">
                <h3 className="text-xl font-bold mb-3 group-hover:text-feldora-accent transition-colors duration-300 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-feldora-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="h-px w-8 bg-feldora-accent" />
                  <span className="text-feldora-accent font-mono text-[10px] uppercase">Discover</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
