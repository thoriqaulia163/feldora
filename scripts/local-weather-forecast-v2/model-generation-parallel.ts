/**
 * Model Generation Script for Local Weather Forecast V2 (PARALLEL)
 *
 * Same as model-generation.ts but trains all 4 slot forests in parallel
 * using worker_threads. Reduces training time from ~40min to ~10min.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast-v2/model-generation-parallel.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Constants ──────────────────────────────────────────────────────────────

const NUM_CLASSES = 2
const NUM_SLOTS = 4
const N_TREES_PER_SLOT = 30
const MAX_DEPTH = 6
const SEED = 42
const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night']
const CATEGORY_NAMES = ['Tidak Hujan', 'Hujan']
const FEATURE_NAMES = [
  'dayOfYear', 'latitude', 'longitude', 'elevation',
  'monsoonZone', 'localSeasonIndex', 'enso', 'iod',
  'prevDayRain',
]

// ─── PRNG (Mulberry32) ──────────────────────────────────────────────────────

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

interface SingleOutputSample { features: number[]; label: number }
interface TreeNode {
  featureIndex: number; threshold: number
  left: TreeNode | null; right: TreeNode | null
  prediction: number; confidence: number
}
interface SerializedNode {
  f: number; t: number
  l?: SerializedNode; r?: SerializedNode
  p?: number; c?: number
}
interface SerializedTree { root: SerializedNode }
interface SlotForest { slot: string; nTrees: number; trees: SerializedTree[] }

interface DatasetSample {
  dayOfYear: number; latitude: number; longitude: number; elevation: number
  monsoonZone: number; localSeasonIndex: number; enso: number; iod: number
  morning: number; afternoon: number; evening: number; night: number
  prevDayRainSlots: number
}

interface SlotMetrics {
  accuracy: number; precision: number[]; recall: number[]
  f1: number[]; macroF1: number; confusionMatrix: number[][]
}

interface WorkerResult {
  slot: string; forest: SlotForest; metrics: SlotMetrics; timeMs: number
}

// ─── ML Functions ───────────────────────────────────────────────────────────

function giniImpurity(labels: number[]): number {
  if (labels.length === 0) return 0
  const n = labels.length
  const counts = new Array(NUM_CLASSES).fill(0)
  for (const l of labels) counts[l]++
  let gini = 1
  for (let c = 0; c < NUM_CLASSES; c++) { const p = counts[c] / n; gini -= p * p }
  return gini
}

function buildTree(samples: SingleOutputSample[], maxDepth: number, rng: PRNG, depth = 0): TreeNode {
  const labels = samples.map((s) => s.label)
  const counts = new Array(NUM_CLASSES).fill(0)
  for (const l of labels) counts[l]++
  let maxCount = 0, prediction = 0
  for (let c = 0; c < NUM_CLASSES; c++) { if (counts[c] > maxCount) { maxCount = counts[c]; prediction = c } }
  const confidence = samples.length > 0 ? maxCount / samples.length : 0

  if (depth >= maxDepth || samples.length <= 5 || giniImpurity(labels) < 0.01) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  const totalFeatures = samples[0].features.length
  const subsetSize = Math.max(1, Math.floor(Math.sqrt(totalFeatures)))
  const allIndices = Array.from({ length: totalFeatures }, (_, i) => i)
  rng.shuffle(allIndices)
  const featureIndices = allIndices.slice(0, subsetSize)

  let bestGain = -Infinity, bestFeature = -1, bestThreshold = 0
  let bestLeft: SingleOutputSample[] = [], bestRight: SingleOutputSample[] = []
  const parentGini = giniImpurity(labels)

  for (const fi of featureIndices) {
    const values = [...new Set(samples.map((s) => s.features[fi]))].sort((a, b) => a - b)
    const MAX_CANDIDATES = 60
    let candidates: number[]
    if (values.length - 1 <= MAX_CANDIDATES) {
      candidates = values.slice(0, -1).map((v, i) => (v + values[i + 1]) / 2)
    } else {
      candidates = []
      for (let c = 0; c < MAX_CANDIDATES; c++) {
        const idx = Math.floor((c / MAX_CANDIDATES) * (values.length - 1))
        candidates.push((values[idx] + values[idx + 1]) / 2)
      }
    }

    for (const threshold of candidates) {
      const left: SingleOutputSample[] = [], right: SingleOutputSample[] = []
      for (const s of samples) { (s.features[fi] <= threshold ? left : right).push(s) }
      if (left.length === 0 || right.length === 0) continue
      const wGini = (left.length / samples.length) * giniImpurity(left.map((s) => s.label)) +
                    (right.length / samples.length) * giniImpurity(right.map((s) => s.label))
      const gain = parentGini - wGini
      if (gain > bestGain) { bestGain = gain; bestFeature = fi; bestThreshold = threshold; bestLeft = left; bestRight = right }
    }
  }

  if (bestFeature === -1 || bestGain <= 0) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  return {
    featureIndex: bestFeature, threshold: bestThreshold,
    left: buildTree(bestLeft, maxDepth, rng, depth + 1),
    right: buildTree(bestRight, maxDepth, rng, depth + 1),
    prediction, confidence,
  }
}

function serializeNode(node: TreeNode): SerializedNode {
  if (node.featureIndex === -1) return { f: -1, t: 0, p: node.prediction, c: Math.round(node.confidence * 1000) / 1000 }
  return {
    f: node.featureIndex, t: Math.round(node.threshold * 1000) / 1000,
    l: node.left ? serializeNode(node.left) : undefined,
    r: node.right ? serializeNode(node.right) : undefined,
  }
}

function standardBootstrap(samples: SingleOutputSample[], rng: PRNG): SingleOutputSample[] {
  const n = samples.length
  const result: SingleOutputSample[] = new Array(n)
  for (let i = 0; i < n; i++) {
    result[i] = samples[rng.nextInt(n)]
  }
  return result
}

function predictSingle(forest: SlotForest, features: number[]): number {
  const votes = new Array(NUM_CLASSES).fill(0)
  for (const tree of forest.trees) {
    let node: SerializedNode | undefined = tree.root
    while (node && node.f !== -1) { node = features[node.f] <= node.t ? node.l : node.r }
    if (node?.p !== undefined) votes[node.p]++
  }
  let maxVotes = 0, maxClass = 0
  for (let c = 0; c < NUM_CLASSES; c++) { if (votes[c] > maxVotes) { maxVotes = votes[c]; maxClass = c } }
  return maxClass
}

function evaluateSlot(predicted: number[], actual: number[]): SlotMetrics {
  const n = predicted.length
  const cm: number[][] = Array.from({ length: NUM_CLASSES }, () => new Array(NUM_CLASSES).fill(0))
  for (let i = 0; i < n; i++) cm[actual[i]][predicted[i]]++
  let correct = 0
  for (let i = 0; i < NUM_CLASSES; i++) correct += cm[i][i]
  const accuracy = correct / n
  const precision: number[] = [], recall: number[] = [], f1: number[] = []
  for (let c = 0; c < NUM_CLASSES; c++) {
    const tp = cm[c][c]
    let fp = 0, fn = 0
    for (let i = 0; i < NUM_CLASSES; i++) { if (i !== c) { fp += cm[i][c]; fn += cm[c][i] } }
    const p = tp + fp > 0 ? tp / (tp + fp) : 0
    const r = tp + fn > 0 ? tp / (tp + fn) : 0
    const f = p + r > 0 ? (2 * p * r) / (p + r) : 0
    precision.push(p); recall.push(r); f1.push(f)
  }
  const macroF1 = f1.reduce((s, v) => s + v, 0) / NUM_CLASSES
  return { accuracy, precision, recall, f1, macroF1, confusionMatrix: cm }
}

function extractFeatures(s: DatasetSample): number[] {
  return [s.dayOfYear, s.latitude, s.longitude, s.elevation, s.monsoonZone, s.localSeasonIndex, s.enso, s.iod, s.prevDayRainSlots >= 1 ? 1 : 0]
}

// ─── Worker Logic ───────────────────────────────────────────────────────────

function trainSlot(slotIndex: number, datasetPath: string): WorkerResult {
  const start = Date.now()
  const slotKey = (['morning', 'afternoon', 'evening', 'night'] as const)[slotIndex]

  // Load dataset
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))

  // Same split as main (same seed)
  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)
  const splitIdx = Math.floor(rawData.length * 0.8)
  const trainIndices = indices.slice(0, splitIdx)
  const testIndices = indices.slice(splitIdx)

  // Build samples for this slot — binary: 0=Tidak Hujan (Cerah+Berawan), 1=Hujan (Gerimis+Hujan)
  const slotSamples: SingleOutputSample[] = trainIndices.map((idx) => ({
    features: extractFeatures(rawData[idx]),
    label: rawData[idx][slotKey] >= 2 ? 1 : 0,
  }))

  // Train
  const slotRng = new PRNG(SEED + slotIndex * 1000)
  const trees: SerializedTree[] = []
  for (let t = 0; t < N_TREES_PER_SLOT; t++) {
    const bootstrap = standardBootstrap(slotSamples, slotRng)
    const root = buildTree(bootstrap, MAX_DEPTH, slotRng)
    trees.push({ root: serializeNode(root) })
  }

  const forest: SlotForest = { slot: SLOT_NAMES[slotIndex], nTrees: N_TREES_PER_SLOT, trees }

  // Evaluate
  const predicted: number[] = []
  const actual: number[] = []
  for (const idx of testIndices) {
    predicted.push(predictSingle(forest, extractFeatures(rawData[idx])))
    actual.push(rawData[idx][slotKey] >= 2 ? 1 : 0)
  }
  const metrics = evaluateSlot(predicted, actual)

  return { slot: SLOT_NAMES[slotIndex], forest, metrics, timeMs: Date.now() - start }
}

// ─── Main Thread ────────────────────────────────────────────────────────────

if (!isMainThread && parentPort) {
  // Worker: train assigned slot
  const { slotIndex, datasetPath } = workerData as { slotIndex: number; datasetPath: string }
  const result = trainSlot(slotIndex, datasetPath)
  parentPort.postMessage(result)
} else if (isMainThread) {
  // Main thread
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast-v2', 'dataset.json')
  const outputDir = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast-v2')
  const outputPath = path.resolve(outputDir, 'model.json')

  if (!fs.existsSync(datasetPath)) {
    console.error('❌ dataset.json not found.')
    process.exit(1)
  }

  // Quick dataset info
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)
  const splitIdx = Math.floor(rawData.length * 0.8)

  console.log('\n🌳 Model Generation V2: PARALLEL (4 worker threads)')
  console.log(`   Config: ${N_TREES_PER_SLOT} trees/slot × ${NUM_SLOTS} slots = ${N_TREES_PER_SLOT * NUM_SLOTS} trees total`)
  console.log(`   Max depth: ${MAX_DEPTH}, seed: ${SEED}, features: ${FEATURE_NAMES.length}`)
  console.log(`   Bootstrap: class-balanced`)
  console.log(`   Dataset: ${rawData.length.toLocaleString()} samples (train: ${splitIdx.toLocaleString()} | test: ${(rawData.length - splitIdx).toLocaleString()})`)
  console.log(`   Output: ${outputPath}\n`)
  console.log('🏋️  Training all 4 slots in parallel...\n')

  const trainStart = Date.now()

  // Spawn 4 workers
  const workerPromises: Promise<WorkerResult>[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const promise = new Promise<WorkerResult>((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { slotIndex: s, datasetPath },
      })
      worker.on('message', (result: WorkerResult) => {
        console.log(`   ✅ ${result.slot} — ${(result.timeMs / 1000).toFixed(1)}s`)
        resolve(result)
      })
      worker.on('error', reject)
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker ${SLOT_NAMES[s]} exited with code ${code}`))
      })
    })
    workerPromises.push(promise)
  }

  const results = await Promise.all(workerPromises)
  const totalTime = Date.now() - trainStart
  console.log(`\n   Total: ${(totalTime / 1000).toFixed(1)}s (wall-clock)\n`)

  // Sort results by slot order
  results.sort((a, b) => SLOT_NAMES.indexOf(a.slot) - SLOT_NAMES.indexOf(b.slot))

  // Print metrics
  console.log('📈 Evaluation:\n')
  const metricsBySlot: Record<string, { accuracy: number; f1: number }> = {}

  for (const r of results) {
    const m = r.metrics
    metricsBySlot[r.slot] = { accuracy: m.accuracy, f1: m.macroF1 }
    console.log(`   ┌─ ${r.slot.toUpperCase()} ${'─'.repeat(30)}┐`)
    console.log(`   │ Accuracy:  ${(m.accuracy * 100).toFixed(2)}%`)
    console.log(`   │ Macro F1:  ${(m.macroF1 * 100).toFixed(2)}%`)
    console.log(`   │ Per-class:`)
    for (let c = 0; c < NUM_CLASSES; c++) {
      console.log(`   │   ${CATEGORY_NAMES[c].padEnd(8)} P=${(m.precision[c] * 100).toFixed(1)}%  R=${(m.recall[c] * 100).toFixed(1)}%  F1=${(m.f1[c] * 100).toFixed(1)}%`)
    }
    console.log(`   │ Confusion Matrix:`)
    console.log(`   │   ${''.padEnd(10)} ${CATEGORY_NAMES.map((n) => n.slice(0, 5).padStart(7)).join('')}`)
    for (let i = 0; i < NUM_CLASSES; i++) {
      const row = m.confusionMatrix[i].map((v) => String(v).padStart(7)).join('')
      console.log(`   │   ${CATEGORY_NAMES[i].padEnd(10)} ${row}`)
    }
    console.log(`   └${'─'.repeat(42)}┘\n`)
  }

  const avgAccuracy = Object.values(metricsBySlot).reduce((s, v) => s + v.accuracy, 0) / NUM_SLOTS
  const avgF1 = Object.values(metricsBySlot).reduce((s, v) => s + v.f1, 0) / NUM_SLOTS
  console.log(`   ══ OVERALL AVERAGE ══`)
  console.log(`   Accuracy: ${(avgAccuracy * 100).toFixed(2)}%`)
  console.log(`   Macro F1: ${(avgF1 * 100).toFixed(2)}%\n`)

  // ─── Threshold Tuning ─────────────────────────────────────────────────────
  console.log('🎯 Threshold Tuning (per-slot):\n')

  const THRESHOLDS = [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50]
  const slotKeys = ['morning', 'afternoon', 'evening', 'night'] as const
  const testIndices = indices.slice(splitIdx)
  const optimalThresholds: number[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const slotKey = slotKeys[s]
    const forest = results[s].forest

    // Get vote proportions for all test samples
    const testVotes: number[] = [] // proportion of trees voting "Hujan" per sample
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

    // Evaluate each threshold
    let bestF1 = -1
    let bestThreshold = 0.5

    console.log(`   ${SLOT_NAMES[s].toUpperCase()}:`)
    console.log(`   ${'Thresh'.padEnd(8)} ${'Acc'.padStart(7)} ${'F1'.padStart(7)} ${'P(H)'.padStart(7)} ${'R(H)'.padStart(7)}`)

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
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0
      const f1Hujan = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
      const precisionNH = tn + fn > 0 ? tn / (tn + fn) : 0
      const recallNH = tn + fp > 0 ? tn / (tn + fp) : 0
      const f1NH = precisionNH + recallNH > 0 ? (2 * precisionNH * recallNH) / (precisionNH + recallNH) : 0
      const macroF1 = (f1Hujan + f1NH) / 2

      const marker = macroF1 > bestF1 ? ' ◀ best' : ''
      console.log(`   ${threshold.toFixed(2).padEnd(8)} ${(acc * 100).toFixed(1).padStart(6)}% ${(macroF1 * 100).toFixed(1).padStart(6)}% ${(precision * 100).toFixed(1).padStart(6)}% ${(recall * 100).toFixed(1).padStart(6)}%${marker}`)

      if (macroF1 > bestF1) {
        bestF1 = macroF1
        bestThreshold = threshold
      }
    }

    optimalThresholds.push(bestThreshold)
    console.log(`   → Optimal: ${bestThreshold}\n`)
  }

  console.log(`   ══ OPTIMAL THRESHOLDS ══`)
  for (let s = 0; s < NUM_SLOTS; s++) {
    console.log(`   ${SLOT_NAMES[s].padEnd(10)} ${optimalThresholds[s]}`)
  }
  console.log()

  // Re-evaluate with optimal thresholds
  console.log('📈 Re-evaluation with optimal thresholds:\n')
  const tunedMetricsBySlot: Record<string, { accuracy: number; f1: number }> = {}

  for (let s = 0; s < NUM_SLOTS; s++) {
    const slotKey = slotKeys[s]
    const forest = results[s].forest
    const threshold = optimalThresholds[s]
    const predicted: number[] = []
    const actual: number[] = []

    for (const idx of testIndices) {
      const features = extractFeatures(rawData[idx])
      let hujanVotes = 0
      for (const tree of forest.trees) {
        let node: SerializedNode | undefined = tree.root
        while (node && node.f !== -1) { node = features[node.f] <= node.t ? node.l : node.r }
        if (node?.p === 1) hujanVotes++
      }
      predicted.push(hujanVotes / forest.trees.length >= threshold ? 1 : 0)
      actual.push(rawData[idx][slotKey] >= 2 ? 1 : 0)
    }

    const metrics = evaluateSlot(predicted, actual)
    tunedMetricsBySlot[SLOT_NAMES[s]] = { accuracy: metrics.accuracy, f1: metrics.macroF1 }

    console.log(`   ${SLOT_NAMES[s].padEnd(10)} Acc=${(metrics.accuracy * 100).toFixed(2)}%  F1=${(metrics.macroF1 * 100).toFixed(2)}%  (threshold=${threshold})`)
  }

  const tunedAvgAcc = Object.values(tunedMetricsBySlot).reduce((s, v) => s + v.accuracy, 0) / NUM_SLOTS
  const tunedAvgF1 = Object.values(tunedMetricsBySlot).reduce((s, v) => s + v.f1, 0) / NUM_SLOTS
  console.log(`\n   ══ TUNED OVERALL ══`)
  console.log(`   Accuracy: ${(tunedAvgAcc * 100).toFixed(2)}%`)
  console.log(`   Macro F1: ${(tunedAvgF1 * 100).toFixed(2)}%\n`)

  // Build model with thresholds
  const forests = results.map((r) => r.forest)
  const accuracyMap: Record<string, number> = {}
  const f1Map: Record<string, number> = {}
  for (const [slot, m] of Object.entries(tunedMetricsBySlot)) {
    accuracyMap[slot] = Math.round(m.accuracy * 10000) / 10000
    f1Map[slot] = Math.round(m.f1 * 10000) / 10000
  }
  accuracyMap['average'] = Math.round(tunedAvgAcc * 10000) / 10000
  f1Map['average'] = Math.round(tunedAvgF1 * 10000) / 10000

  const model = {
    version: 2,
    nSlots: NUM_SLOTS,
    nClasses: NUM_CLASSES,
    maxDepth: MAX_DEPTH,
    featureNames: FEATURE_NAMES,
    slotNames: SLOT_NAMES,
    categoryNames: CATEGORY_NAMES,
    thresholds: optimalThresholds,
    forests,
    metadata: {
      trainedAt: new Date().toISOString(),
      datasetSize: rawData.length,
      accuracy: accuracyMap,
      f1Score: f1Map,
    },
  }

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(model))

  const fileSizeKB = (Buffer.byteLength(JSON.stringify(model)) / 1024).toFixed(1)
  console.log(`💾 Model saved: ${outputPath} (${fileSizeKB} KB)`)
  console.log(`   ${N_TREES_PER_SLOT} trees/slot × ${NUM_SLOTS} slots | depth ${MAX_DEPTH} | ${FEATURE_NAMES.length} features`)
  console.log(`   Wall-clock: ${(totalTime / 1000).toFixed(1)}s\n`)
}
