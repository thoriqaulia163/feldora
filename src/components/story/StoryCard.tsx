import { Link } from '@tanstack/react-router'

interface StoryCardProps {
  slug: string
  title: string
  excerpt: string
  createdAt?: string
  imageUrl: string
  category?: string
  showDate?: boolean
}

export function StoryCard({
  slug,
  title,
  excerpt,
  createdAt,
  imageUrl,
  category,
  showDate = true,
}: StoryCardProps) {
  return (
    <Link
      to="/story/$slug"
      params={{ slug }}
      className="group card-polygon hover:border-feldora-accent/40 transition-all duration-500"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-feldora-surface via-feldora-surface/50 to-transparent" />
        {category && (
          <div className="absolute top-4 left-0">
            <div className="clip-arrow-right bg-feldora-accent/90 px-3 pr-5 py-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-white font-bold">
                {category}
              </span>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-feldora-accent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-feldora-accent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      <div className="p-6">
        {showDate && createdAt && (
          <p className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider mb-2">
            {new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </p>
        )}
        <h3 className="text-base font-bold mb-2 group-hover:text-feldora-accent transition-colors duration-300 uppercase tracking-wide leading-snug line-clamp-2">
          {title}
        </h3>
        <p className="text-feldora-text-secondary text-sm leading-relaxed line-clamp-2">
          {excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
          <div className="diamond-marker !w-[6px] !h-[6px]" />
          <span className="text-feldora-accent font-mono text-[10px] uppercase tracking-wider">Read Story</span>
        </div>
      </div>
    </Link>
  )
}
