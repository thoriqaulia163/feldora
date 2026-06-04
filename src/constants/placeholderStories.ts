export interface PlaceholderStory {
  slug: string
  title: string
  excerpt: string
  createdAt: string
  updatedAt?: string
  featuredImage: { url: string }
  category: Array<{ name: string; slug: string }>
  author: { name: string; photo?: { url: string } }
  content: { html: string }
}

export const PLACEHOLDER_STORIES: PlaceholderStory[] = [
  {
    slug: 'building-the-future-of-web',
    title: 'Building the Future of Web Experiences',
    excerpt: 'Exploring how modern frameworks and cinematic design principles are reshaping what we expect from the web.',
    createdAt: '2025-09-18T00:00:00.000Z',
    featuredImage: { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
    category: [{ name: 'Technology', slug: 'technology' }],
    author: { name: 'Feldora' },
    content: {
      html: `<p>The web has evolved far beyond static documents. Today, we're building immersive digital experiences that rival native applications in performance and exceed them in accessibility. This is the story of how modern frameworks are making that possible.</p>

<h2>The Rise of Server-Side Rendering</h2>
<p>For years, single-page applications dominated the landscape. But the pendulum has swung back toward the server — not because SPAs failed, but because we discovered we could have the best of both worlds. Frameworks like TanStack Start, Next.js, and Remix deliver server-rendered HTML for instant first paint while hydrating into fully interactive applications on the client.</p>

<p>This isn't just a performance trick. It's a fundamental shift in how we think about web architecture. The server handles what it does best — data fetching, authentication, and initial rendering — while the client handles what it does best — interactivity, transitions, and real-time updates.</p>

<h2>Cinematic Design on the Web</h2>
<p>Game studios like Riot Games and CD Projekt Red have proven that digital interfaces can feel cinematic. Angular geometry, dramatic lighting, and purposeful animation create experiences that are both functional and emotionally resonant. The web is finally catching up.</p>

<p>The key insight is restraint. A cinematic web experience isn't about overwhelming the user with effects — it's about making every visual choice intentional. A single accent color used precisely. A geometric pattern that reinforces brand identity without distracting from content. Animations that guide attention rather than demand it.</p>

<h2>Performance as a Feature</h2>
<p>Premium design and performance are often presented as opposing forces. This is a false dichotomy. CSS-only animations, efficient clip-paths, and server-side rendering mean we can deliver visually rich experiences without sacrificing load times. The future of the web is both beautiful and fast.</p>

<blockquote>The best interface is one where every pixel serves a purpose, and no millisecond is wasted.</blockquote>

<p>As we continue building tools and frameworks that make this possible, the gap between "web app" and "digital experience" will continue to shrink. The future isn't just functional — it's immersive.</p>`,
    },
  },
  {
    slug: 'design-philosophy-of-immersion',
    title: 'The Design Philosophy of Immersion',
    excerpt: 'How restraint and precision create a sense of premium quality that loud, overloaded interfaces never achieve.',
    createdAt: '2025-08-12T00:00:00.000Z',
    featuredImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
    category: [{ name: 'Design', slug: 'design' }],
    author: { name: 'Feldora' },
    content: {
      html: `<p>Immersion isn't about filling every pixel with content. It's about creating a focused environment where the user's attention flows naturally from one element to the next, guided by deliberate visual hierarchy and spatial relationships.</p>

<h2>The Power of Negative Space</h2>
<p>Every great design system understands that what you leave out matters as much as what you put in. Dark backgrounds aren't just an aesthetic choice — they create depth, reduce eye strain, and make accent colors pop with dramatic intensity. A single red diamond marker against a near-black canvas carries more visual weight than a dozen colorful elements competing for attention.</p>

<h2>Geometric Language</h2>
<p>Angular shapes communicate precision and intentionality. When a card has a clipped corner, it signals that every detail was considered. When a button uses a parallelogram clip-path instead of rounded corners, it creates visual tension that draws the eye. These micro-decisions compound into an overall feeling of craftsmanship.</p>

<p>The geometric vocabulary should be consistent but not monotonous:</p>
<ul>
<li>Diamond markers for section indicators</li>
<li>Hexagonal badges for numbered elements</li>
<li>Angular clip-paths for interactive elements</li>
<li>Corner accents for framing important content</li>
</ul>

<h2>Animation as Storytelling</h2>
<p>Every animation should answer the question: "What story does this motion tell?" A card lifting on hover tells the user it's interactive. A fade-up on scroll tells the user they're progressing through content. A subtle glow on an accent element tells the user where to focus.</p>

<blockquote>Design is not what it looks like. Design is how it works — and how it feels.</blockquote>

<h2>Restraint Creates Premium</h2>
<p>The most expensive watches have the cleanest faces. The most premium cars have the simplest dashboards. Premium quality in digital design follows the same principle: confidence in simplicity. If your design needs decoration to feel complete, the underlying structure isn't strong enough.</p>

<p>Immersive design isn't loud. It's quiet, confident, and absolutely precise.</p>`,
    },
  },
  {
    slug: 'performance-without-compromise',
    title: 'Performance Without Compromise',
    excerpt: 'Premium aesthetics and fast load times are not mutually exclusive. Here is how we achieve both.',
    createdAt: '2025-07-20T00:00:00.000Z',
    featuredImage: { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop' },
    category: [{ name: 'Engineering', slug: 'engineering' }],
    author: { name: 'Feldora' },
    content: {
      html: `<p>There's a persistent myth in web development that rich visual design requires heavy JavaScript libraries, complex animation frameworks, and GPU-intensive effects. This is simply not true. With modern CSS and thoughtful architecture, we can deliver cinematic experiences that load in milliseconds.</p>

<h2>CSS-Only Animations</h2>
<p>Every animation in a performant system should be achievable with CSS alone. Transitions, keyframes, and transforms are hardware-accelerated by default. They don't block the main thread. They don't add to your JavaScript bundle. And they're often smoother than their JS equivalents.</p>

<p>The key animations that create a cinematic feel:</p>
<ol>
<li><code>fade-in</code> — Elements appearing with opacity transition</li>
<li><code>fade-up</code> — Content sliding upward as it appears</li>
<li><code>scale on hover</code> — Images zooming subtly on interaction</li>
<li><code>color transitions</code> — Smooth border and text color changes</li>
</ol>

<h2>Clip-Path Over Images</h2>
<p>Geometric shapes created with <code>clip-path</code> are infinitely scalable, add zero bytes to your payload, and render at native resolution on any screen. Compare this to decorative images: each one requires a network request, takes up bandwidth, and needs responsive sizing.</p>

<h2>Server-Side Rendering</h2>
<p>When the server delivers fully-rendered HTML, the user sees content immediately. There's no flash of blank screen, no loading spinner, no layout shift as JavaScript initializes. The page is interactive before the user even thinks to interact with it.</p>

<h2>Minimal Dependencies</h2>
<p>Every dependency is a performance decision. Each package adds bytes to your bundle, milliseconds to your parse time, and potential points of failure. A production app with fewer than ten dependencies isn't a constraint — it's a competitive advantage.</p>

<blockquote>Performance isn't an optimization you add later. It's a design principle you start with.</blockquote>

<p>The result is a platform that feels premium and loads fast — proving that the choice between aesthetics and performance was always a false one.</p>`,
    },
  },
]

export function getPlaceholderStory(slug: string): PlaceholderStory | undefined {
  return PLACEHOLDER_STORIES.find((story) => story.slug === slug)
}
