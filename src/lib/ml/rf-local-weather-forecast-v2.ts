/**
 * Multi-slot Random Forest V2 — Browser Runtime
 *
 * Prediction-only implementation for in-browser inference.
 * Uses 4 independent forests (one per time slot), each performing
 * binary classification (Tidak Hujan / Hujan) with per-slot thresholds.
 */

import type {
  SerializedModelV2,
  SerializedNodeV2,
  SlotPrediction,
  WEATHER_CATEGORIES,
} from './typesV2'
import { NUM_CLASSES, NUM_SLOTS } from './typesV2'

/** Default threshold if model doesn't specify */
const DEFAULT_THRESHOLD = 0.5

/**
 * Predict weather for all 4 time slots given a feature vector.
 * Uses per-slot thresholds for binary classification.
 * @param tuned - if true, use model's optimized thresholds; if false, use 0.5 default
 */
export function predictV2(
  model: SerializedModelV2,
  features: number[],
  tuned: boolean = true
): SlotPrediction[] {
  const categories = model.categoryNames as unknown as typeof WEATHER_CATEGORIES
  const thresholds = tuned
    ? (model.thresholds ?? Array(NUM_SLOTS).fill(DEFAULT_THRESHOLD))
    : Array(NUM_SLOTS).fill(DEFAULT_THRESHOLD)
  const results: SlotPrediction[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const forest = model.forests[s]
    const nTrees = forest.trees.length
    const threshold = thresholds[s] ?? DEFAULT_THRESHOLD

    // Count votes for class 1 (Hujan)
    let hujanVotes = 0
    for (const tree of forest.trees) {
      let node: SerializedNodeV2 | undefined = tree.root
      while (node && node.f !== -1) {
        node = features[node.f] <= node.t ? node.l : node.r
      }
      if (node?.p === 1) hujanVotes++
    }

    const hujanProportion = hujanVotes / nTrees
    const prediction = hujanProportion >= threshold ? 1 : 0
    const confidence = prediction === 1 ? hujanProportion : 1 - hujanProportion

    results.push({
      category: categories[prediction],
      categoryIndex: prediction,
      confidence,
    })
  }

  return results
}
