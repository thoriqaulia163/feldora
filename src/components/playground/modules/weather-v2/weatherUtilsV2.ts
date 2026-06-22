import { INDONESIA_CITIES, type CityData } from '~/lib/ml/cities'

/**
 * Time slot definitions for V2.
 * Morning: 05:00–10:59, Afternoon: 11:00–14:59, Evening: 15:00–17:59, Night: 18:00–04:59
 */
export const TIME_SLOT_LABELS = [
  { key: 'morning', label: 'Pagi', range: '05:00 – 10:59' },
  { key: 'afternoon', label: 'Siang', range: '11:00 – 14:59' },
  { key: 'evening', label: 'Sore', range: '15:00 – 17:59' },
  { key: 'night', label: 'Malam', range: '18:00 – 04:59' },
] as const

/**
 * Weather category icons and colors for display.
 */
export const WEATHER_DISPLAY = [
  { label: 'Tidak Hujan', icon: '☀️', color: 'text-amber-400' },
  { label: 'Hujan', icon: '🌧️', color: 'text-blue-400' },
] as const

/**
 * Get local season index based on month and monsoon zone.
 * 0 = Kemarau (dry), 1 = Transisi (transition), 2 = Hujan (wet)
 */
export function getLocalSeasonIndex(month: number, monsoonZone: number): number {
  // Equatorial zone
  if (monsoonZone === 0) {
    const wetMonths = [3, 4, 5, 9, 10, 11]
    const transitionMonths = [6, 7, 12, 1]
    if (wetMonths.includes(month)) return 2
    if (transitionMonths.includes(month)) return 1
    return 0
  }
  // Monsoonal zone
  if (monsoonZone === 1) {
    if (month >= 11 || month <= 3) return 2
    if (month >= 5 && month <= 9) return 0
    return 1
  }
  // Local zone (2)
  if (month >= 5 && month <= 9) return 2
  if (month >= 11 || month <= 2) return 0
  return 1
}

/**
 * Build feature vector for V2 prediction.
 * Feature order: [dayOfYear, latitude, longitude, elevation, monsoonZone, localSeasonIndex, enso, iod, prevDayRainSlots]
 */
export function buildFeatureVector(
  cityName: string,
  enso: number,
  iod: number,
  prevDayRainSlots: number,
  date?: Date
): { features: number[]; featureMap: Record<string, number> } | null {
  const city = INDONESIA_CITIES.find((c) => c.name === cityName)
  if (!city) return null

  const targetDate = date ?? new Date()
  const startOfYear = new Date(targetDate.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / 86400000)
  const month = targetDate.getMonth() + 1
  const localSeasonIndex = getLocalSeasonIndex(month, city.monsoonZone)

  const features = [
    dayOfYear,
    city.latitude,
    city.longitude,
    city.elevation,
    city.monsoonZone,
    localSeasonIndex,
    enso,
    iod,
    prevDayRainSlots,
  ]

  const featureMap: Record<string, number> = {
    dayOfYear,
    latitude: city.latitude,
    longitude: city.longitude,
    elevation: city.elevation,
    monsoonZone: city.monsoonZone,
    localSeasonIndex,
    enso,
    iod,
    prevDayRainSlots,
  }

  return { features, featureMap }
}

export { INDONESIA_CITIES } from '~/lib/ml/cities'
export type { CityData } from '~/lib/ml/cities'
