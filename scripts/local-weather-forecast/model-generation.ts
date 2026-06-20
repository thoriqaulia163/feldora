/**
 * Model Generation Script for Local Weather Forecast
 *
 * Reads dataset.json, trains a Random Forest, evaluates, and exports model.json.
 *
 * Usage:
 *   npx tsx scripts/local-weather-forecast/model-generation.ts
 *
 * Input:  scripts/local-weather-forecast/dataset.json
 * Output: public/models/model.json
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Inline ML implementation (to avoid module resolution issues) ────────────

// PRNG (Mulberry32)
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

interface TrainingSample { features: number[]; label: number }
interface SerializedNode { f: number; t: number; l?: SerializedNode; r?: SerializedNode; p?: number; c?: number }
interface SerializedTree { root: SerializedNode }
interface SerializedModel {
  version: number; nTrees: number; maxDepth: number
  featureNames: string[]; trees: SerializedTree[]
  metadata?: { trainedAt: string; datasetSize: number; accuracy: number; f1Score: number }
}

interface TreeNode {
  featureIndex: number; threshold: number
  left: TreeNode | null; right: TreeNode | null
  prediction: number; confidence: number
}

function giniImpurity(labels: number[]): number {
  if (labels.length === 0) return 0
  const p1 = labels.reduce((s, l) => s + l, 0) / labels.length
  return 1 - p1 * p1 - (1 - p1) * (1 - p1)
}

function buildTree(samples: TrainingSample[], maxDepth: number, rng: PRNG, depth = 0): TreeNode {
  const labels = samples.map((s) => s.label)
  const positives = labels.reduce((s, l) => s + l, 0)
  const confidence = samples.length > 0 ? positives / samples.length : 0
  const prediction = confidence >= 0.5 ? 1 : 0

  if (depth >= maxDepth || samples.length <= 2 || giniImpurity(labels) === 0) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  const totalFeatures = samples[0].features.length
  const subsetSize = Math.max(1, Math.floor(Math.sqrt(totalFeatures)))
  const allIndices = Array.from({ length: totalFeatures }, (_, i) => i)
  rng.shuffle(allIndices)
  const featureIndices = allIndices.slice(0, subsetSize)

  let bestGain = -Infinity, bestFeature = -1, bestThreshold = 0
  let bestLeft: TrainingSample[] = [], bestRight: TrainingSample[] = []
  const parentGini = giniImpurity(labels)

  for (const fi of featureIndices) {
    const values = [...new Set(samples.map((s) => s.features[fi]))].sort((a, b) => a - b)

    // Subsample thresholds: max 60 equally-spaced candidates
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
      const left: TrainingSample[] = [], right: TrainingSample[] = []
      for (const s of samples) { (s.features[fi] <= threshold ? left : right).push(s) }
      if (left.length === 0 || right.length === 0) continue

      const wGini = (left.length / samples.length) * giniImpurity(left.map(s => s.label)) +
                    (right.length / samples.length) * giniImpurity(right.map(s => s.label))
      const gain = parentGini - wGini
      if (gain > bestGain) { bestGain = gain; bestFeature = fi; bestThreshold = threshold; bestLeft = left; bestRight = right }
    }
  }

  if (bestFeature === -1) {
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

function predictSingle(model: SerializedModel, features: number[]): { prediction: number; confidence: number } {
  let total = 0
  for (const tree of model.trees) {
    let node: SerializedNode | undefined = tree.root
    while (node && node.f !== -1) { node = features[node.f] <= node.t ? node.l : node.r }
    total += node?.c ?? 0.5
  }
  const avg = total / model.trees.length
  const pred = avg >= 0.5 ? 1 : 0
  return { prediction: pred, confidence: pred === 1 ? avg : 1 - avg }
}

// ─── Dataset Sample Interface ────────────────────────────────────────────────

interface DatasetSample {
  date: string; year: number; dayOfYear: number; province: string
  latitude: number; longitude: number; elevation: number
  monsoonZone: number; localSeasonIndex: number; enso: number; iod: number; rain: number
}

// ─── Feature Names (order matters — matches feature vector) ──────────────────

const FEATURE_NAMES = [
  'dayOfYear', 'latitude', 'longitude', 'elevation',
  'monsoonZone', 'localSeasonIndex', 'enso', 'iod',
]

function sampleToFeatures(s: DatasetSample): number[] {
  return [
    s.dayOfYear, s.latitude, s.longitude, s.elevation,
    s.monsoonZone, s.localSeasonIndex, s.enso, s.iod,
  ]
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const datasetPath = path.resolve(__dirname, '..', '..', 'public', 'dataset', 'local-weather-forecast', 'dataset.json')
  const outputDir = path.resolve(__dirname, '..', '..', 'public', 'ai-models', 'local-weather-forecast')
  const outputPath = path.resolve(outputDir, 'model.json')

  if (!fs.existsSync(datasetPath)) {
    console.error('❌ dataset.json not found. Run dataset-extract.ts first.')
    process.exit(1)
  }

  console.log('\n🌳 Model Generation: Random Forest')
  console.log('   Config: nTrees=40, maxDepth=6, seed=42')
  console.log(`   Input: ${datasetPath}`)
  console.log(`   Output: ${outputPath}\n`)

  // Load dataset
  const rawData: DatasetSample[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
  console.log(`📊 Dataset loaded: ${rawData.length} samples`)

  // Convert to training samples
  const samples: TrainingSample[] = rawData.map((s) => ({
    features: sampleToFeatures(s),
    label: s.rain,
  }))

  // Train/test split (80/20) — deterministic shuffle
  const rng = new PRNG(42)
  const indices = Array.from({ length: samples.length }, (_, i) => i)
  rng.shuffle(indices)

  const splitIdx = Math.floor(samples.length * 0.8)
  const trainIndices = indices.slice(0, splitIdx)
  const testIndices = indices.slice(splitIdx)

  const trainSamples = trainIndices.map((i) => samples[i])
  const testSamples = testIndices.map((i) => samples[i])

  console.log(`   Train: ${trainSamples.length} | Test: ${testSamples.length}`)

  // Class distribution
  const trainRain = trainSamples.filter((s) => s.label === 1).length
  const testRain = testSamples.filter((s) => s.label === 1).length
  console.log(`   Train rain: ${trainRain} (${((trainRain / trainSamples.length) * 100).toFixed(1)}%)`)
  console.log(`   Test rain: ${testRain} (${((testRain / testSamples.length) * 100).toFixed(1)}%)\n`)

  // Train
  console.log('🏋️  Training...')
  const trainStart = Date.now()

  const N_TREES = 40
  const MAX_DEPTH = 6
  const SEED = 42
  const trainRng = new PRNG(SEED)

  const trees: SerializedTree[] = []
  for (let i = 0; i < N_TREES; i++) {
    // Bootstrap sample
    const bootstrap: TrainingSample[] = Array.from({ length: trainSamples.length }, () =>
      trainSamples[trainRng.nextInt(trainSamples.length)]
    )
    const root = buildTree(bootstrap, MAX_DEPTH, trainRng)
    trees.push({ root: serializeNode(root) })
    process.stdout.write(`   Tree ${i + 1}/${N_TREES}\r`)
  }

  const trainTime = Date.now() - trainStart
  console.log(`   ✅ Training complete in ${(trainTime / 1000).toFixed(1)}s\n`)

  // Build model
  const model: SerializedModel = {
    version: 1,
    nTrees: N_TREES,
    maxDepth: MAX_DEPTH,
    featureNames: FEATURE_NAMES,
    trees,
  }

  // Evaluate
  console.log('📈 Evaluating on test set...')
  let tp = 0, fp = 0, tn = 0, fn = 0

  for (const sample of testSamples) {
    const { prediction } = predictSingle(model, sample.features)
    if (prediction === 1 && sample.label === 1) tp++
    else if (prediction === 1 && sample.label === 0) fp++
    else if (prediction === 0 && sample.label === 0) tn++
    else fn++
  }

  const accuracy = (tp + tn) / (tp + fp + tn + fn)
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  console.log(`\n   ┌─────────────────────────────────┐`)
  console.log(`   │ Accuracy:  ${(accuracy * 100).toFixed(2)}%              │`)
  console.log(`   │ Precision: ${(precision * 100).toFixed(2)}%              │`)
  console.log(`   │ Recall:    ${(recall * 100).toFixed(2)}%              │`)
  console.log(`   │ F1 Score:  ${(f1Score * 100).toFixed(2)}%              │`)
  console.log(`   └─────────────────────────────────┘`)
  console.log(`\n   Confusion Matrix:`)
  console.log(`   ┌──────────┬──────────┐`)
  console.log(`   │ TP: ${String(tp).padStart(5)} │ FP: ${String(fp).padStart(5)} │`)
  console.log(`   │ FN: ${String(fn).padStart(5)} │ TN: ${String(tn).padStart(5)} │`)
  console.log(`   └──────────┴──────────┘\n`)

  // Add metadata
  model.metadata = {
    trainedAt: new Date().toISOString(),
    datasetSize: rawData.length,
    accuracy: Math.round(accuracy * 10000) / 10000,
    f1Score: Math.round(f1Score * 10000) / 10000,
  }

  // Save
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(outputPath, JSON.stringify(model))

  const fileSizeKB = (Buffer.byteLength(JSON.stringify(model)) / 1024).toFixed(1)
  const totalTime = ((Date.now() - trainStart) / 1000).toFixed(1)
  console.log(`💾 Model saved: ${outputPath} (${fileSizeKB} KB)`)
  console.log(`   Trees: ${N_TREES} | Max depth: ${MAX_DEPTH} | Features: ${FEATURE_NAMES.length}`)
  console.log(`   Total time: ${totalTime}s\n`)
}

main()
