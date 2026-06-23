import { createFileRoute } from '@tanstack/react-router'
import CreatePage from '~/components/playground/modules/split-bill/pages/CreatePage'

export const Route = createFileRoute('/playground/split-bill/create')({
  head: () => ({
    meta: [{ title: 'FELDORA — Create Bill' }],
  }),
  component: CreatePage,
})
