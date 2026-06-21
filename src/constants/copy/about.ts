export const ABOUT_COPY = {
  header: {
    label: 'About',
    heading: 'The',
    headingAccent: 'Vision',
    description: 'Feldora is a digital universe crafted at the intersection of technology, creativity, and cinematic storytelling. A living showcase where modern web technology meets bold visual design — a space for stories, experiments, and digital craftsmanship. Built with cutting-edge tools yet designed to be maintainable by a single developer who is passionate about pushing the boundaries of what a personal website can be.',
    creator: {
      name: 'Feldora Developer',
      quote: 'I believe the web deserves the same level of craft and intentionality as a cinematic production. Every line of code, every pixel — it all tells a story.',
    },
  },
  designPhilosophy: {
    label: 'Visual Identity',
    heading: 'Design &',
    headingAccent: 'Architecture',
    paragraphs: [
      'Feldora draws its visual DNA from the **cinematic language** of game studios like Riot Games — angular, bold, geometric — but implemented with restraint. Every pixel is deliberate. Every interaction tells a story. We don\'t build websites — we craft **digital experiences** that resonate with the same intensity as a cinematic masterpiece.',
      'The design language is built around **geometric precision**: polygon-clipped cards, diamond markers, hexagonal badges, and parallelogram buttons replace the rounded corners of conventional UI. A **dark-only theme** with dual-tone accents (purple for interaction, orange for decoration) creates a futuristic atmosphere that feels premium and **immersive** without relying on GPU-heavy effects.',
      '**Performance is never sacrificed for aesthetics.** All animations are CSS-only — zero runtime animation libraries. Visual storytelling elevates the experience beyond conventional design, but every decorative element is measured against its performance cost. The result: a cinematic experience that loads in milliseconds.',
    ],
  },
  developmentPhilosophy: {
    label: 'Engineering',
    heading: 'Development',
    headingAccent: 'Philosophy',
    paragraphs: [
      'Every architectural decision in Feldora is guided by four pillars. **Security & privacy** come first — environment variables are never exposed without explicit intent, and all third-party integrations follow the principle of least privilege. **High performance & lightweight** is non-negotiable — SSR by default, automatic code splitting, lazy loading, and a production bundle with only 8 dependencies.',
      'The codebase prioritizes **modular & scalable** design — reusable components (StoryCard, LogCard, Skeleton, ErrorState, Toast), structured folder architecture, and clear separation between UI, data layer, and routing. **TypeScript strict mode** enforces correctness at compile time rather than catching bugs in production.',
      '**Maintainability is a feature, not an afterthought.** Consistent naming conventions, centralized copywriting, a single source of truth for design decisions, and informative error handling enable rapid debugging. The platform is built on **modern foundations** — React 19, TanStack Start, Vite 7 — embracing the evolving web platform rather than locking into legacy patterns.',
    ],
  },
} as const
