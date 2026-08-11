import { INDONESIA_CITIES, type CityData } from '~/lib/ml/cities'
import type { NNModelV33 } from '~/lib/ml/nn-local-weather-forecast-v3-3'

export const TIME_SLOT_LABELS = [
  { key: 'morning', label: 'Pagi', range: '05:00 – 10:59' },
  { key: 'afternoon', label: 'Siang', range: '11:00 – 14:59' },
  { key: 'evening', label: 'Sore', range: '15:00 – 17:59' },
  { key: 'night', label: 'Malam', range: '18:00 – 04:59' },
] as const

export const WEATHER_DISPLAY = [
  { label: 'Tidak Hujan', icon: '☀️', color: 'text-amber-400' },
  { label: 'Hujan', icon: '🌧️', color: 'text-blue-400' },
] as const

function getLocalSeasonIndex(month: number, monsoonZone: number): number {
  if (monsoonZone === 0) { if ([3,4,5,9,10,11].includes(month)) return 2; if ([6,7,12,1].includes(month)) return 1; return 0 }
  if (monsoonZone === 1) { if (month >= 11 || month <= 3) return 2; if (month >= 5 && month <= 9) return 0; return 1 }
  if (month >= 5 && month <= 9) return 2; if (month >= 11 || month <= 2) return 0; return 1
}

function computeDayLength(latitude: number, dayOfYear: number): number {
  const latRad = latitude * Math.PI / 180
  const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * Math.PI / 180
  const cosHA = -Math.tan(latRad) * Math.tan(decl)
  if (cosHA > 1) return 0; if (cosHA < -1) return 24
  return (2 * Math.acos(cosHA) * 180 / Math.PI) / 15
}

export function buildRawFeatureVector(
  cityName: string, enso: number, iod: number, prevDayRain: number, date?: Date,
): { features: number[]; featureMap: Record<string, number> } | null {
  const city = INDONESIA_CITIES.find(c => c.name === cityName)
  if (!city) return null
  const d = date ?? new Date()
  const startOfYear = new Date(d.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000)
  const month = d.getMonth() + 1
  const localSeasonIndex = getLocalSeasonIndex(month, city.monsoonZone)
  const sinDay = Math.sin((2*Math.PI*dayOfYear)/365), cosDay = Math.cos((2*Math.PI*dayOfYear)/365)
  const sinMonth = Math.sin((2*Math.PI*month)/12), cosMonth = Math.cos((2*Math.PI*month)/12)
  const dayLength = computeDayLength(city.latitude, dayOfYear)

  const features = [dayOfYear, city.latitude, city.longitude, city.elevation, city.monsoonZone, localSeasonIndex, enso, iod, prevDayRain, sinDay, cosDay, sinMonth, cosMonth, dayLength]
  const featureMap: Record<string, number> = { dayOfYear, latitude: city.latitude, longitude: city.longitude, elevation: city.elevation, monsoonZone: city.monsoonZone, localSeasonIndex, enso, iod, prevDayRain, sinDay: Math.round(sinDay*1000)/1000, cosDay: Math.round(cosDay*1000)/1000, sinMonth: Math.round(sinMonth*1000)/1000, cosMonth: Math.round(cosMonth*1000)/1000, dayLength: Math.round(dayLength*100)/100 }
  return { features, featureMap }
}

export function getLocationIdx(model: NNModelV33, cityName: string): number {
  return model.locationVocab.indexOf(cityName)
}

export { INDONESIA_CITIES }
export type { CityData }
