import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NotFoundPage } from '~/components/layout/NotFoundPage'

export const Route = createFileRoute('/playground')({
  component: PlaygroundLayout,
  notFoundComponent: () => (
    <NotFoundPage
      label="Module not found"
      message="This module doesn't exist in the Playground."
      backTo="/playground"
      backText="Back to Playground"
    />
  ),
})

function PlaygroundLayout() {
  return <Outlet />
}
