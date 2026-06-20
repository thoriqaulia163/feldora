import { createFileRoute } from '@tanstack/react-router'
import { PlaygroundShell } from '~/components/playground/PlaygroundShell'

export const Route = createFileRoute('/playground')({
  head: () => ({
    meta: [{ title: 'FELDORA — Playground' }],
  }),
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return <PlaygroundShell />
}
