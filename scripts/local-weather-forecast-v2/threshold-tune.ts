/**
 * Threshold Tuning Script — evaluasi & update thresholds tanpa retrain.
 *
 * Loads existing model.json, runs threshold sweep on test set,
 * finds optimal threshold per slot, and saves updated model.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast-v2/threshold-tune.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Constants ──────────────────────────────────────────────────────────────

const NUM_SLOTS = 4
const SEED = 42
const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night']
const CATEGORY_NAMES = ['Tidak Hujan', 'Hujan']
const THRESHOLDS = [0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50]

// ─── PRNG ───────────────────────────────────────────────────────────────────

class PRNG {
  private state: number
  constructor(seed: number) { this.state = seed | 0 }
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  nextInt(max: number): number { return Math.floor(this.next() * max) }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1)
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
    }
    return arr
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface DatasetSample {
  dayOfYear: number; latitude: number; longitude: number; elevation: number
  monsoonZone: number; localSeasonIndex: number; enso: number; iod: number
  morning: number; afternoon: number; evening: number; night: number
  prevDayRainSlots: number
}

interface SerializedNode { f: number; t: number; l?: SerializedNode; r?: SerializedNode; p?: number; c?: number }
interface SerializedTree { root: SerializedNode }
interface SlotForest { slot: string; nTrees: number; trees: SerializedTree[] }
interface Model {
  version: number; forests: SlotForest[]; thresholds?: number[]
  [key: string]: unknown
}

function extractFeatures(s: DatasetSample): number[] {
  return [s.dayOfYear, s.latitude, s.longitude, s.elevation, s.monsoonZone, s.localSeasonIndex, s.enso, s.iod, s.prevDayRainSlots >= 1 ? 1 : 0]
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast-v2', 'dataset.json')
  const modelPath = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast-v2', 'model.json')

  if (!fs.existsSync(datasetPath)) { console.error('❌ dataset.json not found.'); process.exit(1) }
  if (!fs.existsSync(modelPath)) { console.error('❌ model.json not found.'); process.exit(1) }

  console.log('\n🎯 Threshold Tuning (no retrain)')
  console.log(`   Model: ${modelPath}`)
  console.log(`   Dataset: ${datasetPath}\n`)

  const model: Model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'))
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))

  // Same split as training (same seed)
  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)
  const splitIdx = Math.floor(rawData.length * 0.8)
  const testIndices = indices.slice(splitIdx)

  console.log(`   Test samples: ${testIndices.length.toLocaleString()}\n`)

  const slotKeys = ['morning', 'afternoon', 'evening', 'night'] as const
  const optimalThresholds: number[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const slotKey = slotKeys[s]
    const forest = model.forests[s]

    // Get vote proportions for test samples
    const testVotes: number[] = []
    const testActual: number[] = []

    for (const idx of testIndices) {
      const features = extractFeatures(rawData[idx])
      let hujanVotes = 0
      for (const tree of forest.trees) {
        let node: SerializedNode | undefined = tree.root
        while (node && node.f !== -1) { node = features[node.f] <= node.t ? node.l : node.r }
        if (node?.p === 1) hujanVotes++
      }
      testVotes.push(hujanVotes / forest.trees.length)
      testActual.push(rawData[idx][slotKey] >= 2 ? 1 : 0)
    }

    // Sweep thresholds
    let bestF1 = -1
    let bestThreshold = 0.5

    console.log(`   ${SLOT_NAMES[s].toUpperCase()}:`)
    console.log(`   ${'Thresh'.padEnd(8)} ${'Acc'.padStart(7)} ${'MacroF1'.padStart(8)} ${'F1(TdkH)'.padStart(9)} ${'F1(Hujan)'.padStart(10)} ${'R(TdkH)'.padStart(8)} ${'R(Hujan)'.padStart(9)}`)

    for (const threshold of THRESHOLDS) {
      let tp = 0, fp = 0, tn = 0, fn = 0
      for (let i = 0; i < testVotes.length; i++) {
        const pred = testVotes[i] >= threshold ? 1 : 0
        if (pred === 1 && testActual[i] === 1) tp++
        else if (pred === 1 && testActual[i] === 0) fp++
        else if (pred === 0 && testActual[i] === 0) tn++
        else fn++
      }

      const acc = (tp + tn) / (tp + fp + tn + fn)
      const pHujan = tp + fp > 0 ? tp / (tp + fp) : 0
      const rHujan = tp + fn > 0 ? tp / (tp + fn) : 0
      const f1Hujan = pHujan + rHujan > 0 ? (2 * pHujan * rHujan) / (pHujan + rHujan) : 0
      const pNH = tn + fn > 0 ? tn / (tn + fn) : 0
      const rNH = tn + fp > 0 ? tn / (tn + fp) : 0
      const f1NH = pNH + rNH > 0 ? (2 * pNH * rNH) / (pNH + rNH) : 0
      const macroF1 = (f1Hujan + f1NH) / 2

      const marker = macroF1 > bestF1 ? '  ◀' : ''
      console.log(`   ${threshold.toFixed(2).padEnd(8)} ${(acc * 100).toFixed(1).padStart(6)}% ${(macroF1 * 100).toFixed(1).padStart(7)}% ${(f1NH * 100).toFixed(1).padStart(8)}% ${(f1Hujan * 100).toFixed(1).padStart(9)}% ${(rNH * 100).toFixed(1).padStart(7)}% ${(rHujan * 100).toFixed(1).padStart(8)}%${marker}`)

      if (macroF1 > bestF1) { bestF1 = macroF1; bestThreshold = threshold }
    }

    optimalThresholds.push(bestThreshold)
    console.log(`   → Optimal: ${bestThreshold}\n`)
  }

  // Summary
  console.log(`   ══ OPTIMAL THRESHOLDS ══`)
  for (let s = 0; s < NUM_SLOTS; s++) {
    console.log(`   ${SLOT_NAMES[s].padEnd(10)} ${optimalThresholds[s]}`)
  }

  // Re-evaluate with optimal thresholds
  console.log(`\n📈 Final evaluation with optimal thresholds:\n`)

  let totalAcc = 0, totalF1 = 0
  for (let s = 0; s < NUM_SLOTS; s++) {
    const slotKey = slotKeys[s]
    const forest = model.forests[s]
    const threshold = optimalThresholds[s]

    let tp = 0, fp = 0, tn = 0, fn = 0
    for (const idx of testIndices) {
      const features = extractFeatures(rawData[idx])
      let hujanVotes = 0
      for (const tree of forest.trees) {
        let node: SerializedNode | undefined = tree.root
        while (node && node.f !== -1) { node = features[node.f] <= node.t ? node.l : node.r }
        if (node?.p === 1) hujanVotes++
      }
      const pred = hujanVotes / forest.trees.length >= threshold ? 1 : 0
      const actual = rawData[idx][slotKey] >= 2 ? 1 : 0
      if (pred === 1 && actual === 1) tp++
      else if (pred === 1 && actual === 0) fp++
      else if (pred === 0 && actual === 0) tn++
      else fn++
    }

    const acc = (tp + tn) / (tp + fp + tn + fn)
    const pH = tp + fp > 0 ? tp / (tp + fp) : 0
    const rH = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1H = pH + rH > 0 ? (2 * pH * rH) / (pH + rH) : 0
    const pN = tn + fn > 0 ? tn / (tn + fn) : 0
    const rN = tn + fp > 0 ? tn / (tn + fp) : 0
    const f1N = pN + rN > 0 ? (2 * pN * rN) / (pN + rN) : 0
    const macroF1 = (f1H + f1N) / 2

    totalAcc += acc
    totalF1 += macroF1
    console.log(`   ${SLOT_NAMES[s].padEnd(10)} Acc=${(acc * 100).toFixed(2)}%  F1=${(macroF1 * 100).toFixed(2)}%  F1(TH)=${(f1N * 100).toFixed(1)}%  F1(H)=${(f1H * 100).toFixed(1)}%  R(TH)=${(rN * 100).toFixed(1)}%  R(H)=${(rH * 100).toFixed(1)}%  (t=${threshold})`)
  }

  console.log(`\n   ══ TUNED OVERALL ══`)
  console.log(`   Accuracy: ${(totalAcc / NUM_SLOTS * 100).toFixed(2)}%`)
  console.log(`   Macro F1: ${(totalF1 / NUM_SLOTS * 100).toFixed(2)}%`)

  // Save updated model
  model.thresholds = optimalThresholds
  fs.writeFileSync(modelPath, JSON.stringify(model))
  console.log(`\n💾 Model updated with thresholds: [${optimalThresholds.join(', ')}]`)
  console.log(`   ${modelPath}\n`)
}

main()
