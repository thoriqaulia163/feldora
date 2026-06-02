import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/story')({
  component: StoryLayout,
})

function StoryLayout() {
  return <Outlet />
}
