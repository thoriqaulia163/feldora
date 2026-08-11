/**
 * Neural Network — Local Weather Forecast V3
 * Browser runtime: inference only.
 *
 * Shared MLP with Location Embedding + Temporal Representation + 4 Binary Output Heads.
 * Uses normalized features + learned city embeddings for rain prediction per time slot.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NNLayerWeights {
  w: number[][]
  b: number[]
}

export interface NNModelWeights {
  embedding: number[][]
  layers: NNLayerWeights[]
  heads: NNLayerWeights[]
}

export interface NNModelConfig {
  embeddingDim: number
  hiddenLayers: number[]
  activation: string
  outputActivation: string
  numericFeatureCount: number
}

export interface NNNormalization {
  mean: number[]
  std: number[]
}

export interface NNModelV3 {
  version: number
  type: 'nn'
  architecture: string
  config: NNModelConfig
  featureNames: string[]
  slotNames: string[]
  categoryNames: string[]
  locationVocab: string[]
  normalization: NNNormalization
  thresholds: number[]
  weights: NNModelWeights
  metadata?: {
    trainedAt: string
    seed: number
    learningRate: number
    batchSize: number
    datasetSize: number
    trainSize: number
    valSize: number
    testSize: number
  }
}

export interface SlotPredictionV3NN {
  category: string
  categoryIndex: number
  confidence: number
  probability: number
}

export interface PredictionResultV3NN {
  morning: SlotPredictionV3NN
  afternoon: SlotPredictionV3NN
  evening: SlotPredictionV3NN
  night: SlotPredictionV3NN
  executionTime: number
  features: Record<string, number>
}

// ─── Inference ──────────────────────────────────────────────────────────────

function relu(x: number): number {
  return x > 0 ? x : 0
}

function sigmoid(x: number): number {
  const clamped = Math.max(-500, Math.min(500, x))
  return 1 / (1 + Math.exp(-clamped))
}

/**
 * Run forward pass through the neural network.
 * @param model - The loaded model artifact
 * @param normalizedFeatures - Already-normalized numeric features
 * @param locationIdx - Index into the location vocabulary
 * @param tuned - If true, use model's optimized thresholds; otherwise use 0.5
 */
export function predictNN(
  model: NNModelV3,
  normalizedFeatures: number[],
  locationIdx: number,
  tuned: boolean = true,
): SlotPredictionV3NN[] {
  const { weights, thresholds } = model

  // 1. Embedding lookup
  const emb = weights.embedding[locationIdx]

  // 2. Concatenate: embedding + normalized numeric features
  let input = [...emb, ...normalizedFeatures]

  // 3. Hidden layers (ReLU activation)
  for (const layer of weights.layers) {
    const output: number[] = new Array(layer.w.length)
    for (let i = 0; i < layer.w.length; i++) {
      let sum = layer.b[i]
      const row = layer.w[i]
      for (let j = 0; j < input.length; j++) {
        sum += row[j] * input[j]
      }
      output[i] = relu(sum)
    }
    input = output
  }

  // 4. Output heads (Sigmoid) + threshold application
  const results: SlotPredictionV3NN[] = []
  for (let h = 0; h < weights.heads.length; h++) {
    const head = weights.heads[h]
    const threshold = tuned ? thresholds[h] : 0.5

    let sum = head.b[0]
    const row = head.w[0]
    for (let j = 0; j < input.length; j++) {
      sum += row[j] * input[j]
    }

    const probability = sigmoid(sum)
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
 * Normalize raw numeric features using model's training statistics.
 * Must be called before predictNN().
 */
export function normalizeFeatures(
  rawFeatures: number[],
  normalization: NNNormalization,
): number[] {
  const { mean, std } = normalization
  return rawFeatures.map((val, i) => (val - mean[i]) / std[i])
}

/**
 * Look up a city name in the model's location vocabulary.
 * Returns the index, or -1 if not found.
 */
export function getLocationIndex(model: NNModelV3, cityName: string): number {
  return model.locationVocab.indexOf(cityName)
}
