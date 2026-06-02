import { createFileRoute } from '@tanstack/react-router'
import { StoryDetail } from '~/components/story/StoryDetail'

export const Route = createFileRoute('/story/$slug')({
  head: ({ params }) => ({
    meta: [{ title: `FELDORA — ${params.slug.replace(/-/g, ' ')}` }],
  }),
  component: StoryDetailPage,
})

function StoryDetailPage() {
  const { slug } = Route.useParams()
  return <StoryDetail slug={slug} />
}
