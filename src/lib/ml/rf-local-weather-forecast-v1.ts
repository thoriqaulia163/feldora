import { PRNG } from './prng'
import type {
  SerializedModel,
  SerializedNode,
  SerializedTree,
  TrainingSample,
} from './types'

// ─── Internal Tree Node ─────────────────────────────────────────────────────

interface TreeNode {
  featureIndex: number
  threshold: number
  left: TreeNode | null
  right: TreeNode | null
  prediction: number
  confidence: number
}

// ─── Gini Impurity ──────────────────────────────────────────────────────────

function giniImpurity(labels: number[]): number {
  if (labels.length === 0) return 0
  const positives = labels.reduce((s, l) => s + l, 0)
  const p1 = positives / labels.length
  const p0 = 1 - p1
  return 1 - p0 * p0 - p1 * p1
}

// ─── Decision Tree Builder ──────────────────────────────────────────────────

function buildTree(
  samples: TrainingSample[],
  maxDepth: number,
  nFeatures: number,
  rng: PRNG,
  depth: number = 0
): TreeNode {
  const labels = samples.map((s) => s.label)
  const positives = labels.reduce((s, l) => s + l, 0)
  const confidence = samples.length > 0 ? positives / samples.length : 0
  const prediction = confidence >= 0.5 ? 1 : 0

  // Leaf conditions
  if (depth >= maxDepth || samples.length <= 2 || giniImpurity(labels) === 0) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  // Random feature subset (sqrt of total features)
  const totalFeatures = samples[0].features.length
  const featureSubsetSize = Math.max(1, Math.floor(Math.sqrt(totalFeatures)))
  const featureIndices: number[] = []
  const allIndices = Array.from({ length: totalFeatures }, (_, i) => i)
  rng.shuffle(allIndices)
  for (let i = 0; i < featureSubsetSize; i++) {
    featureIndices.push(allIndices[i])
  }

  let bestGain = -Infinity
  let bestFeature = -1
  let bestThreshold = 0
  let bestLeftSamples: TrainingSample[] = []
  let bestRightSamples: TrainingSample[] = []

  const parentGini = giniImpurity(labels)

  for (const fi of featureIndices) {
    // Get unique sorted values for this feature
    const values = [...new Set(samples.map((s) => s.features[fi]))].sort((a, b) => a - b)

    // Try midpoints as thresholds
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2
      const leftSamples: TrainingSample[] = []
      const rightSamples: TrainingSample[] = []

      for (const s of samples) {
        if (s.features[fi] <= threshold) {
          leftSamples.push(s)
        } else {
          rightSamples.push(s)
        }
      }

      if (leftSamples.length === 0 || rightSamples.length === 0) continue

      const leftGini = giniImpurity(leftSamples.map((s) => s.label))
      const rightGini = giniImpurity(rightSamples.map((s) => s.label))
      const weightedGini =
        (leftSamples.length / samples.length) * leftGini +
        (rightSamples.length / samples.length) * rightGini

      const gain = parentGini - weightedGini

      if (gain > bestGain) {
        bestGain = gain
        bestFeature = fi
        bestThreshold = threshold
        bestLeftSamples = leftSamples
        bestRightSamples = rightSamples
      }
    }
  }

  // No valid split found
  if (bestFeature === -1) {
    return { featureIndex: -1, threshold: 0, left: null, right: null, prediction, confidence }
  }

  return {
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: buildTree(bestLeftSamples, maxDepth, nFeatures, rng, depth + 1),
    right: buildTree(bestRightSamples, maxDepth, nFeatures, rng, depth + 1),
    prediction,
    confidence,
  }
}

// ─── Bootstrap Sampling ─────────────────────────────────────────────────────

function bootstrapSample(samples: TrainingSample[], rng: PRNG): TrainingSample[] {
  const n = samples.length
  const result: TrainingSample[] = new Array(n)
  for (let i = 0; i < n; i++) {
    result[i] = samples[rng.nextInt(n)]
  }
  return result
}

// ─── Public API: Train ──────────────────────────────────────────────────────

export interface TrainOptions {
  nTrees?: number
  maxDepth?: number
  seed?: number
  onProgress?: (tree: number, total: number) => void
}

export function trainRandomForest(
  samples: TrainingSample[],
  featureNames: string[],
  options: TrainOptions = {}
): SerializedModel {
  const { nTrees = 30, maxDepth = 5, seed = 42, onProgress } = options
  const rng = new PRNG(seed)
  const nFeatures = Math.max(1, Math.floor(Math.sqrt(featureNames.length)))

  const trees: SerializedTree[] = []

  for (let i = 0; i < nTrees; i++) {
    const subset = bootstrapSample(samples, rng)
    const root = buildTree(subset, maxDepth, nFeatures, rng)
    trees.push({ root: serializeNode(root) })
    onProgress?.(i + 1, nTrees)
  }

  return {
    version: 1,
    nTrees,
    maxDepth,
    featureNames,
    trees,
  }
}

// ─── Public API: Predict ────────────────────────────────────────────────────

export function predictSingle(model: SerializedModel, features: number[]): { prediction: 0 | 1; confidence: number } {
  let totalConfidence = 0

  for (const tree of model.trees) {
    let node: SerializedNode | undefined = tree.root
    while (node && node.f !== -1) {
      if (features[node.f] <= node.t) {
        node = node.l
      } else {
        node = node.r
      }
    }
    totalConfidence += node?.c ?? 0.5
  }

  const avgConfidence = totalConfidence / model.trees.length
  const prediction: 0 | 1 = avgConfidence >= 0.5 ? 1 : 0
  const confidence = prediction === 1 ? avgConfidence : 1 - avgConfidence

  return { prediction, confidence }
}

/** Batch predict for evaluation */
export function predictBatch(model: SerializedModel, samples: TrainingSample[]): { predictions: number[]; confidences: number[] } {
  const predictions: number[] = []
  const confidences: number[] = []
  for (const s of samples) {
    const r = predictSingle(model, s.features)
    predictions.push(r.prediction)
    confidences.push(r.confidence)
  }
  return { predictions, confidences }
}

// ─── Serialization ──────────────────────────────────────────────────────────

function serializeNode(node: TreeNode): SerializedNode {
  if (node.featureIndex === -1) {
    return { f: -1, t: 0, p: node.prediction, c: node.confidence }
  }
  return {
    f: node.featureIndex,
    t: Math.round(node.threshold * 1000) / 1000, // round for smaller JSON
    l: node.left ? serializeNode(node.left) : undefined,
    r: node.right ? serializeNode(node.right) : undefined,
  }
}

// ─── Evaluation Metrics ─────────────────────────────────────────────────────

export interface EvaluationMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix: { tp: number; fp: number; tn: number; fn: number }
}

export function evaluate(model: SerializedModel, testSamples: TrainingSample[]): EvaluationMetrics {
  const { predictions } = predictBatch(model, testSamples)
  const labels = testSamples.map((s) => s.label)

  let tp = 0, fp = 0, tn = 0, fn = 0

  for (let i = 0; i < labels.length; i++) {
    if (predictions[i] === 1 && labels[i] === 1) tp++
    else if (predictions[i] === 1 && labels[i] === 0) fp++
    else if (predictions[i] === 0 && labels[i] === 0) tn++
    else fn++
  }

  const accuracy = (tp + tn) / (tp + fp + tn + fn)
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  return { accuracy, precision, recall, f1Score, confusionMatrix: { tp, fp, tn, fn } }
}
