/**
 * Threshold Tuning for V1 — no retrain needed.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast/threshold-tune.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SEED = 42
const THRESHOLDS = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70]

class PRNG {
  private state: number
  constructor(seed: number) { this.state = seed | 0 }
  next(): number { this.state = (this.state + 0x6d2b79f5) | 0; let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  nextInt(max: number): number { return Math.floor(this.next() * max) }
  shuffle<T>(arr: T[]): T[] { for (let i = arr.length - 1; i > 0; i--) { const j = this.nextInt(i + 1); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp }; return arr }
}

interface DatasetSample {
  dayOfYear: number; latitude: number; longitude: number; elevation: number
  monsoonZone: number; localSeasonIndex: number; enso: number; iod: number; rain: number
}

interface SerializedNode { f: number; t: number; l?: SerializedNode; r?: SerializedNode; p?: number; c?: number }
interface Model { trees: { root: SerializedNode }[]; [k: string]: unknown }

function sampleToFeatures(s: DatasetSample): number[] {
  return [s.dayOfYear, s.latitude, s.longitude, s.elevation, s.monsoonZone, s.localSeasonIndex, s.enso, s.iod]
}

function main() {
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast', 'dataset.json')
  const modelPath = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast', 'model.json')

  if (!fs.existsSync(datasetPath) || !fs.existsSync(modelPath)) { console.error('❌ Files not found.'); process.exit(1) }

  console.log('\n🎯 Threshold Tuning V1\n')
  const model: Model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'))
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))

  // Same split as training (same seed, 80/20)
  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)
  const testIndices = indices.slice(Math.floor(rawData.length * 0.8))
  console.log(`   Test: ${testIndices.length.toLocaleString()} samples\n`)

  // Get confidence (proportion of trees voting Rain) for each test sample
  const probs: number[] = []
  const actual: number[] = []

  for (const idx of testIndices) {
    const features = sampleToFeatures(rawData[idx])
    let rainVotes = 0
    for (const tree of model.trees) {
      let node: SerializedNode | undefined = tree.root
      while (node && node.f !== -1) { node = features[node.f] <= node.t ? node.l : node.r }
      // V1: confidence (c) represents probability of class 1 (rain)
      rainVotes += node?.c ?? 0
    }
    probs.push(rainVotes / model.trees.length)
    actual.push(rawData[idx].rain)
  }

  // Sweep thresholds
  let bestF1 = -1, bestT = 0.5
  console.log(`   ${'Thresh'.padEnd(8)} ${'Acc'.padStart(7)} ${'MacroF1'.padStart(8)} ${'F1(NoR)'.padStart(8)} ${'F1(Rain)'.padStart(9)} ${'R(NoR)'.padStart(7)} ${'R(Rain)'.padStart(8)}`)

  for (const threshold of THRESHOLDS) {
    let tp = 0, fp = 0, tn = 0, fn = 0
    for (let i = 0; i < probs.length; i++) {
      const pred = probs[i] >= threshold ? 1 : 0
      if (pred === 1 && actual[i] === 1) tp++
      else if (pred === 1 && actual[i] === 0) fp++
      else if (pred === 0 && actual[i] === 0) tn++
      else fn++
    }
    const acc = (tp + tn) / (tp + fp + tn + fn)
    const pH = tp + fp > 0 ? tp / (tp + fp) : 0, rH = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1H = pH + rH > 0 ? (2 * pH * rH) / (pH + rH) : 0
    const pN = tn + fn > 0 ? tn / (tn + fn) : 0, rN = tn + fp > 0 ? tn / (tn + fp) : 0
    const f1N = pN + rN > 0 ? (2 * pN * rN) / (pN + rN) : 0
    const macroF1 = (f1H + f1N) / 2
    const marker = macroF1 > bestF1 ? '  ◀' : ''
    console.log(`   ${threshold.toFixed(2).padEnd(8)} ${(acc * 100).toFixed(1).padStart(6)}% ${(macroF1 * 100).toFixed(1).padStart(7)}% ${(f1N * 100).toFixed(1).padStart(7)}% ${(f1H * 100).toFixed(1).padStart(8)}% ${(rN * 100).toFixed(1).padStart(6)}% ${(rH * 100).toFixed(1).padStart(7)}%${marker}`)
    if (macroF1 > bestF1) { bestF1 = macroF1; bestT = threshold }
  }

  console.log(`\n   → Optimal threshold: ${bestT}`)
  console.log(`   → Best Macro F1: ${(bestF1 * 100).toFixed(2)}%\n`)
}

main()
