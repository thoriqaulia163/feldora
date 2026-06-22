import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const WeatherModuleV2 = lazy(() => import('~/components/playground/modules/weather-v2/WeatherModuleV2.js'))

export const Route = createFileRoute('/playground/local-weather-forecast-v2')({
  head: () => ({
    meta: [{ title: 'FELDORA — Local Weather Forecast V2' }],
  }),
  component: LocalWeatherForecastV2Page,
})

function LocalWeatherForecastV2Page() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="card-polygon p-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-feldora-text-secondary text-sm">Loading module...</span>
              </div>
            </div>
          }
        >
          <WeatherModuleV2 />
        </Suspense>
      </section>
    </div>
  )
}
