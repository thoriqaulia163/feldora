import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '~/components/home/HeroSection'
import { FeaturedSection } from '~/components/home/FeaturedSection'
import { LatestUpdates } from '~/components/home/LatestUpdates'
import { CTASection } from '~/components/home/CTASection'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: 'FELDORA — Enter the Universe' }],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedSection />
      <LatestUpdates />
      <CTASection />
    </div>
  )
}
