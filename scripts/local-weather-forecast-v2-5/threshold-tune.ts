/**
 * Threshold Tuning for V3 (GBT) — no retrain needed.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast-v2-5/threshold-tune.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const NUM_SLOTS = 4
const SEED = 42
const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night']
const THRESHOLDS = [0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60]

class PRNG {
  private state: number
  constructor(seed: number) { this.state = seed | 0 }
  next(): number { this.state = (this.state + 0x6d2b79f5) | 0; let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  nextInt(max: number): number { return Math.floor(this.next() * max) }
  shuffle<T>(arr: T[]): T[] { for (let i = arr.length - 1; i > 0; i--) { const j = this.nextInt(i + 1); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp }; return arr }
}

interface DatasetSample { dayOfYear: number; latitude: number; longitude: number; elevation: number; monsoonZone: number; localSeasonIndex: number; enso: number; iod: number; morning: number; afternoon: number; evening: number; night: number; prevDayRainSlots: number }
interface GBTNode { f: number; t: number; l?: GBTNode; r?: GBTNode; v?: number }
interface Model { forests: { slot: string; baseScore: number; learningRate: number; trees: { root: GBTNode }[] }[]; thresholds: number[]; [k: string]: unknown }

function computeDayLength(lat: number, doy: number): number { const lr = lat * Math.PI / 180; const d = 23.45 * Math.sin((2 * Math.PI / 365) * (doy - 81)) * Math.PI / 180; const c = -Math.tan(lr) * Math.tan(d); if (c > 1) return 0; if (c < -1) return 24; return (2 * Math.acos(c) * 180 / Math.PI) / 15 }
function extractFeatures(s: DatasetSample): number[] { return [s.dayOfYear, s.latitude, s.longitude, s.elevation, s.monsoonZone, s.localSeasonIndex, s.enso, s.iod, s.prevDayRainSlots >= 1 ? 1 : 0, Math.sin((2 * Math.PI * s.dayOfYear) / 365), Math.cos((2 * Math.PI * s.dayOfYear) / 365), computeDayLength(s.latitude, s.dayOfYear)] }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)) }
function traverseTree(node: GBTNode, features: number[]): number { if (node.f === -1) return node.v ?? 0; return features[node.f] <= node.t ? traverseTree(node.l!, features) : traverseTree(node.r!, features) }

function main() {
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast-v2-5', 'dataset.json')
  const modelPath = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast-v2-5', 'model.json')
  if (!fs.existsSync(datasetPath) || !fs.existsSync(modelPath)) { console.error('❌ Files not found.'); process.exit(1) }

  console.log('\n🎯 Threshold Tuning V3 (GBT)\n')
  const model: Model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'))
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))

  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)
  const testIndices = indices.slice(Math.floor(rawData.length * 0.8))
  console.log(`   Test: ${testIndices.length.toLocaleString()} samples\n`)

  const slotKeys = ['morning', 'afternoon', 'evening', 'night'] as const
  const optimalThresholds: number[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const forest = model.forests[s]
    const slotKey = slotKeys[s]

    // Get probabilities
    const probs: number[] = []
    const actual: number[] = []
    for (const idx of testIndices) {
      const features = extractFeatures(rawData[idx])
      let score = forest.baseScore
      for (const tree of forest.trees) score += forest.learningRate * traverseTree(tree.root, features)
      probs.push(sigmoid(score))
      actual.push(rawData[idx][slotKey] >= 2 ? 1 : 0)
    }

    let bestF1 = -1, bestT = 0.5
    console.log(`   ${SLOT_NAMES[s].toUpperCase()}:`)
    console.log(`   ${'Thresh'.padEnd(8)} ${'Acc'.padStart(7)} ${'MacroF1'.padStart(8)} ${'F1(TdkH)'.padStart(9)} ${'F1(Hujan)'.padStart(10)} ${'R(TdkH)'.padStart(8)} ${'R(Hujan)'.padStart(9)}`)

    for (const threshold of THRESHOLDS) {
      let tp = 0, fp = 0, tn = 0, fn = 0
      for (let i = 0; i < probs.length; i++) {
        const pred = probs[i] >= threshold ? 1 : 0
        if (pred === 1 && actual[i] === 1) tp++; else if (pred === 1 && actual[i] === 0) fp++
        else if (pred === 0 && actual[i] === 0) tn++; else fn++
      }
      const acc = (tp + tn) / (tp + fp + tn + fn)
      const pH = tp + fp > 0 ? tp / (tp + fp) : 0, rH = tp + fn > 0 ? tp / (tp + fn) : 0
      const f1H = pH + rH > 0 ? (2 * pH * rH) / (pH + rH) : 0
      const pN = tn + fn > 0 ? tn / (tn + fn) : 0, rN = tn + fp > 0 ? tn / (tn + fp) : 0
      const f1N = pN + rN > 0 ? (2 * pN * rN) / (pN + rN) : 0
      const macroF1 = (f1H + f1N) / 2
      const marker = macroF1 > bestF1 ? '  ◀' : ''
      console.log(`   ${threshold.toFixed(2).padEnd(8)} ${(acc * 100).toFixed(1).padStart(6)}% ${(macroF1 * 100).toFixed(1).padStart(7)}% ${(f1N * 100).toFixed(1).padStart(8)}% ${(f1H * 100).toFixed(1).padStart(9)}% ${(rN * 100).toFixed(1).padStart(7)}% ${(rH * 100).toFixed(1).padStart(8)}%${marker}`)
      if (macroF1 > bestF1) { bestF1 = macroF1; bestT = threshold }
    }
    optimalThresholds.push(bestT)
    console.log(`   → Optimal: ${bestT}\n`)
  }

  model.thresholds = optimalThresholds
  fs.writeFileSync(modelPath, JSON.stringify(model))
  console.log(`   Thresholds: [${optimalThresholds.join(', ')}]`)
  console.log(`💾 Model updated: ${modelPath}\n`)
}

main()
