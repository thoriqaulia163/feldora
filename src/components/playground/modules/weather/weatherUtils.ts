import { INDONESIA_CITIES, type CityData } from '~/lib/ml/cities'

/**
 * Get local season index based on month and monsoon zone.
 * 0 = Kemarau (dry), 1 = Transisi (transition), 2 = Hujan (wet)
 */
export function getLocalSeasonIndex(month: number, monsoonZone: number): number {
  if (monsoonZone === 0) {
    if (month >= 3 && month <= 5) return 2
    if (month >= 9 && month <= 11) return 2
    if (month === 6 || month === 7 || month === 12 || month === 1) return 1
    return 0
  }
  if (monsoonZone === 1) {
    if (month >= 11 || month <= 3) return 2
    if (month >= 5 && month <= 9) return 0
    return 1
  }
  // Local (zone 2)
  if (month >= 5 && month <= 9) return 2
  if (month >= 11 || month <= 2) return 0
  return 1
}

/**
 * Build feature vector matching training order:
 * [dayOfYear, latitude, longitude, elevation, monsoonZone, localSeasonIndex, enso, iod]
 */
export function buildFeatureVector(
  cityName: string,
  enso: number,
  iod: number,
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
  }

  return { features, featureMap }
}

export function getSeasonLabel(index: number): string {
  if (index === 0) return 'Kemarau'
  if (index === 1) return 'Transisi'
  return 'Hujan'
}

export function getMonsoonLabel(zone: number): string {
  if (zone === 0) return 'Equatorial'
  if (zone === 1) return 'Monsoonal'
  return 'Local'
}

export { INDONESIA_CITIES }
export type { CityData }
