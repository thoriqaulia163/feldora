import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useGetPostDetail } from '~/lib/queries'
import { getPlaceholderStory } from '~/constants/placeholderStories'
import { SkeletonArticle } from '~/components/ui/Skeleton'
import { ErrorState } from '~/components/ui/ErrorState'
import { STORY_COPY } from '~/constants/copy'
import { formatDate } from '~/utils/formatDate'

interface StoryDetailProps {
  slug: string
}

type Locale = 'en' | 'id_ID'

export function StoryDetail({ slug }: StoryDetailProps) {
  const { data: post, isPending, isError, refetch } = useGetPostDetail(slug)
  const [locale, setLocale] = useState<Locale>('en')

  // Cek placeholder dulu — kalau ada, langsung serve tanpa tunggu API
  const placeholderPost = getPlaceholderStory(slug)

  // Fallback to placeholder if API returns nothing
  const resolvedPost = post || placeholderPost || null

  // Check if Indonesian localization exists
  const idLocalization = resolvedPost?.localizations?.find((l: { locale: string }) => l.locale === 'id_ID')
  const hasIndonesian = !!(idLocalization?.content?.html)

  // Resolve content based on selected locale
  const displayTitle = locale === 'id_ID' && idLocalization?.title ? idLocalization.title : resolvedPost?.title
  const displayContent = locale === 'id_ID' && idLocalization?.content?.html ? idLocalization.content.html : resolvedPost?.content?.html

  // Hanya tampilkan skeleton kalau isPending DAN tidak ada placeholder fallback
  if (isPending && !placeholderPost) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 max-w-3xl mx-auto">
        <SkeletonArticle />
      </div>
    )
  }

  // API error dan tidak ada placeholder — tampilkan error state
  if (isError && !resolvedPost) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
        <ErrorState
          title={STORY_COPY.detail.error.title}
          onRetry={() => refetch()}
          backTo="/story"
          backText={STORY_COPY.detail.backLink}
        />
      </div>
    )
  }

  if (!resolvedPost) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-feldora-accent mb-4">{STORY_COPY.detail.notFound.code}</h1>
          <p className="text-xl text-feldora-text mb-2">{STORY_COPY.detail.notFound.title}</p>
          <p className="text-feldora-text-secondary mb-8">
            {STORY_COPY.detail.notFound.message}
          </p>
          <Link
            to="/story"
            className="px-6 py-3 bg-feldora-accent text-white font-medium uppercase tracking-wider text-sm hover:bg-violet-700 transition-colors duration-300"
          >
            {STORY_COPY.detail.notFound.cta}
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
          <span className="group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
          {STORY_COPY.detail.backLink}
        </Link>

        {/* Category badges + Language toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {resolvedPost.category && resolvedPost.category.length > 0 && (
              resolvedPost.category.map((cat, i) => (
                <span
                  key={i}
                  className="text-feldora-accent-secondary font-mono text-[10px] uppercase tracking-wider border border-feldora-accent-secondary/20 bg-feldora-accent-glow px-2.5 py-1"
                >
                  {cat.name}
                </span>
              ))
            )}
          </div>

          {/* Language toggle — only shows if Indonesian content exists */}
          {hasIndonesian && (
            <div className="flex items-center border border-feldora-accent-secondary/50 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  locale === 'en'
                    ? 'bg-feldora-accent-secondary text-white'
                    : 'text-feldora-text-secondary hover:text-feldora-text'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('id_ID')}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  locale === 'id_ID'
                    ? 'bg-feldora-accent-secondary text-white'
                    : 'text-feldora-text-secondary hover:text-feldora-text'
                }`}
              >
                ID
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
          {displayTitle}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-feldora-border/30">
          <div className="flex items-center gap-3">
            {resolvedPost.author?.photo?.url ? (
              <img
                src={resolvedPost.author.photo.url}
                alt={resolvedPost.author.name}
                className="w-9 h-9 rounded-full object-cover border border-feldora-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div
              className={`w-9 h-9 rounded-full bg-feldora-surface-light border border-feldora-border flex items-center justify-center ${resolvedPost.author?.photo?.url ? 'hidden' : ''}`}
            >
              <span className="text-xs font-bold text-feldora-accent">
                {resolvedPost.author?.name?.charAt(0) ?? 'F'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-feldora-text font-medium">
                {resolvedPost.author?.name}
              </span>
            </div>
          </div>
          <span className="text-feldora-border hidden sm:block">|</span>
          <span className="text-feldora-muted font-mono text-xs">
            {formatDate(resolvedPost.createdAt)}
          </span>
          {resolvedPost.updatedAt && resolvedPost.updatedAt !== resolvedPost.createdAt && (
            <>
              <span className="text-feldora-border hidden sm:block">|</span>
              <span className="text-feldora-muted font-mono text-xs">
                Updated {formatDate(resolvedPost.updatedAt)}
              </span>
            </>
          )}
        </div>

        {/* Featured Image */}
        {resolvedPost.featuredImage?.url && (
          <div className="relative mb-10 overflow-hidden border border-feldora-border/20">
            <img
              src={resolvedPost.featuredImage.url}
              alt={displayTitle ?? resolvedPost.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 border border-white/5 pointer-events-none" />
          </div>
        )}

        {/* Post Content Body */}
        {displayContent && (
          <div
            className="prose-feldora"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}

        {/* Bottom navigation */}
        <div className="mt-16 pt-8 border-t border-feldora-border/30">
          <Link
            to="/story"
            className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
            {STORY_COPY.detail.backLinkAll}
          </Link>
        </div>
      </div>
    </article>
  )
}
