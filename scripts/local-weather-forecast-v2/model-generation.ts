/**
 * Model Generation Script for Local Weather Forecast V2
 *
 * Architecture: 4 independent forests (one per time slot)
 * Each forest: 30 trees, max depth 6, class-balanced bootstrap
 * Classes: 4 (Cerah/Berawan/Gerimis/Hujan)
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast-v2/model-generation.ts
 *
 * Input:  public/dataset/local-weather-forecast-v2/dataset.json
 * Output: public/ai-models/local-weather-forecast-v2/model.json
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

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
  'prevDayRainSlots',
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

interface SingleOutputSample {
  features: number[]
  label: number // 0-3
}

interface TreeNode {
  featureIndex: number
  threshold: number
  left: TreeNode | null
  right: TreeNode | null
  prediction: number
  confidence: number
}

interface SerializedNode {
  f: number
  t: number
  l?: SerializedNode
  r?: SerializedNode
  p?: number
  c?: number
}

interface SerializedTree { root: SerializedNode }

interface SlotForest {
  slot: string
  nTrees: number
  trees: SerializedTree[]
}

interface SerializedModel {
  version: 2
  nSlots: number
  nClasses: number
  maxDepth: number
  featureNames: string[]
  slotNames: string[]
  categoryNames: string[]
  forests: SlotForest[]
  metadata?: {
    trainedAt: string
    datasetSize: number
    accuracy: Record<string, number>
    f1Score: Record<string, number>
  }
}

// ─── Multiclass Gini Impurity ───────────────────────────────────────────────

function giniImpurity(labels: number[]): number {
  if (labels.length === 0) return 0
  const n = labels.length
  const counts = new Array(NUM_CLASSES).fill(0)
  for (const l of labels) counts[l]++
  let gini = 1
  for (let c = 0; c < NUM_CLASSES; c++) {
    const p = counts[c] / n
    gini -= p * p
  }
  return gini
}

// ─── Decision Tree Builder (single output) ──────────────────────────────────

function buildTree(samples: SingleOutputSample[], maxDepth: number, rng: PRNG, depth = 0): TreeNode {
  const labels = samples.map((s) => s.label)
  const counts = new Array(NUM_CLASSES).fill(0)
  for (const l of labels) counts[l]++

  let maxCount = 0, prediction = 0
  for (let c = 0; c < NUM_CLASSES; c++) {
    if (counts[c] > maxCount) { maxCount = counts[c]; prediction = c }
  }
  const confidence = samples.length > 0 ? maxCount / samples.length : 0

  // Leaf conditions
  if (depth >= maxDepth || samples.length <= 5 || giniImpurity(labels) < 0.01) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  // Random feature subset
  const totalFeatures = samples[0].features.length
  const subsetSize = Math.max(1, Math.floor(Math.sqrt(totalFeatures)))
  const allIndices = Array.from({ length: totalFeatures }, (_, i) => i)
  rng.shuffle(allIndices)
  const featureIndices = allIndices.slice(0, subsetSize)

  let bestGain = -Infinity
  let bestFeature = -1
  let bestThreshold = 0
  let bestLeft: SingleOutputSample[] = []
  let bestRight: SingleOutputSample[] = []

  const parentGini = giniImpurity(labels)

  for (const fi of featureIndices) {
    const values = [...new Set(samples.map((s) => s.features[fi]))].sort((a, b) => a - b)

    // Max 60 quantile-based candidates
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
      const left: SingleOutputSample[] = []
      const right: SingleOutputSample[] = []
      for (const s of samples) {
        (s.features[fi] <= threshold ? left : right).push(s)
      }
      if (left.length === 0 || right.length === 0) continue

      const weightedGini =
        (left.length / samples.length) * giniImpurity(left.map((s) => s.label)) +
        (right.length / samples.length) * giniImpurity(right.map((s) => s.label))
      const gain = parentGini - weightedGini

      if (gain > bestGain) {
        bestGain = gain
        bestFeature = fi
        bestThreshold = threshold
        bestLeft = left
        bestRight = right
      }
    }
  }

  if (bestFeature === -1 || bestGain <= 0) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  return {
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: buildTree(bestLeft, maxDepth, rng, depth + 1),
    right: buildTree(bestRight, maxDepth, rng, depth + 1),
    prediction, confidence,
  }
}

// ─── Serialization ──────────────────────────────────────────────────────────

function serializeNode(node: TreeNode): SerializedNode {
  if (node.featureIndex === -1) {
    return { f: -1, t: 0, p: node.prediction, c: Math.round(node.confidence * 1000) / 1000 }
  }
  return {
    f: node.featureIndex,
    t: Math.round(node.threshold * 1000) / 1000,
    l: node.left ? serializeNode(node.left) : undefined,
    r: node.right ? serializeNode(node.right) : undefined,
  }
}

// ─── Class-Balanced Bootstrap ───────────────────────────────────────────────

/**
 * Creates a balanced bootstrap sample.
 * Each class gets equal representation, total size matches standard bootstrap (= training set size).
 * Minority classes are oversampled, majority classes are undersampled.
 */
function balancedBootstrap(samples: SingleOutputSample[], rng: PRNG): SingleOutputSample[] {
  // Group by class
  const byClass: SingleOutputSample[][] = Array.from({ length: NUM_CLASSES }, () => [])
  for (const s of samples) byClass[s.label].push(s)

  // Target per class = total / NUM_CLASSES (same total size as standard bootstrap)
  const activeClasses = byClass.filter((arr) => arr.length > 0).length
  const targetPerClass = Math.floor(samples.length / activeClasses)

  const result: SingleOutputSample[] = []
  for (let c = 0; c < NUM_CLASSES; c++) {
    if (byClass[c].length === 0) continue
    for (let i = 0; i < targetPerClass; i++) {
      result.push(byClass[c][rng.nextInt(byClass[c].length)])
    }
  }

  rng.shuffle(result)
  return result
}

// ─── Prediction (for evaluation) ────────────────────────────────────────────

function predictSingle(forest: SlotForest, features: number[]): number {
  const votes = new Array(NUM_CLASSES).fill(0)
  for (const tree of forest.trees) {
    let node: SerializedNode | undefined = tree.root
    while (node && node.f !== -1) {
      node = features[node.f] <= node.t ? node.l : node.r
    }
    if (node?.p !== undefined) votes[node.p]++
  }
  let maxVotes = 0, maxClass = 0
  for (let c = 0; c < NUM_CLASSES; c++) {
    if (votes[c] > maxVotes) { maxVotes = votes[c]; maxClass = c }
  }
  return maxClass
}

// ─── Evaluation ─────────────────────────────────────────────────────────────

interface SlotMetrics {
  accuracy: number
  precision: number[]
  recall: number[]
  f1: number[]
  macroF1: number
  confusionMatrix: number[][]
}

function evaluateSlot(predicted: number[], actual: number[]): SlotMetrics {
  const n = predicted.length
  const cm: number[][] = Array.from({ length: NUM_CLASSES }, () => new Array(NUM_CLASSES).fill(0))

  for (let i = 0; i < n; i++) cm[actual[i]][predicted[i]]++

  let correct = 0
  for (let i = 0; i < NUM_CLASSES; i++) correct += cm[i][i]
  const accuracy = correct / n

  const precision: number[] = []
  const recall: number[] = []
  const f1: number[] = []

  for (let c = 0; c < NUM_CLASSES; c++) {
    const tp = cm[c][c]
    let fp = 0, fn = 0
    for (let i = 0; i < NUM_CLASSES; i++) {
      if (i !== c) { fp += cm[i][c]; fn += cm[c][i] }
    }
    const p = tp + fp > 0 ? tp / (tp + fp) : 0
    const r = tp + fn > 0 ? tp / (tp + fn) : 0
    const f = p + r > 0 ? (2 * p * r) / (p + r) : 0
    precision.push(p)
    recall.push(r)
    f1.push(f)
  }

  const macroF1 = f1.reduce((s, v) => s + v, 0) / NUM_CLASSES
  return { accuracy, precision, recall, f1, macroF1, confusionMatrix: cm }
}

// ─── Dataset ────────────────────────────────────────────────────────────────

interface DatasetSample {
  dayOfYear: number
  latitude: number
  longitude: number
  elevation: number
  monsoonZone: number
  localSeasonIndex: number
  enso: number
  iod: number
  morning: number
  afternoon: number
  evening: number
  night: number
  prevDayRainSlots: number
}

function extractFeatures(s: DatasetSample): number[] {
  return [
    s.dayOfYear, s.latitude, s.longitude, s.elevation,
    s.monsoonZone, s.localSeasonIndex, s.enso, s.iod,
    s.prevDayRainSlots ?? 1,
  ]
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast-v2', 'dataset.json')
  const outputDir = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast-v2')
  const outputPath = path.resolve(outputDir, 'model.json')

  if (!fs.existsSync(datasetPath)) {
    console.error('❌ dataset.json not found. Run dataset-extract.ts first.')
    process.exit(1)
  }

  console.log('\n🌳 Model Generation V2: Independent Forests per Slot')
  console.log(`   Config: ${N_TREES_PER_SLOT} trees/slot × ${NUM_SLOTS} slots = ${N_TREES_PER_SLOT * NUM_SLOTS} trees total`)
  console.log(`   Max depth: ${MAX_DEPTH}, seed: ${SEED}`)
  console.log(`   Bootstrap: class-balanced (oversample minority)`)
  console.log(`   Classes: ${NUM_CLASSES} (${CATEGORY_NAMES.join(', ')})`)
  console.log(`   Input: ${datasetPath}`)
  console.log(`   Output: ${outputPath}\n`)

  // Load dataset
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
  console.log(`📊 Dataset loaded: ${rawData.length.toLocaleString()} samples`)

  // Random split 80/20
  const rng = new PRNG(SEED)
  const indices = Array.from({ length: rawData.length }, (_, i) => i)
  rng.shuffle(indices)

  const splitIdx = Math.floor(rawData.length * 0.8)
  const trainIndices = indices.slice(0, splitIdx)
  const testIndices = indices.slice(splitIdx)

  console.log(`   Train: ${trainIndices.length.toLocaleString()} | Test: ${testIndices.length.toLocaleString()}`)

  // Show distribution per slot (binary)
  const slotKeys = ['morning', 'afternoon', 'evening', 'night'] as const
  for (let s = 0; s < NUM_SLOTS; s++) {
    const counts = [0, 0]
    for (const idx of trainIndices) {
      counts[rawData[idx][slotKeys[s]] >= 2 ? 1 : 0]++
    }
    const dist = counts.map((c: number) => `${((c / trainIndices.length) * 100).toFixed(0)}%`).join(' / ')
    console.log(`   ${SLOT_NAMES[s].padEnd(10)} ${dist}`)
  }
  console.log()

  // Train one forest per slot
  console.log('🏋️  Training (per-slot, standard bootstrap, binary)...')
  const trainStart = Date.now()

  const forests: SlotForest[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const slotRng = new PRNG(SEED + s * 1000)
    const slotKey = slotKeys[s]

    // Build single-output samples — binary: 0=Tidak Hujan, 1=Hujan
    const slotSamples: SingleOutputSample[] = trainIndices.map((idx) => ({
      features: extractFeatures(rawData[idx]),
      label: rawData[idx][slotKey] >= 2 ? 1 : 0,
    }))

    const trees: SerializedTree[] = []
    for (let t = 0; t < N_TREES_PER_SLOT; t++) {
      // Standard bootstrap (same size, with replacement)
      const n = slotSamples.length
      const bootstrap: SingleOutputSample[] = new Array(n)
      for (let i = 0; i < n; i++) bootstrap[i] = slotSamples[slotRng.nextInt(n)]

      const root = buildTree(bootstrap, MAX_DEPTH, slotRng)
      trees.push({ root: serializeNode(root) })
    }

    forests.push({ slot: SLOT_NAMES[s], nTrees: N_TREES_PER_SLOT, trees })

    const elapsed = ((Date.now() - trainStart) / 1000).toFixed(1)
    console.log(`   ✅ ${SLOT_NAMES[s]} — ${N_TREES_PER_SLOT} trees (${elapsed}s)`)
  }

  const trainTime = Date.now() - trainStart
  console.log(`\n   Total training: ${(trainTime / 1000).toFixed(1)}s\n`)

  // Build model
  const model: SerializedModel = {
    version: 2,
    nSlots: NUM_SLOTS,
    nClasses: NUM_CLASSES,
    maxDepth: MAX_DEPTH,
    featureNames: FEATURE_NAMES,
    slotNames: SLOT_NAMES,
    categoryNames: CATEGORY_NAMES,
    forests,
  }

  // Evaluate per slot
  console.log('📈 Evaluating on test set...\n')

  const metricsBySlot: Record<string, { accuracy: number; f1: number }> = {}

  for (let s = 0; s < NUM_SLOTS; s++) {
    const slotKey = slotKeys[s]
    const predicted: number[] = []
    const actual: number[] = []

    for (const idx of testIndices) {
      const features = extractFeatures(rawData[idx])
      predicted.push(predictSingle(forests[s], features))
      actual.push(rawData[idx][slotKey] >= 2 ? 1 : 0)
    }

    const metrics = evaluateSlot(predicted, actual)
    metricsBySlot[SLOT_NAMES[s]] = { accuracy: metrics.accuracy, f1: metrics.macroF1 }

    console.log(`   ┌─ ${SLOT_NAMES[s].toUpperCase()} ${'─'.repeat(30)}┐`)
    console.log(`   │ Accuracy:  ${(metrics.accuracy * 100).toFixed(2)}%`)
    console.log(`   │ Macro F1:  ${(metrics.macroF1 * 100).toFixed(2)}%`)
    console.log(`   │ Per-class:`)
    for (let c = 0; c < NUM_CLASSES; c++) {
      console.log(`   │   ${CATEGORY_NAMES[c].padEnd(8)} P=${(metrics.precision[c] * 100).toFixed(1)}%  R=${(metrics.recall[c] * 100).toFixed(1)}%  F1=${(metrics.f1[c] * 100).toFixed(1)}%`)
    }
    console.log(`   │ Confusion Matrix:`)
    console.log(`   │   ${''.padEnd(10)} ${CATEGORY_NAMES.map((n) => n.slice(0, 5).padStart(7)).join('')}`)
    for (let i = 0; i < NUM_CLASSES; i++) {
      const row = metrics.confusionMatrix[i].map((v) => String(v).padStart(7)).join('')
      console.log(`   │   ${CATEGORY_NAMES[i].padEnd(10)} ${row}`)
    }
    console.log(`   └${'─'.repeat(42)}┘\n`)
  }

  // Overall
  const avgAccuracy = Object.values(metricsBySlot).reduce((s, v) => s + v.accuracy, 0) / NUM_SLOTS
  const avgF1 = Object.values(metricsBySlot).reduce((s, v) => s + v.f1, 0) / NUM_SLOTS
  console.log(`   ══ OVERALL AVERAGE ══`)
  console.log(`   Accuracy: ${(avgAccuracy * 100).toFixed(2)}%`)
  console.log(`   Macro F1: ${(avgF1 * 100).toFixed(2)}%\n`)

  // Metadata
  const accuracyMap: Record<string, number> = {}
  const f1Map: Record<string, number> = {}
  for (const [slot, m] of Object.entries(metricsBySlot)) {
    accuracyMap[slot] = Math.round(m.accuracy * 10000) / 10000
    f1Map[slot] = Math.round(m.f1 * 10000) / 10000
  }
  accuracyMap['average'] = Math.round(avgAccuracy * 10000) / 10000
  f1Map['average'] = Math.round(avgF1 * 10000) / 10000

  model.metadata = {
    trainedAt: new Date().toISOString(),
    datasetSize: rawData.length,
    accuracy: accuracyMap,
    f1Score: f1Map,
  }

  // Save
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(model))

  const fileSizeKB = (Buffer.byteLength(JSON.stringify(model)) / 1024).toFixed(1)
  console.log(`💾 Model saved: ${outputPath} (${fileSizeKB} KB)`)
  console.log(`   ${N_TREES_PER_SLOT} trees/slot × ${NUM_SLOTS} slots | depth ${MAX_DEPTH} | ${FEATURE_NAMES.length} features`)
  console.log(`   Total time: ${((Date.now() - trainStart) / 1000).toFixed(1)}s\n`)
}

main()
