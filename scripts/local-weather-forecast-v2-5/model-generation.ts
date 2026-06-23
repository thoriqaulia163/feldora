/**
 * Model Generation for Local Weather Forecast 2.5
 *
 * Gradient Boosted Trees (GBT), 4 independent models (per slot), parallel training.
 * 100 trees × depth 4 per slot, learning rate 0.1, binary classification.
 * 12 features (9 base + sinDay + cosDay + dayLength).
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast-v2-5/model-generation.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Constants ──────────────────────────────────────────────────────────────

const NUM_SLOTS = 4
const N_TREES = 100
const MAX_DEPTH = 4
const LEARNING_RATE = 0.1
const SEED = 42
const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night']
const CATEGORY_NAMES = ['Tidak Hujan', 'Hujan']
const FEATURE_NAMES = [
  'dayOfYear', 'latitude', 'longitude', 'elevation',
  'monsoonZone', 'localSeasonIndex', 'enso', 'iod',
  'prevDayRain', 'sinDay', 'cosDay', 'dayLength',
]

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
      const j = this.nextInt(i + 1); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
    }
    return arr
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface GBTNode { f: number; t: number; l?: GBTNode; r?: GBTNode; v?: number }
interface GBTTree { root: GBTNode }
interface SlotForest { slot: string; baseScore: number; learningRate: number; nTrees: number; trees: GBTTree[] }
interface DatasetSample {
  dayOfYear: number; latitude: number; longitude: number; elevation: number
  monsoonZone: number; localSeasonIndex: number; enso: number; iod: number
  morning: number; afternoon: number; evening: number; night: number
  prevDayRainSlots: number
}

interface TreeNode { featureIndex: number; threshold: number; left: TreeNode | null; right: TreeNode | null; value: number }
interface WorkerResult { slot: string; forest: SlotForest; accuracy: number; f1: number; timeMs: number }

// ─── Computed Features ──────────────────────────────────────────────────────

function computeDayLength(latitude: number, dayOfYear: number): number {
  const latRad = latitude * Math.PI / 180
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * Math.PI / 180
  const cosHA = -Math.tan(latRad) * Math.tan(declination)
  if (cosHA > 1) return 0
  if (cosHA < -1) return 24
  return (2 * Math.acos(cosHA) * 180 / Math.PI) / 15
}

function extractFeatures(s: DatasetSample): number[] {
  const sinDay = Math.sin((2 * Math.PI * s.dayOfYear) / 365)
  const cosDay = Math.cos((2 * Math.PI * s.dayOfYear) / 365)
  const dayLength = computeDayLength(s.latitude, s.dayOfYear)
  return [
    s.dayOfYear, s.latitude, s.longitude, s.elevation,
    s.monsoonZone, s.localSeasonIndex, s.enso, s.iod,
    s.prevDayRainSlots >= 1 ? 1 : 0,
    sinDay, cosDay, dayLength,
  ]
}

// ─── GBT Training ───────────────────────────────────────────────────────────

function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)) }

function buildRegressionTree(
  features: number[][], residuals: number[], maxDepth: number, rng: PRNG, depth = 0
): TreeNode {
  const n = residuals.length
  const mean = residuals.reduce((s, v) => s + v, 0) / n

  if (depth >= maxDepth || n <= 10) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, value: mean }
  }

  const nFeatures = features[0].length
  const subsetSize = Math.max(1, Math.floor(Math.sqrt(nFeatures)))
  const allIndices = Array.from({ length: nFeatures }, (_, i) => i)
  rng.shuffle(allIndices)
  const featureIndices = allIndices.slice(0, subsetSize)

  let bestGain = 0
  let bestFeature = -1
  let bestThreshold = 0
  let bestLeftIdx: number[] = []
  let bestRightIdx: number[] = []

  const totalVariance = residuals.reduce((s, v) => s + (v - mean) ** 2, 0)

  for (const fi of featureIndices) {
    const values = [...new Set(features.map((f) => f[fi]))].sort((a, b) => a - b)
    const MAX_CANDIDATES = 40
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
      const leftIdx: number[] = [], rightIdx: number[] = []
      for (let i = 0; i < n; i++) {
        (features[i][fi] <= threshold ? leftIdx : rightIdx).push(i)
      }
      if (leftIdx.length < 5 || rightIdx.length < 5) continue

      const leftMean = leftIdx.reduce((s, i) => s + residuals[i], 0) / leftIdx.length
      const rightMean = rightIdx.reduce((s, i) => s + residuals[i], 0) / rightIdx.length
      const leftVar = leftIdx.reduce((s, i) => s + (residuals[i] - leftMean) ** 2, 0)
      const rightVar = rightIdx.reduce((s, i) => s + (residuals[i] - rightMean) ** 2, 0)
      const gain = totalVariance - leftVar - rightVar

      if (gain > bestGain) {
        bestGain = gain; bestFeature = fi; bestThreshold = threshold
        bestLeftIdx = leftIdx; bestRightIdx = rightIdx
      }
    }
  }

  if (bestFeature === -1) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, value: mean }
  }

  const leftFeatures = bestLeftIdx.map((i) => features[i])
  const leftResiduals = bestLeftIdx.map((i) => residuals[i])
  const rightFeatures = bestRightIdx.map((i) => features[i])
  const rightResiduals = bestRightIdx.map((i) => residuals[i])

  return {
    featureIndex: bestFeature, threshold: bestThreshold,
    left: buildRegressionTree(leftFeatures, leftResiduals, maxDepth, rng, depth + 1),
    right: buildRegressionTree(rightFeatures, rightResiduals, maxDepth, rng, depth + 1),
    value: mean,
  }
}

function serializeNode(node: TreeNode): GBTNode {
  if (node.featureIndex === -1) return { f: -1, t: 0, v: Math.round(node.value * 10000) / 10000 }
  return {
    f: node.featureIndex, t: Math.round(node.threshold * 1000) / 1000,
    l: node.left ? serializeNode(node.left) : undefined,
    r: node.right ? serializeNode(node.right) : undefined,
  }
}

function predictTree(node: GBTNode, features: number[]): number {
  if (node.f === -1) return node.v ?? 0
  return features[node.f] <= node.t ? predictTree(node.l!, features) : predictTree(node.r!, features)
}

// ─── Train One Slot ─────────────────────────────────────────────────────────

function trainSlot(slotIndex: number, datasetPath: string): WorkerResult {
  const start = Date.now()
  const slotKey = (['morning', 'afternoon', 'evening', 'night'] as const)[slotIndex]

  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)
  const splitIdx = Math.floor(rawData.length * 0.8)
  const trainIndices = indices.slice(0, splitIdx)
  const testIndices = indices.slice(splitIdx)

  // Prepare features & labels
  const trainFeatures = trainIndices.map((idx) => extractFeatures(rawData[idx]))
  const trainLabels: number[] = trainIndices.map((idx) => rawData[idx][slotKey] >= 2 ? 1 : 0)

  // Base score: log(p/(1-p)) of positive rate
  const posRate = trainLabels.reduce((s, l) => s + l, 0) / trainLabels.length
  const baseScore = Math.log(posRate / (1 - posRate))

  // Initialize predictions with base score
  const predictions = new Array(trainLabels.length).fill(baseScore)

  // Train GBT
  const slotRng = new PRNG(SEED + slotIndex * 1000)
  const trees: GBTTree[] = []

  for (let t = 0; t < N_TREES; t++) {
    // Compute residuals: actual - predicted probability
    const residuals = trainLabels.map((label, i) => label - sigmoid(predictions[i]))

    // Build regression tree on residuals
    const tree = buildRegressionTree(trainFeatures, residuals, MAX_DEPTH, slotRng)
    trees.push({ root: serializeNode(tree) })

    // Update predictions
    for (let i = 0; i < predictions.length; i++) {
      predictions[i] += LEARNING_RATE * predictTree(serializeNode(tree), trainFeatures[i])
    }
  }

  const forest: SlotForest = { slot: SLOT_NAMES[slotIndex], baseScore, learningRate: LEARNING_RATE, nTrees: N_TREES, trees }

  // Evaluate
  let tp = 0, fp = 0, tn = 0, fn = 0
  for (const idx of testIndices) {
    const features = extractFeatures(rawData[idx])
    let score = baseScore
    for (const tree of trees) score += LEARNING_RATE * predictTree(tree.root, features)
    const pred = sigmoid(score) >= 0.5 ? 1 : 0
    const actual = rawData[idx][slotKey] >= 2 ? 1 : 0
    if (pred === 1 && actual === 1) tp++
    else if (pred === 1 && actual === 0) fp++
    else if (pred === 0 && actual === 0) tn++
    else fn++
  }

  const accuracy = (tp + tn) / (tp + fp + tn + fn)
  const pH = tp + fp > 0 ? tp / (tp + fp) : 0
  const rH = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1H = pH + rH > 0 ? (2 * pH * rH) / (pH + rH) : 0
  const pN = tn + fn > 0 ? tn / (tn + fn) : 0
  const rN = tn + fp > 0 ? tn / (tn + fp) : 0
  const f1N = pN + rN > 0 ? (2 * pN * rN) / (pN + rN) : 0
  const macroF1 = (f1H + f1N) / 2

  return { slot: SLOT_NAMES[slotIndex], forest, accuracy, f1: macroF1, timeMs: Date.now() - start }
}

// ─── Main / Worker ──────────────────────────────────────────────────────────

if (!isMainThread && parentPort) {
  const { slotIndex, datasetPath } = workerData as { slotIndex: number; datasetPath: string }
  parentPort.postMessage(trainSlot(slotIndex, datasetPath))
} else if (isMainThread) {
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast-v2-5', 'dataset.json')
  const outputDir = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast-v2-5')
  const outputPath = path.resolve(outputDir, 'model.json')

  if (!fs.existsSync(datasetPath)) { console.error('❌ dataset.json not found. Copy from v2.'); process.exit(1) }

  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
  const splitIdx = Math.floor(rawData.length * 0.8)

  console.log('\n🌳 Model Generation V2.5: Gradient Boosted Trees (PARALLEL)')
  console.log(`   Config: ${N_TREES} trees/slot × ${NUM_SLOTS} slots, depth ${MAX_DEPTH}, lr ${LEARNING_RATE}`)
  console.log(`   Features: ${FEATURE_NAMES.length} (${FEATURE_NAMES.join(', ')})`)
  console.log(`   Dataset: ${rawData.length.toLocaleString()} (train: ${splitIdx.toLocaleString()} | test: ${(rawData.length - splitIdx).toLocaleString()})`)
  console.log(`   Output: ${outputPath}\n`)
  console.log('🏋️  Training all 4 slots in parallel...\n')

  const trainStart = Date.now()
  const promises: Promise<WorkerResult>[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    promises.push(new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: { slotIndex: s, datasetPath } })
      worker.on('message', (r: WorkerResult) => { console.log(`   ✅ ${r.slot} — ${(r.timeMs / 1000).toFixed(1)}s  Acc=${(r.accuracy * 100).toFixed(1)}%  F1=${(r.f1 * 100).toFixed(1)}%`); resolve(r) })
      worker.on('error', reject)
    }))
  }

  const results = await Promise.all(promises)
  results.sort((a, b) => SLOT_NAMES.indexOf(a.slot) - SLOT_NAMES.indexOf(b.slot))

  const totalTime = Date.now() - trainStart
  const avgAcc = results.reduce((s, r) => s + r.accuracy, 0) / NUM_SLOTS
  const avgF1 = results.reduce((s, r) => s + r.f1, 0) / NUM_SLOTS

  console.log(`\n   Total: ${(totalTime / 1000).toFixed(1)}s`)
  console.log(`\n   ══ OVERALL (threshold=0.5) ══`)
  console.log(`   Accuracy: ${(avgAcc * 100).toFixed(2)}%`)
  console.log(`   Macro F1: ${(avgF1 * 100).toFixed(2)}%\n`)

  // Build model
  const model = {
    version: 3, type: 'gbt', nSlots: NUM_SLOTS, nClasses: 2, maxDepth: MAX_DEPTH,
    featureNames: FEATURE_NAMES, slotNames: SLOT_NAMES, categoryNames: CATEGORY_NAMES,
    thresholds: [0.5, 0.5, 0.5, 0.5],
    forests: results.map((r) => r.forest),
    metadata: {
      trainedAt: new Date().toISOString(), datasetSize: rawData.length,
      accuracy: { ...Object.fromEntries(results.map((r) => [r.slot, Math.round(r.accuracy * 10000) / 10000])), average: Math.round(avgAcc * 10000) / 10000 },
      f1Score: { ...Object.fromEntries(results.map((r) => [r.slot, Math.round(r.f1 * 10000) / 10000])), average: Math.round(avgF1 * 10000) / 10000 },
    },
  }

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(model))
  const sizeKB = (Buffer.byteLength(JSON.stringify(model)) / 1024).toFixed(1)
  console.log(`💾 Model saved: ${outputPath} (${sizeKB} KB)\n`)
}
