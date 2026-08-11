import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const WeatherModuleV33 = lazy(() => import('~/components/playground/modules/weather-v3-3/WeatherModuleV33.js'))

export const Route = createFileRoute('/playground/local-weather-forecast-v3-3')({
  head: () => ({
    meta: [{ title: 'FELDORA — Local Weather Forecast V3.3' }],
  }),
  component: LocalWeatherForecastV33Page,
})

function LocalWeatherForecastV33Page() {
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
          <WeatherModuleV33 />
        </Suspense>
      </section>
    </div>
  )
}
