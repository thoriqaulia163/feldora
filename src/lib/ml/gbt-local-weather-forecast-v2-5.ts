/**
 * Gradient Boosted Trees — Local Weather Forecast V2.5
 * Browser runtime: prediction only.
 *
 * Binary classification per time slot (Hujan / Tidak Hujan).
 * Uses sigmoid(baseScore + lr * sum(tree_values)) for probability.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GBTNode {
  /** Feature index (-1 for leaf) */
  f: number
  /** Split threshold */
  t: number
  /** Left child (<=threshold) */
  l?: GBTNode
  /** Right child (>threshold) */
  r?: GBTNode
  /** Leaf value (residual prediction) */
  v?: number
}

export interface GBTTree {
  root: GBTNode
}

export interface GBTSlotForest {
  slot: string
  baseScore: number
  learningRate: number
  nTrees: number
  trees: GBTTree[]
}

export interface GBTModelV3 {
  version: 3
  type: 'gbt'
  nSlots: number
  nClasses: number
  featureNames: string[]
  slotNames: string[]
  categoryNames: string[]
  thresholds: number[]
  forests: GBTSlotForest[]
  metadata?: {
    trainedAt: string
    datasetSize: number
    accuracy: Record<string, number>
    f1Score: Record<string, number>
  }
}

export interface SlotPredictionV3 {
  category: string
  categoryIndex: number
  confidence: number
  probability: number
}

export interface PredictionResultV3 {
  morning: SlotPredictionV3
  afternoon: SlotPredictionV3
  evening: SlotPredictionV3
  night: SlotPredictionV3
  executionTime: number
  features: Record<string, number>
}

// ─── Prediction ─────────────────────────────────────────────────────────────

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function traverseTree(node: GBTNode, features: number[]): number {
  if (node.f === -1) return node.v ?? 0
  return features[node.f] <= node.t
    ? traverseTree(node.l!, features)
    : traverseTree(node.r!, features)
}

/**
 * Predict rain probability for all 4 time slots.
 * @param tuned - if true, use model's optimized thresholds; if false, use 0.5 default
 */
export function predictGBT(model: GBTModelV3, features: number[], tuned: boolean = true): SlotPredictionV3[] {
  const results: SlotPredictionV3[] = []

  for (let s = 0; s < model.nSlots; s++) {
    const forest = model.forests[s]
    const threshold = tuned ? (model.thresholds[s] ?? 0.5) : 0.5

    // Sum all tree predictions
    let score = forest.baseScore
    for (const tree of forest.trees) {
      score += forest.learningRate * traverseTree(tree.root, features)
    }

    const probability = sigmoid(score)
    const prediction = probability >= threshold ? 1 : 0
    const confidence = prediction === 1 ? probability : 1 - probability

    results.push({
      category: model.categoryNames[prediction],
      categoryIndex: prediction,
      confidence,
      probability,
    })
  }

  return results
}
