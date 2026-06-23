import { createFileRoute } from '@tanstack/react-router'
import DetailPage from '~/components/playground/modules/split-bill/pages/DetailPage'

export const Route = createFileRoute('/playground/split-bill/detail/$id')({
  head: () => ({
    meta: [{ title: 'FELDORA — Bill Detail' }],
  }),
  component: SplitBillDetailPage,
})

function SplitBillDetailPage() {
  const { id } = Route.useParams()
  return <DetailPage id={id} />
}
