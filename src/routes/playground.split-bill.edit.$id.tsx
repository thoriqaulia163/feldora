import { createFileRoute } from '@tanstack/react-router'
import EditPage from '~/components/playground/modules/split-bill/pages/EditPage'

export const Route = createFileRoute('/playground/split-bill/edit/$id')({
  head: () => ({
    meta: [{ title: 'FELDORA — Edit Bill' }],
  }),
  component: SplitBillEditPage,
})

function SplitBillEditPage() {
  const { id } = Route.useParams()
  return <EditPage id={id} />
}
