import { Link } from '@tanstack/react-router'
import { useGetPosts } from '~/lib/queries'
import { SkeletonCardGrid } from '~/components/ui/Skeleton'
import { ErrorState } from '~/components/ui/ErrorState'

export function StoryList() {
  const { data: posts, isPending, isError, refetch } = useGetPosts()

  if (isPending) {
    return <SkeletonCardGrid count={3} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat cerita"
        onRetry={() => refetch()}
      />
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <ErrorState
        label="No Stories"
        title="Belum ada cerita"
        message="Cerita baru akan segera hadir."
      />
    )
  }

  const stories = posts.map((edge) => edge.node)

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
