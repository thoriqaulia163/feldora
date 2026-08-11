/**
 * Neural Network — Local Weather Forecast V3.3
 * Browser runtime: inference only.
 *
 * Four independent MLPs, each with its own embedding + backbone + single output.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SlotModelWeights {
  embedding: number[][]
  layers: { w: number[][]; b: number[] }[]
  output: { w: number[]; b: number }
}

export interface NNModelV33 {
  version: string
  type: 'nn-independent'
  architecture: string
  config: {
    embeddingDim: number
    hiddenLayers: number[]
    activation: string
    outputActivation: string
    numericFeatureCount: number
  }
  featureNames: string[]
  slotNames: string[]
  categoryNames: string[]
  locationVocab: string[]
  normalization: { mean: number[]; std: number[] }
  thresholds: number[]
  models: SlotModelWeights[]
  metadata?: {
    trainedAt: string
    seed: number
    learningRate: number
    batchSize: number
  }
}

export interface SlotPredictionV33 {
  category: string
  categoryIndex: number
  confidence: number
  probability: number
}

export interface PredictionResultV33 {
  morning: SlotPredictionV33
  afternoon: SlotPredictionV33
  evening: SlotPredictionV33
  night: SlotPredictionV33
  executionTime: number
  features: Record<string, number>
}

// ─── Inference ──────────────────────────────────────────────────────────────

function relu(x: number): number { return x > 0 ? x : 0 }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))) }

function forwardSlot(model: SlotModelWeights, locationIdx: number, normalizedFeatures: number[]): number {
  let input = [...model.embedding[locationIdx], ...normalizedFeatures]
  for (const layer of model.layers) {
    const out = new Array(layer.w.length)
    for (let i = 0; i < layer.w.length; i++) {
      let s = layer.b[i]
      const row = layer.w[i]
      for (let j = 0; j < input.length; j++) s += row[j] * input[j]
      out[i] = relu(s)
    }
    input = out
  }
  let s = model.output.b
  for (let j = 0; j < input.length; j++) s += model.output.w[j] * input[j]
  return sigmoid(s)
}

/**
 * Run inference across all 4 independent slot models.
 */
export function predictV33(
  model: NNModelV33,
  normalizedFeatures: number[],
  locationIdx: number,
  tuned: boolean = true,
): SlotPredictionV33[] {
  const results: SlotPredictionV33[] = []
  for (let s = 0; s < 4; s++) {
    const threshold = tuned ? model.thresholds[s] : 0.5
    const probability = forwardSlot(model.models[s], locationIdx, normalizedFeatures)
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

/**
 * Normalize raw features using model's training statistics.
 */
export function normalizeFeatures(raw: number[], norm: { mean: number[]; std: number[] }): number[] {
  return raw.map((v, i) => (v - norm.mean[i]) / norm.std[i])
}

/**
 * Look up city in location vocabulary. Returns -1 if not found.
 */
export function getLocationIndex(model: NNModelV33, cityName: string): number {
  return model.locationVocab.indexOf(cityName)
}
