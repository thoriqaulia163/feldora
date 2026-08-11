/**
 * Local Weather Forecast V3 — Neural Network Training Script
 *
 * Shared MLP with Location Embedding + Temporal Representation + 4 Binary Output Heads
 *
 * Usage: npx tsx scripts/local-weather-forecast-v3/model-generation.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  // Architecture
  embeddingDim: 8,
  hiddenLayers: [64, 32, 16] as number[],
  activation: 'relu' as const,
  outputActivation: 'sigmoid' as const,

  // Training
  learningRate: 0.001,
  batchSize: 64,
  maxEpochs: 200,
  earlyStoppingPatience: 15,
  seed: 42,

  // Threshold tuning
  thresholdMin: 0.20,
  thresholdMax: 0.70,
  thresholdStep: 0.05,

  // Paths
  datasetPath: 'public/dataset/local-weather-forecast-v2-5/dataset.json',
  outputDir: 'public/ai-models/local-weather-forecast-v3',
  outputFile: 'model.json',
}

const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night'] as const
const RAIN_THRESHOLD = 2 // WMO code >= 2 means rain

// ─── Types ──────────────────────────────────────────────────────────────────

interface DataRow {
  date: string
  year: number
  dayOfYear: number
  city: string
  province: string
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

interface PreparedSample {
  locationIdx: number
  numericFeatures: number[]  // will be normalized
  targets: number[]          // [morning, afternoon, evening, night] binary
}

interface NormStats {
  mean: number[]
  std: number[]
}

// ─── PRNG (Mulberry32) ──────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Dataset Loading & Preparation ─────────────────────────────────────────

function loadDataset(): DataRow[] {
  const path = resolve(process.cwd(), CONFIG.datasetPath)
  console.log(`Loading dataset from ${path}...`)
  const raw = readFileSync(path, 'utf-8')
  const data: DataRow[] = JSON.parse(raw)
  console.log(`  Loaded ${data.length} rows`)
  return data
}

function buildLocationVocab(data: DataRow[]): Map<string, number> {
  const cities = [...new Set(data.map((r) => r.city))].sort()
  const vocab = new Map<string, number>()
  cities.forEach((city, idx) => vocab.set(city, idx))
  console.log(`  Location vocab: ${vocab.size} cities`)
  return vocab
}

/**
 * Build numeric feature vector for a single row.
 * Features: [dayOfYear, latitude, longitude, elevation, monsoonZone,
 *            localSeasonIndex, enso, iod, prevDayRain, sinDay, cosDay,
 *            sinMonth, cosMonth, dayLength]
 */
function buildNumericFeatures(row: DataRow): number[] {
  const sinDay = Math.sin((2 * Math.PI * row.dayOfYear) / 365)
  const cosDay = Math.cos((2 * Math.PI * row.dayOfYear) / 365)

  // Month from date string
  const month = parseInt(row.date.split('-')[1], 10)
  const sinMonth = Math.sin((2 * Math.PI * month) / 12)
  const cosMonth = Math.cos((2 * Math.PI * month) / 12)

  // Day length (simplified astronomical formula)
  const latRad = row.latitude * Math.PI / 180
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (row.dayOfYear - 81)) * Math.PI / 180
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declination)
  let dayLength: number
  if (cosHourAngle > 1) dayLength = 0
  else if (cosHourAngle < -1) dayLength = 24
  else dayLength = (2 * Math.acos(cosHourAngle) * 180 / Math.PI) / 15

  // prevDayRain: binary (>=1 slot rained → 1)
  const prevDayRain = row.prevDayRainSlots >= 1 ? 1 : 0

  return [
    row.dayOfYear,
    row.latitude,
    row.longitude,
    row.elevation,
    row.monsoonZone,
    row.localSeasonIndex,
    row.enso,
    row.iod,
    prevDayRain,
    sinDay,
    cosDay,
    sinMonth,
    cosMonth,
    dayLength,
  ]
}

const FEATURE_NAMES = [
  'dayOfYear', 'latitude', 'longitude', 'elevation', 'monsoonZone',
  'localSeasonIndex', 'enso', 'iod', 'prevDayRain', 'sinDay', 'cosDay',
  'sinMonth', 'cosMonth', 'dayLength',
]

function prepareSamples(data: DataRow[], vocab: Map<string, number>): PreparedSample[] {
  return data.map((row) => ({
    locationIdx: vocab.get(row.city)!,
    numericFeatures: buildNumericFeatures(row),
    targets: [
      row.morning >= RAIN_THRESHOLD ? 1 : 0,
      row.afternoon >= RAIN_THRESHOLD ? 1 : 0,
      row.evening >= RAIN_THRESHOLD ? 1 : 0,
      row.night >= RAIN_THRESHOLD ? 1 : 0,
    ],
  }))
}

/**
 * Time-based split: 2021-2023 train, 2024 validation, 2025 test
 */
function splitByTime(data: DataRow[]): { train: DataRow[]; val: DataRow[]; test: DataRow[] } {
  const train = data.filter((r) => r.year <= 2023)
  const val = data.filter((r) => r.year === 2024)
  const test = data.filter((r) => r.year === 2025)
  console.log(`  Split: train=${train.length}, val=${val.length}, test=${test.length}`)
  return { train, val, test }
}

function computeNormStats(samples: PreparedSample[]): NormStats {
  const nFeatures = samples[0].numericFeatures.length
  const mean = new Array(nFeatures).fill(0)
  const std = new Array(nFeatures).fill(0)

  for (const s of samples) {
    for (let i = 0; i < nFeatures; i++) mean[i] += s.numericFeatures[i]
  }
  for (let i = 0; i < nFeatures; i++) mean[i] /= samples.length

  for (const s of samples) {
    for (let i = 0; i < nFeatures; i++) {
      const diff = s.numericFeatures[i] - mean[i]
      std[i] += diff * diff
    }
  }
  for (let i = 0; i < nFeatures; i++) {
    std[i] = Math.sqrt(std[i] / samples.length)
    // Safe std (avoid division by zero)
    if (std[i] < 1e-8) std[i] = 1e-8
  }

  return { mean, std }
}

function normalizeSamples(samples: PreparedSample[], stats: NormStats): void {
  for (const s of samples) {
    for (let i = 0; i < s.numericFeatures.length; i++) {
      s.numericFeatures[i] = (s.numericFeatures[i] - stats.mean[i]) / stats.std[i]
    }
  }
}

// ─── Neural Network ─────────────────────────────────────────────────────────

interface NNWeights {
  embedding: number[][]          // [vocabSize][embeddingDim]
  layers: { w: number[][]; b: number[] }[]  // dense layers
  heads: { w: number[][]; b: number[] }[]   // 4 output heads
}

function initWeights(
  vocabSize: number,
  embeddingDim: number,
  inputDim: number,
  hiddenLayers: number[],
  nHeads: number,
  rng: () => number,
): NNWeights {
  // Xavier/Glorot initialization
  const xavier = (fanIn: number, fanOut: number): number => {
    const limit = Math.sqrt(6 / (fanIn + fanOut))
    return (rng() * 2 - 1) * limit
  }

  // Embedding
  const embedding: number[][] = []
  for (let i = 0; i < vocabSize; i++) {
    const row: number[] = []
    for (let j = 0; j < embeddingDim; j++) row.push(xavier(vocabSize, embeddingDim))
    embedding.push(row)
  }

  // Dense layers
  const layers: { w: number[][]; b: number[] }[] = []
  let prevDim = inputDim
  for (const size of hiddenLayers) {
    const w: number[][] = []
    for (let i = 0; i < size; i++) {
      const row: number[] = []
      for (let j = 0; j < prevDim; j++) row.push(xavier(prevDim, size))
      w.push(row)
    }
    const b = new Array(size).fill(0)
    layers.push({ w, b })
    prevDim = size
  }

  // Output heads (prevDim → 1 each)
  const heads: { w: number[][]; b: number[] }[] = []
  for (let h = 0; h < nHeads; h++) {
    const w: number[][] = [[]]
    for (let j = 0; j < prevDim; j++) w[0].push(xavier(prevDim, 1))
    heads.push({ w, b: [0] })
  }

  return { embedding, layers, heads }
}

// Forward pass
function relu(x: number): number { return x > 0 ? x : 0 }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))) }

function forward(
  weights: NNWeights,
  locationIdx: number,
  numericFeatures: number[],
): number[] {
  // Embedding lookup
  const emb = weights.embedding[locationIdx]

  // Concatenate: embedding + numeric features
  let input = [...emb, ...numericFeatures]

  // Hidden layers (ReLU)
  for (const layer of weights.layers) {
    const output: number[] = []
    for (let i = 0; i < layer.w.length; i++) {
      let sum = layer.b[i]
      for (let j = 0; j < input.length; j++) sum += layer.w[i][j] * input[j]
      output.push(relu(sum))
    }
    input = output
  }

  // Output heads (Sigmoid)
  const predictions: number[] = []
  for (const head of weights.heads) {
    let sum = head.b[0]
    for (let j = 0; j < input.length; j++) sum += head.w[0][j] * input[j]
    predictions.push(sigmoid(sum))
  }

  return predictions
}

// ─── Backpropagation ────────────────────────────────────────────────────────

interface Gradients {
  embedding: number[][]
  layers: { dw: number[][]; db: number[] }[]
  heads: { dw: number[][]; db: number[] }[]
}

function zeroGradients(weights: NNWeights): Gradients {
  const embedding = weights.embedding.map((row) => new Array(row.length).fill(0))
  const layers = weights.layers.map((l) => ({
    dw: l.w.map((row) => new Array(row.length).fill(0)),
    db: new Array(l.b.length).fill(0),
  }))
  const heads = weights.heads.map((h) => ({
    dw: h.w.map((row) => new Array(row.length).fill(0)),
    db: new Array(h.b.length).fill(0),
  }))
  return { embedding, layers, heads }
}

function backprop(
  weights: NNWeights,
  locationIdx: number,
  numericFeatures: number[],
  targets: number[],
  grads: Gradients,
): number {
  // ── Forward pass with activations stored ──
  const emb = weights.embedding[locationIdx]
  const allInputs: number[][] = []
  const allPreRelu: number[][] = []

  let input = [...emb, ...numericFeatures]
  allInputs.push(input)

  for (const layer of weights.layers) {
    const preRelu: number[] = []
    const output: number[] = []
    for (let i = 0; i < layer.w.length; i++) {
      let sum = layer.b[i]
      for (let j = 0; j < input.length; j++) sum += layer.w[i][j] * input[j]
      preRelu.push(sum)
      output.push(relu(sum))
    }
    allPreRelu.push(preRelu)
    input = output
    allInputs.push(input)
  }

  // Head outputs
  const predictions: number[] = []
  for (const head of weights.heads) {
    let sum = head.b[0]
    for (let j = 0; j < input.length; j++) sum += head.w[0][j] * input[j]
    predictions.push(sigmoid(sum))
  }

  // ── Loss (BCE) ──
  let loss = 0
  for (let h = 0; h < 4; h++) {
    const p = Math.max(1e-7, Math.min(1 - 1e-7, predictions[h]))
    const t = targets[h]
    loss -= t * Math.log(p) + (1 - t) * Math.log(1 - p)
  }

  // ── Backward from heads ──
  // dL/d(pre_sigmoid) = prediction - target (for BCE + sigmoid)
  const lastHiddenInput = allInputs[allInputs.length - 1]
  let dHidden = new Array(lastHiddenInput.length).fill(0)

  for (let h = 0; h < 4; h++) {
    const dOut = predictions[h] - targets[h]
    // Gradient for head weights
    for (let j = 0; j < lastHiddenInput.length; j++) {
      grads.heads[h].dw[0][j] += dOut * lastHiddenInput[j]
      dHidden[j] += dOut * weights.heads[h].w[0][j]
    }
    grads.heads[h].db[0] += dOut
  }

  // ── Backward through hidden layers ──
  for (let l = weights.layers.length - 1; l >= 0; l--) {
    const layerInput = allInputs[l]
    const preRelu = allPreRelu[l]
    const layer = weights.layers[l]
    const dNext = new Array(layerInput.length).fill(0)

    for (let i = 0; i < layer.w.length; i++) {
      // ReLU derivative
      const dRelu = preRelu[i] > 0 ? dHidden[i] : 0
      grads.layers[l].db[i] += dRelu
      for (let j = 0; j < layerInput.length; j++) {
        grads.layers[l].dw[i][j] += dRelu * layerInput[j]
        dNext[j] += dRelu * layer.w[i][j]
      }
    }
    dHidden = dNext
  }

  // ── Backward through embedding ──
  // dHidden now has gradients for [emb...numericFeatures]
  for (let j = 0; j < emb.length; j++) {
    grads.embedding[locationIdx][j] += dHidden[j]
  }

  return loss
}

// ─── Adam Optimizer ─────────────────────────────────────────────────────────

interface AdamState {
  m_emb: number[][]
  v_emb: number[][]
  m_layers: { mw: number[][]; mb: number[] }[]
  v_layers: { vw: number[][]; vb: number[] }[]
  m_heads: { mw: number[][]; mb: number[] }[]
  v_heads: { vw: number[][]; vb: number[] }[]
  t: number
}

function initAdam(weights: NNWeights): AdamState {
  return {
    m_emb: weights.embedding.map((r) => new Array(r.length).fill(0)),
    v_emb: weights.embedding.map((r) => new Array(r.length).fill(0)),
    m_layers: weights.layers.map((l) => ({
      mw: l.w.map((r) => new Array(r.length).fill(0)),
      mb: new Array(l.b.length).fill(0),
    })),
    v_layers: weights.layers.map((l) => ({
      vw: l.w.map((r) => new Array(r.length).fill(0)),
      vb: new Array(l.b.length).fill(0),
    })),
    m_heads: weights.heads.map((h) => ({
      mw: h.w.map((r) => new Array(r.length).fill(0)),
      mb: new Array(h.b.length).fill(0),
    })),
    v_heads: weights.heads.map((h) => ({
      vw: h.w.map((r) => new Array(r.length).fill(0)),
      vb: new Array(h.b.length).fill(0),
    })),
    t: 0,
  }
}

function adamUpdate(
  weights: NNWeights,
  grads: Gradients,
  state: AdamState,
  lr: number,
  batchSize: number,
): void {
  const beta1 = 0.9, beta2 = 0.999, eps = 1e-8
  state.t++
  const bc1 = 1 - Math.pow(beta1, state.t)
  const bc2 = 1 - Math.pow(beta2, state.t)

  const update = (
    param: number, grad: number, m: number, v: number
  ): { param: number; m: number; v: number } => {
    const g = grad / batchSize
    const newM = beta1 * m + (1 - beta1) * g
    const newV = beta2 * v + (1 - beta2) * g * g
    const mHat = newM / bc1
    const vHat = newV / bc2
    return { param: param - lr * mHat / (Math.sqrt(vHat) + eps), m: newM, v: newV }
  }

  // Embedding
  for (let i = 0; i < weights.embedding.length; i++) {
    for (let j = 0; j < weights.embedding[i].length; j++) {
      if (grads.embedding[i][j] === 0) continue
      const r = update(weights.embedding[i][j], grads.embedding[i][j], state.m_emb[i][j], state.v_emb[i][j])
      weights.embedding[i][j] = r.param
      state.m_emb[i][j] = r.m
      state.v_emb[i][j] = r.v
    }
  }

  // Layers
  for (let l = 0; l < weights.layers.length; l++) {
    for (let i = 0; i < weights.layers[l].w.length; i++) {
      for (let j = 0; j < weights.layers[l].w[i].length; j++) {
        const r = update(weights.layers[l].w[i][j], grads.layers[l].dw[i][j], state.m_layers[l].mw[i][j], state.v_layers[l].vw[i][j])
        weights.layers[l].w[i][j] = r.param
        state.m_layers[l].mw[i][j] = r.m
        state.v_layers[l].vw[i][j] = r.v
      }
      const rb = update(weights.layers[l].b[i], grads.layers[l].db[i], state.m_layers[l].mb[i], state.v_layers[l].vb[i])
      weights.layers[l].b[i] = rb.param
      state.m_layers[l].mb[i] = rb.m
      state.v_layers[l].vb[i] = rb.v
    }
  }

  // Heads
  for (let h = 0; h < weights.heads.length; h++) {
    for (let j = 0; j < weights.heads[h].w[0].length; j++) {
      const r = update(weights.heads[h].w[0][j], grads.heads[h].dw[0][j], state.m_heads[h].mw[0][j], state.v_heads[h].vw[0][j])
      weights.heads[h].w[0][j] = r.param
      state.m_heads[h].mw[0][j] = r.m
      state.v_heads[h].vw[0][j] = r.v
    }
    const rb = update(weights.heads[h].b[0], grads.heads[h].db[0], state.m_heads[h].mb[0], state.v_heads[h].vb[0])
    weights.heads[h].b[0] = rb.param
    state.m_heads[h].mb[0] = rb.m
    state.v_heads[h].vb[0] = rb.v
  }
}

// ─── Training Loop ──────────────────────────────────────────────────────────

function shuffleIndices(n: number, rng: () => number): number[] {
  const indices = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function evaluateLoss(weights: NNWeights, samples: PreparedSample[]): number {
  let totalLoss = 0
  for (const s of samples) {
    const preds = forward(weights, s.locationIdx, s.numericFeatures)
    for (let h = 0; h < 4; h++) {
      const p = Math.max(1e-7, Math.min(1 - 1e-7, preds[h]))
      const t = s.targets[h]
      totalLoss -= t * Math.log(p) + (1 - t) * Math.log(1 - p)
    }
  }
  return totalLoss / samples.length
}

function train(
  weights: NNWeights,
  trainSamples: PreparedSample[],
  valSamples: PreparedSample[],
  config: typeof CONFIG,
): NNWeights {
  const rng = mulberry32(config.seed + 1000)
  const adam = initAdam(weights)

  let bestValLoss = Infinity
  let bestWeights: string = ''
  let patience = 0

  console.log('\n── Training ──')
  console.log(`  Epochs: max ${config.maxEpochs}, early stopping patience: ${config.earlyStoppingPatience}`)
  console.log(`  Batch size: ${config.batchSize}, Learning rate: ${config.learningRate}`)
  console.log(`  Train samples: ${trainSamples.length}, Val samples: ${valSamples.length}\n`)

  for (let epoch = 1; epoch <= config.maxEpochs; epoch++) {
    const indices = shuffleIndices(trainSamples.length, rng)
    let epochLoss = 0
    let batchCount = 0

    for (let bStart = 0; bStart < trainSamples.length; bStart += config.batchSize) {
      const bEnd = Math.min(bStart + config.batchSize, trainSamples.length)
      const bSize = bEnd - bStart
      const grads = zeroGradients(weights)

      for (let i = bStart; i < bEnd; i++) {
        const s = trainSamples[indices[i]]
        epochLoss += backprop(weights, s.locationIdx, s.numericFeatures, s.targets, grads)
      }

      adamUpdate(weights, grads, adam, config.learningRate, bSize)
      batchCount++
    }

    const trainLoss = epochLoss / trainSamples.length
    const valLoss = evaluateLoss(weights, valSamples)

    if (epoch % 5 === 0 || epoch === 1) {
      console.log(`  Epoch ${epoch.toString().padStart(3)}: train_loss=${trainLoss.toFixed(4)}  val_loss=${valLoss.toFixed(4)}`)
    }

    if (valLoss < bestValLoss) {
      bestValLoss = valLoss
      bestWeights = JSON.stringify(weights)
      patience = 0
    } else {
      patience++
      if (patience >= config.earlyStoppingPatience) {
        console.log(`\n  Early stopping at epoch ${epoch} (best val_loss=${bestValLoss.toFixed(4)})`)
        break
      }
    }
  }

  console.log(`  Best validation loss: ${bestValLoss.toFixed(4)}`)
  return JSON.parse(bestWeights)
}

// ─── Evaluation & Threshold Tuning ──────────────────────────────────────────

interface SlotMetrics {
  accuracy: number
  precision: number
  recall: number
  f1: number
}

function evaluateWithThresholds(
  weights: NNWeights,
  samples: PreparedSample[],
  thresholds: number[],
): { overall: { accuracy: number; macroF1: number }; perSlot: SlotMetrics[] } {
  const tp = [0, 0, 0, 0]
  const fp = [0, 0, 0, 0]
  const fn = [0, 0, 0, 0]
  const tn = [0, 0, 0, 0]

  for (const s of samples) {
    const preds = forward(weights, s.locationIdx, s.numericFeatures)
    for (let h = 0; h < 4; h++) {
      const predicted = preds[h] >= thresholds[h] ? 1 : 0
      const actual = s.targets[h]
      if (predicted === 1 && actual === 1) tp[h]++
      else if (predicted === 1 && actual === 0) fp[h]++
      else if (predicted === 0 && actual === 1) fn[h]++
      else tn[h]++
    }
  }

  const perSlot: SlotMetrics[] = []
  let totalCorrect = 0
  let totalSamples = 0
  let macroF1Sum = 0

  for (let h = 0; h < 4; h++) {
    const acc = (tp[h] + tn[h]) / (tp[h] + fp[h] + fn[h] + tn[h])
    const prec = tp[h] + fp[h] > 0 ? tp[h] / (tp[h] + fp[h]) : 0
    const rec = tp[h] + fn[h] > 0 ? tp[h] / (tp[h] + fn[h]) : 0
    const f1 = prec + rec > 0 ? 2 * prec * rec / (prec + rec) : 0

    // Macro F1: average of F1(class0) and F1(class1)
    const prec0 = tn[h] + fn[h] > 0 ? tn[h] / (tn[h] + fn[h]) : 0
    const rec0 = tn[h] + fp[h] > 0 ? tn[h] / (tn[h] + fp[h]) : 0
    const f1_0 = prec0 + rec0 > 0 ? 2 * prec0 * rec0 / (prec0 + rec0) : 0
    const slotMacroF1 = (f1 + f1_0) / 2

    perSlot.push({ accuracy: acc, precision: prec, recall: rec, f1: slotMacroF1 })
    totalCorrect += tp[h] + tn[h]
    totalSamples += tp[h] + fp[h] + fn[h] + tn[h]
    macroF1Sum += slotMacroF1
  }

  return {
    overall: { accuracy: totalCorrect / totalSamples, macroF1: macroF1Sum / 4 },
    perSlot,
  }
}

function tuneThresholds(weights: NNWeights, valSamples: PreparedSample[]): number[] {
  console.log('\n── Threshold Tuning ──')
  const bestThresholds = [0.5, 0.5, 0.5, 0.5]

  // Precompute all predictions for validation set
  const allPreds: number[][] = valSamples.map((s) =>
    forward(weights, s.locationIdx, s.numericFeatures)
  )

  for (let h = 0; h < 4; h++) {
    let bestF1 = -1
    for (let t = CONFIG.thresholdMin; t <= CONFIG.thresholdMax; t += CONFIG.thresholdStep) {
      let tp = 0, fp = 0, fn = 0, tn = 0
      for (let i = 0; i < valSamples.length; i++) {
        const predicted = allPreds[i][h] >= t ? 1 : 0
        const actual = valSamples[i].targets[h]
        if (predicted === 1 && actual === 1) tp++
        else if (predicted === 1 && actual === 0) fp++
        else if (predicted === 0 && actual === 1) fn++
        else tn++
      }
      const prec1 = tp + fp > 0 ? tp / (tp + fp) : 0
      const rec1 = tp + fn > 0 ? tp / (tp + fn) : 0
      const f1_1 = prec1 + rec1 > 0 ? 2 * prec1 * rec1 / (prec1 + rec1) : 0
      const prec0 = tn + fn > 0 ? tn / (tn + fn) : 0
      const rec0 = tn + fp > 0 ? tn / (tn + fp) : 0
      const f1_0 = prec0 + rec0 > 0 ? 2 * prec0 * rec0 / (prec0 + rec0) : 0
      const macroF1 = (f1_1 + f1_0) / 2

      if (macroF1 > bestF1) {
        bestF1 = macroF1
        bestThresholds[h] = Math.round(t * 100) / 100
      }
    }
    console.log(`  ${SLOT_NAMES[h].padEnd(10)}: threshold=${bestThresholds[h].toFixed(2)} → Macro F1=${bestF1.toFixed(4)}`)
  }

  return bestThresholds
}

// ─── Export Model Artifact ──────────────────────────────────────────────────

function exportModel(
  weights: NNWeights,
  vocab: Map<string, number>,
  normStats: NormStats,
  thresholds: number[],
): void {
  const outputDir = resolve(process.cwd(), CONFIG.outputDir)
  mkdirSync(outputDir, { recursive: true })

  // Convert vocab to sorted array for deterministic output
  const locationVocab: string[] = new Array(vocab.size)
  vocab.forEach((idx, city) => { locationVocab[idx] = city })

  const artifact = {
    version: 3,
    type: 'nn' as const,
    architecture: 'shared-mlp',
    config: {
      embeddingDim: CONFIG.embeddingDim,
      hiddenLayers: CONFIG.hiddenLayers,
      activation: CONFIG.activation,
      outputActivation: CONFIG.outputActivation,
      numericFeatureCount: FEATURE_NAMES.length,
    },
    featureNames: FEATURE_NAMES,
    slotNames: [...SLOT_NAMES],
    categoryNames: ['Tidak Hujan', 'Hujan'],
    locationVocab,
    normalization: {
      mean: normStats.mean.map((v) => Math.round(v * 1e6) / 1e6),
      std: normStats.std.map((v) => Math.round(v * 1e6) / 1e6),
    },
    thresholds,
    weights: {
      embedding: weights.embedding.map((row) => row.map((v) => Math.round(v * 1e6) / 1e6)),
      layers: weights.layers.map((l) => ({
        w: l.w.map((row) => row.map((v) => Math.round(v * 1e6) / 1e6)),
        b: l.b.map((v) => Math.round(v * 1e6) / 1e6),
      })),
      heads: weights.heads.map((h) => ({
        w: h.w.map((row) => row.map((v) => Math.round(v * 1e6) / 1e6)),
        b: h.b.map((v) => Math.round(v * 1e6) / 1e6),
      })),
    },
    metadata: {
      trainedAt: new Date().toISOString(),
      seed: CONFIG.seed,
      learningRate: CONFIG.learningRate,
      batchSize: CONFIG.batchSize,
      datasetSize: 0, // filled below
      trainSize: 0,
      valSize: 0,
      testSize: 0,
    },
  }

  const outputPath = resolve(outputDir, CONFIG.outputFile)
  writeFileSync(outputPath, JSON.stringify(artifact))
  const size = readFileSync(outputPath).length
  console.log(`\n  Model exported to: ${outputPath}`)
  console.log(`  Model size: ${(size / 1024).toFixed(1)} KB`)

  return artifact as any
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' Local Weather Forecast V3 — Neural Network Training')
  console.log('═══════════════════════════════════════════════════════════\n')

  // 1. Load & split
  const data = loadDataset()
  const { train: trainData, val: valData, test: testData } = splitByTime(data)

  // 2. Build vocab & prepare samples
  const vocab = buildLocationVocab(data)
  const trainSamples = prepareSamples(trainData, vocab)
  const valSamples = prepareSamples(valData, vocab)
  const testSamples = prepareSamples(testData, vocab)

  // 3. Normalize (fit on train only)
  const normStats = computeNormStats(trainSamples)
  console.log(`  Normalization stats computed from training set`)
  normalizeSamples(trainSamples, normStats)
  normalizeSamples(valSamples, normStats)
  normalizeSamples(testSamples, normStats)

  // 4. Init weights
  const rng = mulberry32(CONFIG.seed)
  const inputDim = CONFIG.embeddingDim + FEATURE_NAMES.length
  const weights = initWeights(
    vocab.size,
    CONFIG.embeddingDim,
    inputDim,
    CONFIG.hiddenLayers,
    4,
    rng,
  )
  console.log(`  Network: input=${inputDim} → [${CONFIG.hiddenLayers.join(', ')}] → 4 heads`)

  // 5. Train
  const bestWeights = train(weights, trainSamples, valSamples, CONFIG)

  // 6. Threshold tuning
  const thresholds = tuneThresholds(bestWeights, valSamples)

  // 7. Evaluate on test set
  console.log('\n── Test Set Evaluation ──')
  const defaultEval = evaluateWithThresholds(bestWeights, testSamples, [0.5, 0.5, 0.5, 0.5])
  console.log('\n  Standard mode (threshold=0.5):')
  console.log(`    Overall Accuracy: ${(defaultEval.overall.accuracy * 100).toFixed(2)}%`)
  console.log(`    Overall Macro F1: ${(defaultEval.overall.macroF1 * 100).toFixed(2)}%`)
  for (let h = 0; h < 4; h++) {
    const m = defaultEval.perSlot[h]
    console.log(`    ${SLOT_NAMES[h].padEnd(10)}: Acc=${(m.accuracy * 100).toFixed(1)}% F1=${(m.f1 * 100).toFixed(1)}% P=${(m.precision * 100).toFixed(1)}% R=${(m.recall * 100).toFixed(1)}%`)
  }

  const tunedEval = evaluateWithThresholds(bestWeights, testSamples, thresholds)
  console.log(`\n  Sensitive mode (thresholds=[${thresholds.map(t => t.toFixed(2)).join(', ')}]):`)
  console.log(`    Overall Accuracy: ${(tunedEval.overall.accuracy * 100).toFixed(2)}%`)
  console.log(`    Overall Macro F1: ${(tunedEval.overall.macroF1 * 100).toFixed(2)}%`)
  for (let h = 0; h < 4; h++) {
    const m = tunedEval.perSlot[h]
    console.log(`    ${SLOT_NAMES[h].padEnd(10)}: Acc=${(m.accuracy * 100).toFixed(1)}% F1=${(m.f1 * 100).toFixed(1)}% P=${(m.precision * 100).toFixed(1)}% R=${(m.recall * 100).toFixed(1)}%`)
  }

  // 8. Export
  console.log('\n── Exporting Model ──')
  exportModel(bestWeights, vocab, normStats, thresholds)

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(' Training complete!')
  console.log('═══════════════════════════════════════════════════════════')
}

main()
