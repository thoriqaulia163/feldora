/**
 * Dataset Extraction Script for Local Weather Forecast
 *
 * Fetches historical precipitation data from Open-Meteo for 500+ Indonesian cities.
 * Supports parallel fetching (concurrency 10), retry, resume, and progress logging.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025
 *
 * Output: public/dataset/local-weather-forecast/dataset.json
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── City Data ───────────────────────────────────────────────────────────────
// Loaded from src/lib/ml/cities.ts at build time (inlined for script portability)

interface CityData {
  name: string
  province: string
  latitude: number
  longitude: number
  elevation: number
  monsoonZone: number
}

// Dynamic import of cities list
async function loadCities(): Promise<CityData[]> {
  const citiesPath = path.resolve(__dirname, '..', '..', 'src', 'lib', 'ml', 'cities.ts')
  const content = fs.readFileSync(citiesPath, 'utf-8')
  // Extract the array using a simple eval approach via Function constructor
  // We parse the exported array from the TS file
  const match = content.match(/export const INDONESIA_CITIES: CityData\[\] = (\[[\s\S]*?\n\])/m)
  if (!match) throw new Error('Could not parse cities from cities.ts')
  // eslint-disable-next-line no-new-func
  const cities = new Function(`return ${match[1]}`)() as CityData[]
  return cities
}

// ─── ENSO & IOD Historical Data ──────────────────────────────────────────────

function getENSO(year: number, month: number): number {
  if (year === 2021) { return month <= 4 ? -1 : 0 }
  if (year === 2022) { return month <= 3 ? -1 : 0 }
  if (year === 2023) { return month <= 4 ? 0 : 1 }
  if (year === 2024) { if (month <= 4) return 1; if (month <= 7) return 0; return -1 }
  if (year === 2025) { return month <= 3 ? -1 : 0 }
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

// ─── Open-Meteo Fetch ───────────────────────────────────────────────────────

interface DailyData { time: string[]; precipitation_sum: number[] }

async function fetchCityData(city: CityData, startDate: string, endDate: string, retries = 3): Promise<DailyData> {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.latitude}&longitude=${city.longitude}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum&timezone=Asia%2FJakarta`

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
      const json = await res.json() as { daily: DailyData }
      return json.daily
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
  date: string; year: number; dayOfYear: number; city: string; province: string
  latitude: number; longitude: number; elevation: number
  monsoonZone: number; localSeasonIndex: number; enso: number; iod: number; rain: number
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
    console.error('Usage: npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025')
    process.exit(1)
  }

  const outputPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast', 'dataset.json')

  // Load cities
  const cities = await loadCities()

  console.log(`\n🌧️  Dataset Extraction: Open-Meteo (Parallel)`)
  console.log(`   Period: ${startYear}-01-01 → ${endYear}-12-31`)
  console.log(`   Cities: ${cities.length}`)
  console.log(`   Concurrency: 5`)
  console.log(`   Output: ${outputPath}\n`)

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Resume support — derive progress from existing dataset.json
  let existingData: DatasetSample[] = []
  let completedCities: Set<string> = new Set()

  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    completedCities = new Set(existingData.map((s) => s.city))
    if (completedCities.size > 0) {
      console.log(`📋 Resuming: ${completedCities.size}/${cities.length} cities found in existing dataset\n`)
    }
  }

  const startDate = `${startYear}-01-01`
  const endDate = `${endYear}-12-31`
  const remaining = cities.filter((c) => !completedCities.has(c.name))
  const allSamples: DatasetSample[] = [...existingData]

  const CONCURRENCY = 5
  const BATCH_SIZE = 20 // Save progress every 20 cities
  const startTime = Date.now()

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(remaining.length / BATCH_SIZE)
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} cities)`)

    const results = await processInParallel(batch, CONCURRENCY, async (city) => {
      const daily = await fetchCityData(city, startDate, endDate)
      const samples: DatasetSample[] = []

      for (let d = 0; d < daily.time.length; d++) {
        const dateStr = daily.time[d]
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000)
        const precipitation = daily.precipitation_sum[d] ?? 0

        samples.push({
          date: dateStr,
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
          rain: precipitation > 5 ? 1 : 0,
        })
      }
      return samples
    })

    // Process results
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

    // Small delay between batches
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

  const rainCount = allSamples.filter((s) => s.rain === 1).length
  const noRainCount = allSamples.length - rainCount
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n✅ Done in ${totalTime}s!`)
  console.log(`   Total samples: ${allSamples.length.toLocaleString()}`)
  console.log(`   Rain days: ${rainCount.toLocaleString()} (${((rainCount / allSamples.length) * 100).toFixed(1)}%)`)
  console.log(`   Dry days: ${noRainCount.toLocaleString()} (${((noRainCount / allSamples.length) * 100).toFixed(1)}%)`)
  console.log(`   Output: ${outputPath}\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
