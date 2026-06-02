import { Link } from '@tanstack/react-router'
import { useGetPostDetail } from '~/lib/queries'
import { formatDate } from '~/utils/formatDate'

interface StoryDetailProps {
  slug: string
}

export function StoryDetail({ slug }: StoryDetailProps) {
  const { data: post, isPending } = useGetPostDetail(slug)

  if (isPending) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-24 bg-feldora-surface-light rounded" />
          <div className="h-8 w-3/4 bg-feldora-surface-light rounded" />
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-feldora-surface-light" />
            <div className="h-3 w-32 bg-feldora-surface-light rounded" />
          </div>
          <div className="h-64 w-full bg-feldora-surface-light rounded" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-feldora-surface-light rounded" />
            <div className="h-4 w-5/6 bg-feldora-surface-light rounded" />
            <div className="h-4 w-4/6 bg-feldora-surface-light rounded" />
            <div className="h-4 w-full bg-feldora-surface-light rounded" />
            <div className="h-4 w-3/4 bg-feldora-surface-light rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-feldora-accent mb-4">404</h1>
          <p className="text-xl text-feldora-text mb-2">Story Not Found</p>
          <p className="text-feldora-text-secondary mb-8">
            This story doesn't exist or has been removed.
          </p>
          <Link
            to="/story"
            className="px-6 py-3 bg-feldora-accent text-white font-medium uppercase tracking-wider text-sm hover:bg-red-700 transition-colors duration-300"
          >
            Back to Stories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen pt-24 pb-20">
      <div className="px-6 max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/story"
          className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Back to Stories
        </Link>

        {/* Category badges */}
        {post.category && post.category.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category.map((cat, i) => (
              <span
                key={i}
                className="text-feldora-accent font-mono text-[10px] uppercase tracking-wider border border-feldora-accent/20 bg-feldora-accent-glow px-2.5 py-1"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-feldora-border/30">
          <div className="flex items-center gap-3">
            {post.author?.photo?.url ? (
              <img
                src={post.author.photo.url}
                alt={post.author.name}
                className="w-9 h-9 rounded-full object-cover border border-feldora-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div
              className={`w-9 h-9 rounded-full bg-feldora-surface-light border border-feldora-border flex items-center justify-center ${post.author?.photo?.url ? 'hidden' : ''}`}
            >
              <span className="text-xs font-bold text-feldora-accent">
                {post.author?.name?.charAt(0) ?? 'F'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-feldora-text font-medium">
                {post.author?.name}
              </span>
            </div>
          </div>
          <span className="text-feldora-border hidden sm:block">|</span>
          <span className="text-feldora-muted font-mono text-xs">
            {formatDate(post.createdAt)}
          </span>
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <>
              <span className="text-feldora-border hidden sm:block">|</span>
              <span className="text-feldora-muted font-mono text-xs">
                Updated {formatDate(post.updatedAt)}
              </span>
            </>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage?.url && (
          <div className="relative mb-10 overflow-hidden border border-feldora-border/20">
            <img
              src={post.featuredImage.url}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 border border-white/5 pointer-events-none" />
          </div>
        )}

        {/* Post Content Body */}
        {post.content?.html && (
          <div
            className="prose-feldora"
            dangerouslySetInnerHTML={{ __html: post.content.html }}
          />
        )}

        {/* Bottom navigation */}
        <div className="mt-16 pt-8 border-t border-feldora-border/30">
          <Link
            to="/story"
            className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to all stories
          </Link>
        </div>
      </div>
    </article>
  )
}
