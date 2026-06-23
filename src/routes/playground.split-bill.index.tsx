import { createFileRoute } from '@tanstack/react-router'
import HomePage from '~/components/playground/modules/split-bill/pages/HomePage'

export const Route = createFileRoute('/playground/split-bill/')({
  component: HomePage,
})
