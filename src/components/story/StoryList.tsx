import { Link } from '@tanstack/react-router'
import { useGetPosts } from '~/lib/queries'

const PLACEHOLDER_STORIES = [
  {
    slug: 'building-the-future-of-web',
    title: 'Building the Future of Web Experiences',
    excerpt: 'Exploring how modern frameworks and cinematic design principles are reshaping what we expect from the web.',
    createdAt: '2025-09-18T00:00:00.000Z',
    featuredImage: { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
    category: [{ name: 'Technology', slug: 'technology' }],
    author: { name: 'Feldora' },
  },
  {
    slug: 'design-philosophy-of-immersion',
    title: 'The Design Philosophy of Immersion',
    excerpt: 'How restraint and precision create a sense of premium quality that loud, overloaded interfaces never achieve.',
    createdAt: '2025-08-12T00:00:00.000Z',
    featuredImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
    category: [{ name: 'Design', slug: 'design' }],
    author: { name: 'Feldora' },
  },
  {
    slug: 'performance-without-compromise',
    title: 'Performance Without Compromise',
    excerpt: 'Premium aesthetics and fast load times are not mutually exclusive. Here is how we achieve both.',
    createdAt: '2025-07-20T00:00:00.000Z',
    featuredImage: { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop' },
    category: [{ name: 'Engineering', slug: 'engineering' }],
    author: { name: 'Feldora' },
  },
]

type Story = typeof PLACEHOLDER_STORIES[number]

export function StoryList() {
  const { data: posts, isPending } = useGetPosts()

  const stories: Story[] = posts
    ? posts.map((edge: { node: Story }) => edge.node)
    : PLACEHOLDER_STORIES

  if (isPending && !stories.length) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-polygon animate-pulse">
            <div className="h-52 bg-feldora-surface-light" />
            <div className="p-6 space-y-3">
              <div className="h-3 w-20 bg-feldora-surface-light rounded" />
              <div className="h-5 w-3/4 bg-feldora-surface-light rounded" />
              <div className="h-3 w-full bg-feldora-surface-light rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {stories.map((story) => (
        <Link
          key={story.slug}
          to="/story/$slug"
          params={{ slug: story.slug }}
          className="group card-polygon hover:border-feldora-accent/40 transition-all duration-500"
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={story.featuredImage.url}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-feldora-surface via-feldora-surface/50 to-transparent" />
            {story.category?.[0] && (
              <div className="absolute top-4 left-0">
                <div className="clip-arrow-right bg-feldora-accent/90 px-3 pr-5 py-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white font-bold">
                    {story.category[0].name}
                  </span>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-feldora-accent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-feldora-accent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>

          <div className="p-6">
            <p className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider mb-2">
              {new Date(story.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </p>
            <h3 className="text-base font-bold mb-2 group-hover:text-feldora-accent transition-colors duration-300 uppercase tracking-wide leading-snug line-clamp-2">
              {story.title}
            </h3>
            <p className="text-feldora-text-secondary text-sm leading-relaxed line-clamp-2">
              {story.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
              <div className="diamond-marker !w-[6px] !h-[6px]" />
              <span className="text-feldora-accent font-mono text-[10px] uppercase tracking-wider">Read Story</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
