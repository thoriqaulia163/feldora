/**
 * Dataset Extraction Script for Local Weather Forecast V2
 *
 * Fetches hourly weather_code from Open-Meteo Historical Archive for 514 Indonesian cities.
 * Aggregates into 4 time slots (morning/afternoon/evening/night) using majority vote.
 * Labels are 5 weather categories mapped from WMO weather codes.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast-v2/dataset-extract.ts --start 2021 --end 2025
 *
 * Output: public/dataset/local-weather-forecast-v2/dataset.json
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── City Data ───────────────────────────────────────────────────────────────

interface CityData {
  name: string
  province: string
  latitude: number
  longitude: number
  elevation: number
  monsoonZone: number
}

async function loadCities(): Promise<CityData[]> {
  const citiesPath = path.resolve(__dirname, '..', '..', 'src', 'lib', 'ml', 'cities.ts')
  const content = fs.readFileSync(citiesPath, 'utf-8')
  const match = content.match(/export const INDONESIA_CITIES: CityData\[\] = (\[[\s\S]*?\n\])/m)
  if (!match) throw new Error('Could not parse cities from cities.ts')
  const cities = new Function(`return ${match[1]}`)() as CityData[]
  return cities
}

// ─── WMO Weather Code → Category Mapping ────────────────────────────────────

/**
 * Maps WMO weather codes to 5 categories:
 * 0=Cerah, 1=Berawan, 2=Gerimis, 3=Hujan, 4=Badai
 */
function wmoToCategory(code: number): number {
  if (code === 0 || code === 1) return 0      // Cerah
  if (code === 2 || code === 3) return 1      // Berawan
  if (code === 51 || code === 53 || code === 55) return 2  // Gerimis
  if (code === 61 || code === 63 || code === 65 ||
      code === 80 || code === 81 || code === 82) return 3  // Hujan
  if (code === 95 || code === 96 || code === 99) return 4  // Badai
  // Fallback: fog(45,48)→Berawan, snow(71-77)→Hujan, freezing(56,57,66,67)→Gerimis
  if (code === 45 || code === 48) return 1
  if (code >= 71 && code <= 77) return 3
  if (code === 56 || code === 57 || code === 66 || code === 67) return 2
  return 1 // Default: Berawan
}

// ─── Time Slot Definitions ──────────────────────────────────────────────────

/**
 * Time slots (hour ranges in local time):
 * Morning:   05:00–10:59 (hours 5-10)
 * Afternoon: 11:00–14:59 (hours 11-14)
 * Evening:   15:00–17:59 (hours 15-17)
 * Night:     18:00–04:59 (hours 18-23, 0-4)
 */
function getTimeSlot(hour: number): number {
  if (hour >= 5 && hour <= 10) return 0   // Morning
  if (hour >= 11 && hour <= 14) return 1  // Afternoon
  if (hour >= 15 && hour <= 17) return 2  // Evening
  return 3                                 // Night (18-23, 0-4)
}

/**
 * Majority vote: returns the most frequent category in an array.
 * Ties broken by choosing the lower category index (more common weather).
 */
function majorityVote(categories: number[]): number {
  const counts = [0, 0, 0, 0, 0]
  for (const c of categories) counts[c]++
  let maxCount = 0
  let maxCategory = 0
  for (let i = 0; i < 5; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i]
      maxCategory = i
    }
  }
  return maxCategory
}

// ─── ENSO & IOD Historical Data ──────────────────────────────────────────────

function getENSO(year: number, month: number): number {
  if (year === 2021) return month <= 4 ? -1 : 0
  if (year === 2022) return month <= 3 ? -1 : 0
  if (year === 2023) return month <= 4 ? 0 : 1
  if (year === 2024) { if (month <= 4) return 1; if (month <= 7) return 0; return -1 }
  if (year === 2025) return month <= 3 ? -1 : 0
  return 0
}

function getIOD(year: number, month: number): number {
  if (month < 5 || month > 11) return 0
  if (year === 2021) return 0
  if (year === 2022) return 1
  if (year === 2023) return 1
  if (year === 2024) return month <= 8 ? 0 : -1
  if (year === 2025) return 0
  return 0
}

function getLocalSeasonIndex(month: number, monsoonZone: number): number {
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
  if (month >= 5 && month <= 9) return 2
  if (month >= 11 || month <= 2) return 0
  return 1
}

// ─── Open-Meteo Fetch (Hourly) ──────────────────────────────────────────────

interface HourlyData {
  time: string[]
  weather_code: number[]
}

async function fetchCityHourly(city: CityData, startDate: string, endDate: string, retries = 3): Promise<HourlyData> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.latitude}&longitude=${city.longitude}&start_date=${startDate}&end_date=${endDate}&hourly=weather_code&timezone=Asia%2FJakarta`

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 429) {
          await sleep((attempt + 1) * 5000)
          continue
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const json = await res.json() as { hourly: HourlyData }
      return json.hourly
    } catch (err) {
      if (attempt < retries - 1) {
        await sleep((attempt + 1) * 2000)
      } else {
        throw err
      }
    }
  }
  throw new Error(`Failed after ${retries} retries`)
}

function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)) }

// ─── Dataset Sample ─────────────────────────────────────────────────────────

interface DatasetSample {
  date: string
  year: number
  dayOfYear: number
  city: string
  province: string
  latitude: number
  longitude: number
  elevation: number
  monsoonZone: number
  localSeasonIndex: number
  enso: number
  iod: number
  morning: number    // 0-3
  afternoon: number  // 0-3
  evening: number    // 0-3
  night: number      // 0-3
  prevDayRainSlots: number // 0-4
}

// ─── Aggregate Hourly → Daily Slots ─────────────────────────────────────────

/** Count how many of the 4 slots have precipitation (Gerimis=2 or Hujan=3) */
function countRainSlots(morning: number, afternoon: number, evening: number, night: number): number {
  let count = 0
  if (morning >= 2) count++
  if (afternoon >= 2) count++
  if (evening >= 2) count++
  if (night >= 2) count++
  return count
}

function aggregateHourlyToDaily(hourly: HourlyData, city: CityData): DatasetSample[] {
  // Group by date
  const dayMap = new Map<string, { slotCodes: number[][] }>()

  for (let i = 0; i < hourly.time.length; i++) {
    const timestamp = hourly.time[i] // Format: "2021-01-01T00:00"
    const code = hourly.weather_code[i]
    if (code === null || code === undefined) continue

    const hour = parseInt(timestamp.slice(11, 13))
    const slot = getTimeSlot(hour)

    // For night slot (18:00-04:59): hours 0-4 belong to previous day's night
    let dateStr: string
    if (hour >= 0 && hour <= 4) {
      // Belongs to previous calendar day's night cycle
      const d = new Date(timestamp.slice(0, 10) + 'T12:00:00Z')
      d.setDate(d.getDate() - 1)
      dateStr = d.toISOString().slice(0, 10)
    } else {
      dateStr = timestamp.slice(0, 10)
    }

    if (!dayMap.has(dateStr)) {
      dayMap.set(dateStr, { slotCodes: [[], [], [], []] })
    }
    dayMap.get(dateStr)!.slotCodes[slot].push(wmoToCategory(code))
  }

  // Convert to samples, sorted by date
  const sortedDates = [...dayMap.keys()].sort()
  const dailySlots: { dateStr: string; morning: number; afternoon: number; evening: number; night: number }[] = []

  for (const dateStr of sortedDates) {
    const data = dayMap.get(dateStr)!
    // Skip days where any slot has no data
    if (data.slotCodes.some((s) => s.length === 0)) continue

    dailySlots.push({
      dateStr,
      morning: majorityVote(data.slotCodes[0]),
      afternoon: majorityVote(data.slotCodes[1]),
      evening: majorityVote(data.slotCodes[2]),
      night: majorityVote(data.slotCodes[3]),
    })
  }

  // Build samples with prevDayRainSlots
  const samples: DatasetSample[] = []

  for (let i = 0; i < dailySlots.length; i++) {
    const day = dailySlots[i]
    const date = new Date(day.dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000)

    // Compute prevDayRainSlots
    let prevDayRainSlots: number
    if (i === 0) {
      prevDayRainSlots = 1 // Default for first day (no previous data)
    } else {
      const prev = dailySlots[i - 1]
      // Only use if previous day is actually the day before (no gap)
      const prevDate = new Date(prev.dateStr)
      const diffDays = (date.getTime() - prevDate.getTime()) / 86400000
      if (diffDays === 1) {
        prevDayRainSlots = countRainSlots(prev.morning, prev.afternoon, prev.evening, prev.night)
      } else {
        prevDayRainSlots = 1 // Gap in data, use default
      }
    }

    samples.push({
      date: day.dateStr,
      year,
      dayOfYear,
      city: city.name,
      province: city.province,
      latitude: city.latitude,
      longitude: city.longitude,
      elevation: city.elevation,
      monsoonZone: city.monsoonZone,
      localSeasonIndex: getLocalSeasonIndex(month, city.monsoonZone),
      enso: getENSO(year, month),
      iod: getIOD(year, month),
      morning: day.morning,
      afternoon: day.afternoon,
      evening: day.evening,
      night: day.night,
      prevDayRainSlots,
    })
  }

  return samples
}

// ─── Parallel batch helper ──────────────────────────────────────────────────

async function processInParallel<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<(R | Error)[]> {
  const results: (R | Error)[] = new Array(items.length)
  let index = 0

  async function worker() {
    while (index < items.length) {
      const i = index++
      try {
        results[i] = await fn(items[i])
      } catch (err) {
        results[i] = err instanceof Error ? err : new Error(String(err))
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const startIdx = args.indexOf('--start')
  const endIdx = args.indexOf('--end')

  const startYear = startIdx !== -1 ? parseInt(args[startIdx + 1]) : 2021
  const endYear = endIdx !== -1 ? parseInt(args[endIdx + 1]) : 2025

  if (isNaN(startYear) || isNaN(endYear) || startYear > endYear) {
    console.error('Usage: npx tsx scripts/local-weather-forecast-v2/dataset-extract.ts --start 2021 --end 2025')
    process.exit(1)
  }

  const outputPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast-v2', 'dataset.json')

  const cities = await loadCities()

  console.log(`\n⛅ Dataset Extraction V2: Open-Meteo Hourly (weather_code)`)
  console.log(`   Period: ${startYear}-01-01 → ${endYear}-12-31`)
  console.log(`   Cities: ${cities.length}`)
  console.log(`   Concurrency: 5`)
  console.log(`   Output: ${outputPath}\n`)

  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Resume support
  let existingData: DatasetSample[] = []
  let completedCities: Set<string> = new Set()

  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    completedCities = new Set(existingData.map((s) => s.city))
    if (completedCities.size > 0) {
      console.log(`📋 Resuming: ${completedCities.size}/${cities.length} cities found in existing dataset\n`)
    }
  }

  const startDate = `${startYear - 1}-12-31` // 1 day earlier for prevDay of first day
  const endDate = `${endYear}-12-31`
  const remaining = cities.filter((c) => !completedCities.has(c.name))
  const allSamples: DatasetSample[] = [...existingData]

  const CONCURRENCY = 5
  const BATCH_SIZE = 10 // Smaller batches due to larger hourly responses
  const startTime = Date.now()

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(remaining.length / BATCH_SIZE)
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} cities)`)

    const results = await processInParallel(batch, CONCURRENCY, async (city) => {
      const hourly = await fetchCityHourly(city, startDate, endDate)
      return aggregateHourlyToDaily(hourly, city)
    })

    let batchSuccess = 0
    let batchFail = 0
    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      if (result instanceof Error) {
        batchFail++
        console.log(`   ❌ ${batch[j].name}: ${result.message}`)
      } else {
        batchSuccess++
        allSamples.push(...result)
        completedCities.add(batch[j].name)
      }
    }
    console.log(`   ✅ ${batchSuccess} success, ${batchFail} failed`)

    // Save progress
    fs.writeFileSync(outputPath, JSON.stringify(allSamples))

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
    const progress = ((completedCities.size / cities.length) * 100).toFixed(1)
    console.log(`   💾 ${allSamples.length} samples | ${progress}% | ${elapsed}s elapsed\n`)

    if (i + BATCH_SIZE < remaining.length) {
      await sleep(2000)
    }
  }

  // Final save
  fs.writeFileSync(outputPath, JSON.stringify(allSamples))
  const failedCount = cities.length - completedCities.size
  if (failedCount > 0) {
    console.log(`\n⚠️  ${failedCount} cities failed. Run the same command again to retry them.`)
  }

  // Category distribution
  const LABELS = ['Cerah', 'Berawan', 'Gerimis', 'Hujan']
  const slotNames = ['Morning', 'Afternoon', 'Evening', 'Night']
  const slotKeys = ['morning', 'afternoon', 'evening', 'night'] as const

  console.log(`\n📊 Category Distribution:`)
  for (let s = 0; s < 4; s++) {
    const counts = [0, 0, 0, 0]
    for (const sample of allSamples) {
      counts[Math.min(sample[slotKeys[s]], 3)]++
    }
    console.log(`   ${slotNames[s]}:`)
    for (let c = 0; c < 4; c++) {
      const pct = allSamples.length > 0 ? ((counts[c] / allSamples.length) * 100).toFixed(1) : '0'
      console.log(`     ${LABELS[c].padEnd(8)} ${counts[c].toLocaleString().padStart(8)} (${pct}%)`)
    }
  }

  // prevDayRainSlots distribution
  const prevDist = [0, 0, 0, 0, 0]
  for (const sample of allSamples) prevDist[sample.prevDayRainSlots]++
  console.log(`   prevDayRainSlots:`)
  for (let i = 0; i <= 4; i++) {
    const pct = allSamples.length > 0 ? ((prevDist[i] / allSamples.length) * 100).toFixed(1) : '0'
    console.log(`     ${i} slots  ${prevDist[i].toLocaleString().padStart(8)} (${pct}%)`)
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n✅ Done in ${totalTime}s!`)
  console.log(`   Total samples: ${allSamples.length.toLocaleString()}`)
  console.log(`   Output: ${outputPath}\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
