/**
 * Multi-slot Random Forest V2 — Browser Runtime
 *
 * Prediction-only implementation for in-browser inference.
 * Uses 4 independent forests (one per time slot), each performing
 * multiclass classification (4 classes: Cerah/Berawan/Gerimis/Hujan).
 */

import type {
  SerializedModelV2,
  SerializedNodeV2,
  SlotPrediction,
  WEATHER_CATEGORIES,
} from './typesV2'
import { NUM_CLASSES, NUM_SLOTS } from './typesV2'

/**
 * Predict weather for all 4 time slots given a feature vector.
 * Traverses each slot's independent forest and returns majority vote per slot.
 */
export function predictV2(
  model: SerializedModelV2,
  features: number[]
): SlotPrediction[] {
  const categories = model.categoryNames as unknown as typeof WEATHER_CATEGORIES
  const results: SlotPrediction[] = []

  for (let s = 0; s < NUM_SLOTS; s++) {
    const forest = model.forests[s]
    const nTrees = forest.trees.length

    // Vote counts per class
    const votes = new Array(NUM_CLASSES).fill(0)

    for (const tree of forest.trees) {
      let node: SerializedNodeV2 | undefined = tree.root
      while (node && node.f !== -1) {
        node = features[node.f] <= node.t ? node.l : node.r
      }
      if (node?.p !== undefined) {
        votes[node.p]++
      }
    }

    // Find majority vote
    let maxVotes = 0
    let maxClass = 0
    for (let c = 0; c < NUM_CLASSES; c++) {
      if (votes[c] > maxVotes) {
        maxVotes = votes[c]
        maxClass = c
      }
    }

    results.push({
      category: categories[maxClass],
      categoryIndex: maxClass,
      confidence: maxVotes / nTrees,
    })
  }

  return results
}
