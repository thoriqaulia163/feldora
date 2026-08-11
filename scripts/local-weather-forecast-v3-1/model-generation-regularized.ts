/**
 * Local Weather Forecast V3.1 + Light Regularization
 *
 * Tests whether V3.1's stagnant performance is caused by mild overfitting.
 * Adds: Dropout (0.10) on hidden layers + L2 weight decay (1e-4)
 *
 * NOT a new version — same architecture, just regularized training.
 *
 * Usage: npx tsx scripts/local-weather-forecast-v3-1/model-generation-regularized.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  // Architecture (identical to V3.1)
  embeddingDim: 16,
  hiddenLayers: [128, 64, 32] as number[],
  activation: 'relu' as const,
  outputActivation: 'sigmoid' as const,

  // Regularization (NEW)
  dropoutRate: 0.10,
  weightDecay: 1e-4,

  // Training
  learningRate: 0.001,
  batchSize: 64,
  maxEpochs: 200,
  earlyStoppingPatience: 20, // slightly more patience for regularized model
  seed: 42,

  // Threshold tuning
  thresholdMin: 0.15,
  thresholdMax: 0.70,
  thresholdStep: 0.025,

  // Paths
  datasetPath: 'public/dataset/local-weather-forecast-v2-5/dataset.json',
  outputDir: 'public/ai-models/local-weather-forecast-v3-1',
  outputFile: 'model.json',
  reportDir: 'scripts/local-weather-forecast-v3-1',
}

const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night'] as const
const RAIN_THRESHOLD = 2

// ─── Types ──────────────────────────────────────────────────────────────────

interface DataRow {
  date: string; year: number; dayOfYear: number; city: string; province: string
  latitude: number; longitude: number; elevation: number; monsoonZone: number
  localSeasonIndex: number; enso: number; iod: number
  morning: number; afternoon: number; evening: number; night: number
  prevDayRainSlots: number
}
interface PreparedSample { locationIdx: number; numericFeatures: number[]; targets: number[] }
interface NormStats { mean: number[]; std: number[] }
interface EpochLog { epoch: number; trainLoss: number; valLoss: number; valMacroF1: number }

// ─── PRNG ───────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// ─── Dataset ────────────────────────────────────────────────────────────────

function loadDataset(): DataRow[] {
  const path = resolve(process.cwd(), CONFIG.datasetPath)
  console.log(`Loading dataset from ${path}...`)
  const data: DataRow[] = JSON.parse(readFileSync(path, 'utf-8'))
  console.log(`  Loaded ${data.length} rows`)
  return data
}

function buildLocationVocab(data: DataRow[]): Map<string, number> {
  const cities = [...new Set(data.map(r => r.city))].sort()
  const vocab = new Map<string, number>()
  cities.forEach((c, i) => vocab.set(c, i))
  console.log(`  Location vocab: ${vocab.size} cities`)
  return vocab
}

function buildNumericFeatures(row: DataRow): number[] {
  const sinDay = Math.sin((2 * Math.PI * row.dayOfYear) / 365)
  const cosDay = Math.cos((2 * Math.PI * row.dayOfYear) / 365)
  const month = parseInt(row.date.split('-')[1], 10)
  const sinMonth = Math.sin((2 * Math.PI * month) / 12)
  const cosMonth = Math.cos((2 * Math.PI * month) / 12)
  const latRad = row.latitude * Math.PI / 180
  const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (row.dayOfYear - 81)) * Math.PI / 180
  const cosHA = -Math.tan(latRad) * Math.tan(decl)
  let dayLen: number
  if (cosHA > 1) dayLen = 0; else if (cosHA < -1) dayLen = 24
  else dayLen = (2 * Math.acos(cosHA) * 180 / Math.PI) / 15
  const prevDayRain = row.prevDayRainSlots >= 1 ? 1 : 0
  return [row.dayOfYear, row.latitude, row.longitude, row.elevation, row.monsoonZone, row.localSeasonIndex, row.enso, row.iod, prevDayRain, sinDay, cosDay, sinMonth, cosMonth, dayLen]
}

const FEATURE_NAMES = ['dayOfYear','latitude','longitude','elevation','monsoonZone','localSeasonIndex','enso','iod','prevDayRain','sinDay','cosDay','sinMonth','cosMonth','dayLength']

function prepareSamples(data: DataRow[], vocab: Map<string, number>): PreparedSample[] {
  return data.map(row => ({ locationIdx: vocab.get(row.city)!, numericFeatures: buildNumericFeatures(row), targets: [row.morning >= RAIN_THRESHOLD ? 1 : 0, row.afternoon >= RAIN_THRESHOLD ? 1 : 0, row.evening >= RAIN_THRESHOLD ? 1 : 0, row.night >= RAIN_THRESHOLD ? 1 : 0] }))
}

function splitByTime(data: DataRow[]) {
  const train = data.filter(r => r.year <= 2023), val = data.filter(r => r.year === 2024), test = data.filter(r => r.year === 2025)
  console.log(`  Split: train=${train.length}, val=${val.length}, test=${test.length}`)
  return { train, val, test }
}

function computeNormStats(samples: PreparedSample[]): NormStats {
  const n = samples[0].numericFeatures.length
  const mean = new Array(n).fill(0), std = new Array(n).fill(0)
  for (const s of samples) for (let i = 0; i < n; i++) mean[i] += s.numericFeatures[i]
  for (let i = 0; i < n; i++) mean[i] /= samples.length
  for (const s of samples) for (let i = 0; i < n; i++) { const d = s.numericFeatures[i] - mean[i]; std[i] += d * d }
  for (let i = 0; i < n; i++) { std[i] = Math.sqrt(std[i] / samples.length); if (std[i] < 1e-8) std[i] = 1e-8 }
  return { mean, std }
}

function normalizeSamples(samples: PreparedSample[], stats: NormStats): void {
  for (const s of samples) for (let i = 0; i < s.numericFeatures.length; i++)
    s.numericFeatures[i] = (s.numericFeatures[i] - stats.mean[i]) / stats.std[i]
}

// ─── Neural Network (with Dropout support) ──────────────────────────────────

interface NNWeights {
  embedding: number[][]
  layers: { w: number[][]; b: number[] }[]
  heads: { w: number[][]; b: number[] }[]
}

function initWeights(vocabSize: number, embDim: number, inputDim: number, hidden: number[], nHeads: number, rng: () => number): NNWeights {
  const xavier = (fi: number, fo: number) => (rng() * 2 - 1) * Math.sqrt(6 / (fi + fo))
  const embedding = Array.from({ length: vocabSize }, () => Array.from({ length: embDim }, () => xavier(vocabSize, embDim)))
  const layers: { w: number[][]; b: number[] }[] = []
  let prev = inputDim
  for (const size of hidden) {
    layers.push({ w: Array.from({ length: size }, () => Array.from({ length: prev }, () => xavier(prev, size))), b: new Array(size).fill(0) })
    prev = size
  }
  const heads: { w: number[][]; b: number[] }[] = []
  for (let h = 0; h < nHeads; h++) heads.push({ w: [Array.from({ length: prev }, () => xavier(prev, 1))], b: [0] })
  return { embedding, layers, heads }
}

function relu(x: number): number { return x > 0 ? x : 0 }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))) }

/** Forward pass without dropout (for inference/eval) */
function forward(weights: NNWeights, locIdx: number, features: number[]): number[] {
  let input = [...weights.embedding[locIdx], ...features]
  for (const layer of weights.layers) {
    const out = new Array(layer.w.length)
    for (let i = 0; i < layer.w.length; i++) {
      let s = layer.b[i]; const row = layer.w[i]
      for (let j = 0; j < input.length; j++) s += row[j] * input[j]
      out[i] = relu(s)
    }
    input = out
  }
  const preds: number[] = []
  for (const head of weights.heads) {
    let s = head.b[0]; const row = head.w[0]
    for (let j = 0; j < input.length; j++) s += row[j] * input[j]
    preds.push(sigmoid(s))
  }
  return preds
}

// ─── Backprop with Dropout ──────────────────────────────────────────────────

interface Gradients {
  embedding: number[][]
  layers: { dw: number[][]; db: number[] }[]
  heads: { dw: number[][]; db: number[] }[]
}

function zeroGrads(w: NNWeights): Gradients {
  return {
    embedding: w.embedding.map(r => new Array(r.length).fill(0)),
    layers: w.layers.map(l => ({ dw: l.w.map(r => new Array(r.length).fill(0)), db: new Array(l.b.length).fill(0) })),
    heads: w.heads.map(h => ({ dw: h.w.map(r => new Array(r.length).fill(0)), db: new Array(h.b.length).fill(0) })),
  }
}

/**
 * Forward + backward with inverted dropout on hidden layers.
 * Dropout mask is generated per-sample, applied after ReLU.
 * At inference, no dropout is applied (standard inverted dropout scaling).
 */
function backpropWithDropout(
  weights: NNWeights, locIdx: number, features: number[], targets: number[],
  grads: Gradients, dropRate: number, rng: () => number,
): number {
  const emb = weights.embedding[locIdx]
  const allInputs: number[][] = []
  const allPre: number[][] = []
  const dropMasks: number[][] = []
  let input = [...emb, ...features]
  allInputs.push(input)

  const scale = 1 / (1 - dropRate)

  for (const layer of weights.layers) {
    const pre: number[] = [], out: number[] = []
    for (let i = 0; i < layer.w.length; i++) {
      let s = layer.b[i]; for (let j = 0; j < input.length; j++) s += layer.w[i][j] * input[j]
      pre.push(s)
      const activated = relu(s)
      out.push(activated)
    }
    // Apply inverted dropout
    const mask: number[] = new Array(out.length)
    for (let i = 0; i < out.length; i++) {
      mask[i] = rng() >= dropRate ? scale : 0
      out[i] *= mask[i]
    }
    dropMasks.push(mask)
    allPre.push(pre)
    input = out
    allInputs.push(input)
  }

  const preds: number[] = []
  for (const head of weights.heads) {
    let s = head.b[0]; for (let j = 0; j < input.length; j++) s += head.w[0][j] * input[j]
    preds.push(sigmoid(s))
  }

  // Loss (BCE)
  let loss = 0
  for (let h = 0; h < 4; h++) {
    const p = Math.max(1e-7, Math.min(1 - 1e-7, preds[h]))
    loss -= targets[h] * Math.log(p) + (1 - targets[h]) * Math.log(1 - p)
  }

  // Backward from heads
  const lastInput = allInputs[allInputs.length - 1]
  let dH = new Array(lastInput.length).fill(0)
  for (let h = 0; h < 4; h++) {
    const dOut = preds[h] - targets[h]
    for (let j = 0; j < lastInput.length; j++) { grads.heads[h].dw[0][j] += dOut * lastInput[j]; dH[j] += dOut * weights.heads[h].w[0][j] }
    grads.heads[h].db[0] += dOut
  }

  // Backward through hidden layers (with dropout mask)
  for (let l = weights.layers.length - 1; l >= 0; l--) {
    const inp = allInputs[l], pre = allPre[l], layer = weights.layers[l], mask = dropMasks[l]
    const dNext = new Array(inp.length).fill(0)
    for (let i = 0; i < layer.w.length; i++) {
      // Gradient through dropout mask: dH[i] is already post-dropout; multiply by mask for ReLU grad
      const dr = (pre[i] > 0 && mask[i] !== 0) ? dH[i] : 0
      grads.layers[l].db[i] += dr
      for (let j = 0; j < inp.length; j++) { grads.layers[l].dw[i][j] += dr * inp[j]; dNext[j] += dr * layer.w[i][j] }
    }
    dH = dNext
  }

  for (let j = 0; j < emb.length; j++) grads.embedding[locIdx][j] += dH[j]
  return loss
}

// ─── Adam with Weight Decay (AdamW) ─────────────────────────────────────────

interface AdamState {
  mE: number[][]; vE: number[][]
  mL: { mw: number[][]; mb: number[] }[]; vL: { vw: number[][]; vb: number[] }[]
  mH: { mw: number[][]; mb: number[] }[]; vH: { vw: number[][]; vb: number[] }[]
  t: number
}

function initAdam(w: NNWeights): AdamState {
  return {
    mE: w.embedding.map(r => new Array(r.length).fill(0)), vE: w.embedding.map(r => new Array(r.length).fill(0)),
    mL: w.layers.map(l => ({ mw: l.w.map(r => new Array(r.length).fill(0)), mb: new Array(l.b.length).fill(0) })),
    vL: w.layers.map(l => ({ vw: l.w.map(r => new Array(r.length).fill(0)), vb: new Array(l.b.length).fill(0) })),
    mH: w.heads.map(h => ({ mw: h.w.map(r => new Array(r.length).fill(0)), mb: new Array(h.b.length).fill(0) })),
    vH: w.heads.map(h => ({ vw: h.w.map(r => new Array(r.length).fill(0)), vb: new Array(h.b.length).fill(0) })),
    t: 0,
  }
}

function adamWStep(w: NNWeights, g: Gradients, st: AdamState, lr: number, bs: number, wd: number): void {
  const b1 = 0.9, b2 = 0.999, eps = 1e-8
  st.t++
  const bc1 = 1 - Math.pow(b1, st.t), bc2 = 1 - Math.pow(b2, st.t)

  // AdamW: weight decay applied directly to weights (decoupled from gradient)
  const upd = (p: number, grad: number, m: number, v: number, applyDecay: boolean): [number, number, number] => {
    const g2 = grad / bs
    const nm = b1 * m + (1 - b1) * g2
    const nv = b2 * v + (1 - b2) * g2 * g2
    const mHat = nm / bc1, vHat = nv / bc2
    let newP = p - lr * mHat / (Math.sqrt(vHat) + eps)
    if (applyDecay) newP -= lr * wd * p  // decoupled weight decay
    return [newP, nm, nv]
  }

  // Embedding (no weight decay on embeddings — they are lookup, not dense)
  for (let i = 0; i < w.embedding.length; i++)
    for (let j = 0; j < w.embedding[i].length; j++) {
      if (g.embedding[i][j] === 0) continue
      const [p, m, v] = upd(w.embedding[i][j], g.embedding[i][j], st.mE[i][j], st.vE[i][j], false)
      w.embedding[i][j] = p; st.mE[i][j] = m; st.vE[i][j] = v
    }

  // Layers (weight decay on weights, not biases)
  for (let l = 0; l < w.layers.length; l++) {
    for (let i = 0; i < w.layers[l].w.length; i++) {
      for (let j = 0; j < w.layers[l].w[i].length; j++) {
        const [p, m, v] = upd(w.layers[l].w[i][j], g.layers[l].dw[i][j], st.mL[l].mw[i][j], st.vL[l].vw[i][j], true)
        w.layers[l].w[i][j] = p; st.mL[l].mw[i][j] = m; st.vL[l].vw[i][j] = v
      }
      // Biases: no weight decay
      const [pb, mb, vb] = upd(w.layers[l].b[i], g.layers[l].db[i], st.mL[l].mb[i], st.vL[l].vb[i], false)
      w.layers[l].b[i] = pb; st.mL[l].mb[i] = mb; st.vL[l].vb[i] = vb
    }
  }

  // Heads (weight decay on weights, not biases)
  for (let h = 0; h < w.heads.length; h++) {
    for (let j = 0; j < w.heads[h].w[0].length; j++) {
      const [p, m, v] = upd(w.heads[h].w[0][j], g.heads[h].dw[0][j], st.mH[h].mw[0][j], st.vH[h].vw[0][j], true)
      w.heads[h].w[0][j] = p; st.mH[h].mw[0][j] = m; st.vH[h].vw[0][j] = v
    }
    const [pb, mb, vb] = upd(w.heads[h].b[0], g.heads[h].db[0], st.mH[h].mb[0], st.vH[h].vb[0], false)
    w.heads[h].b[0] = pb; st.mH[h].mb[0] = mb; st.vH[h].vb[0] = vb
  }
}

// ─── Evaluation ─────────────────────────────────────────────────────────────

interface SlotMetrics { accuracy: number; precision: number; recall: number; f1: number }

function computeMacroF1(weights: NNWeights, samples: PreparedSample[], thresholds: number[]): number {
  const tp = [0,0,0,0], fp = [0,0,0,0], fn = [0,0,0,0], tn = [0,0,0,0]
  for (const s of samples) {
    const p = forward(weights, s.locationIdx, s.numericFeatures)
    for (let h = 0; h < 4; h++) {
      const pred = p[h] >= thresholds[h] ? 1 : 0, act = s.targets[h]
      if (pred === 1 && act === 1) tp[h]++; else if (pred === 1 && act === 0) fp[h]++
      else if (pred === 0 && act === 1) fn[h]++; else tn[h]++
    }
  }
  let sum = 0
  for (let h = 0; h < 4; h++) {
    const p1 = tp[h]+fp[h]>0?tp[h]/(tp[h]+fp[h]):0, r1 = tp[h]+fn[h]>0?tp[h]/(tp[h]+fn[h]):0
    const f1_1 = p1+r1>0?2*p1*r1/(p1+r1):0
    const p0 = tn[h]+fn[h]>0?tn[h]/(tn[h]+fn[h]):0, r0 = tn[h]+fp[h]>0?tn[h]/(tn[h]+fp[h]):0
    const f1_0 = p0+r0>0?2*p0*r0/(p0+r0):0
    sum += (f1_1+f1_0)/2
  }
  return sum / 4
}

function evaluateWithThresholds(weights: NNWeights, samples: PreparedSample[], thresholds: number[]) {
  const tp = [0,0,0,0], fp = [0,0,0,0], fn = [0,0,0,0], tn = [0,0,0,0]
  for (const s of samples) {
    const p = forward(weights, s.locationIdx, s.numericFeatures)
    for (let h = 0; h < 4; h++) {
      const pred = p[h] >= thresholds[h] ? 1 : 0, act = s.targets[h]
      if (pred === 1 && act === 1) tp[h]++; else if (pred === 1 && act === 0) fp[h]++
      else if (pred === 0 && act === 1) fn[h]++; else tn[h]++
    }
  }
  const perSlot: SlotMetrics[] = []; let totC = 0, totN = 0, macroSum = 0
  for (let h = 0; h < 4; h++) {
    const acc = (tp[h]+tn[h])/(tp[h]+fp[h]+fn[h]+tn[h])
    const prec = tp[h]+fp[h]>0?tp[h]/(tp[h]+fp[h]):0, rec = tp[h]+fn[h]>0?tp[h]/(tp[h]+fn[h]):0
    const f1_1 = prec+rec>0?2*prec*rec/(prec+rec):0
    const p0 = tn[h]+fn[h]>0?tn[h]/(tn[h]+fn[h]):0, r0 = tn[h]+fp[h]>0?tn[h]/(tn[h]+fp[h]):0
    const f1_0 = p0+r0>0?2*p0*r0/(p0+r0):0
    const slotF1 = (f1_1+f1_0)/2
    perSlot.push({ accuracy: acc, precision: prec, recall: rec, f1: slotF1 })
    totC += tp[h]+tn[h]; totN += tp[h]+fp[h]+fn[h]+tn[h]; macroSum += slotF1
  }
  return { overall: { accuracy: totC/totN, macroF1: macroSum/4 }, perSlot }
}

function evaluateLoss(weights: NNWeights, samples: PreparedSample[]): number {
  let total = 0
  for (const s of samples) {
    const p = forward(weights, s.locationIdx, s.numericFeatures)
    for (let h = 0; h < 4; h++) { const pr = Math.max(1e-7, Math.min(1-1e-7, p[h])); total -= s.targets[h]*Math.log(pr) + (1-s.targets[h])*Math.log(1-pr) }
  }
  return total / samples.length
}

// ─── Training ───────────────────────────────────────────────────────────────

function shuffleIndices(n: number, rng: () => number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]] }
  return idx
}

function train(weights: NNWeights, trainS: PreparedSample[], valS: PreparedSample[]): { best: NNWeights; history: EpochLog[] } {
  const rng = mulberry32(CONFIG.seed + 1000)
  const dropRng = mulberry32(CONFIG.seed + 5000) // separate RNG for dropout
  const adam = initAdam(weights)
  let bestValLoss = Infinity, bestW = '', patience = 0
  const history: EpochLog[] = []

  console.log('\n── Training (with regularization) ──')
  console.log(`  Architecture: emb=${CONFIG.embeddingDim}, hidden=[${CONFIG.hiddenLayers}]`)
  console.log(`  Dropout: ${CONFIG.dropoutRate}, Weight decay: ${CONFIG.weightDecay}`)
  console.log(`  Epochs: max ${CONFIG.maxEpochs}, patience: ${CONFIG.earlyStoppingPatience}`)
  console.log(`  Batch: ${CONFIG.batchSize}, LR: ${CONFIG.learningRate}`)
  console.log(`  Train: ${trainS.length}, Val: ${valS.length}\n`)

  for (let epoch = 1; epoch <= CONFIG.maxEpochs; epoch++) {
    const indices = shuffleIndices(trainS.length, rng)
    let epochLoss = 0
    for (let b = 0; b < trainS.length; b += CONFIG.batchSize) {
      const end = Math.min(b + CONFIG.batchSize, trainS.length)
      const grads = zeroGrads(weights)
      for (let i = b; i < end; i++) {
        const s = trainS[indices[i]]
        epochLoss += backpropWithDropout(weights, s.locationIdx, s.numericFeatures, s.targets, grads, CONFIG.dropoutRate, dropRng)
      }
      adamWStep(weights, grads, adam, CONFIG.learningRate, end - b, CONFIG.weightDecay)
    }
    const trainLoss = epochLoss / trainS.length
    const valLoss = evaluateLoss(weights, valS)
    const valF1 = computeMacroF1(weights, valS, [0.5, 0.5, 0.5, 0.5])
    history.push({ epoch, trainLoss, valLoss, valMacroF1: valF1 })

    if (epoch % 5 === 0 || epoch === 1)
      console.log(`  Epoch ${epoch.toString().padStart(3)}: train=${trainLoss.toFixed(4)} val=${valLoss.toFixed(4)} valF1=${(valF1*100).toFixed(1)}%`)

    if (valLoss < bestValLoss) { bestValLoss = valLoss; bestW = JSON.stringify(weights); patience = 0 }
    else { patience++; if (patience >= CONFIG.earlyStoppingPatience) { console.log(`\n  Early stop @ epoch ${epoch} (best val_loss=${bestValLoss.toFixed(4)})`); break } }
  }
  console.log(`  Best val loss: ${bestValLoss.toFixed(4)}`)
  return { best: JSON.parse(bestW), history }
}

// ─── Threshold Tuning ───────────────────────────────────────────────────────

function tuneThresholds(weights: NNWeights, valS: PreparedSample[]): number[] {
  console.log('\n── Threshold Tuning (Validation only) ──')
  const allPreds = valS.map(s => forward(weights, s.locationIdx, s.numericFeatures))
  const best = [0.5, 0.5, 0.5, 0.5]
  for (let h = 0; h < 4; h++) {
    let bestF1 = -1
    for (let t = CONFIG.thresholdMin; t <= CONFIG.thresholdMax + 0.001; t += CONFIG.thresholdStep) {
      let tp = 0, fp = 0, fn = 0, tn = 0
      for (let i = 0; i < valS.length; i++) {
        const pred = allPreds[i][h] >= t ? 1 : 0, act = valS[i].targets[h]
        if (pred === 1 && act === 1) tp++; else if (pred === 1 && act === 0) fp++
        else if (pred === 0 && act === 1) fn++; else tn++
      }
      const p1 = tp+fp>0?tp/(tp+fp):0, r1 = tp+fn>0?tp/(tp+fn):0, f1_1 = p1+r1>0?2*p1*r1/(p1+r1):0
      const p0 = tn+fn>0?tn/(tn+fn):0, r0 = tn+fp>0?tn/(tn+fp):0, f1_0 = p0+r0>0?2*p0*r0/(p0+r0):0
      const mf1 = (f1_1+f1_0)/2
      if (mf1 > bestF1) { bestF1 = mf1; best[h] = Math.round(t * 1000) / 1000 }
    }
    console.log(`  ${SLOT_NAMES[h].padEnd(10)}: threshold=${best[h].toFixed(3)} → F1=${bestF1.toFixed(4)}`)
  }
  return best
}

// ─── Export ─────────────────────────────────────────────────────────────────

function exportModel(weights: NNWeights, vocab: Map<string, number>, normStats: NormStats, thresholds: number[], history: EpochLog[], trainSize: number, valSize: number, testSize: number): void {
  const outputDir = resolve(process.cwd(), CONFIG.outputDir)
  mkdirSync(outputDir, { recursive: true })
  const locationVocab: string[] = new Array(vocab.size)
  vocab.forEach((idx, city) => { locationVocab[idx] = city })

  const artifact = {
    version: '3.1',
    type: 'nn' as const,
    architecture: 'shared-mlp',
    config: { embeddingDim: CONFIG.embeddingDim, hiddenLayers: CONFIG.hiddenLayers, activation: CONFIG.activation, outputActivation: CONFIG.outputActivation, numericFeatureCount: FEATURE_NAMES.length },
    featureNames: FEATURE_NAMES,
    slotNames: [...SLOT_NAMES],
    categoryNames: ['Tidak Hujan', 'Hujan'],
    locationVocab,
    normalization: { mean: normStats.mean.map(v => Math.round(v*1e6)/1e6), std: normStats.std.map(v => Math.round(v*1e6)/1e6) },
    thresholds,
    weights: {
      embedding: weights.embedding.map(r => r.map(v => Math.round(v*1e6)/1e6)),
      layers: weights.layers.map(l => ({ w: l.w.map(r => r.map(v => Math.round(v*1e6)/1e6)), b: l.b.map(v => Math.round(v*1e6)/1e6) })),
      heads: weights.heads.map(h => ({ w: h.w.map(r => r.map(v => Math.round(v*1e6)/1e6)), b: h.b.map(v => Math.round(v*1e6)/1e6) })),
    },
    metadata: { trainedAt: new Date().toISOString(), seed: CONFIG.seed, learningRate: CONFIG.learningRate, batchSize: CONFIG.batchSize, dropout: CONFIG.dropoutRate, weightDecay: CONFIG.weightDecay, datasetSize: trainSize+valSize+testSize, trainSize, valSize, testSize },
  }

  const outputPath = resolve(outputDir, CONFIG.outputFile)
  writeFileSync(outputPath, JSON.stringify(artifact))
  const size = readFileSync(outputPath).length
  console.log(`\n  Model exported: ${outputPath}`)
  console.log(`  Model size: ${(size / 1024).toFixed(1)} KB`)

  const curvePath = resolve(process.cwd(), CONFIG.reportDir, 'learning-curves-regularized.json')
  writeFileSync(curvePath, JSON.stringify(history, null, 2))
  console.log(`  Learning curves: ${curvePath}`)
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' V3.1 + Light Regularization (Dropout + Weight Decay)')
  console.log('═══════════════════════════════════════════════════════════\n')

  const data = loadDataset()
  const { train: trainData, val: valData, test: testData } = splitByTime(data)
  const vocab = buildLocationVocab(data)

  const trainSamples = prepareSamples(trainData, vocab)
  const valSamples = prepareSamples(valData, vocab)
  const testSamples = prepareSamples(testData, vocab)

  const normStats = computeNormStats(trainSamples)
  console.log(`  Normalization: fit on training set`)
  normalizeSamples(trainSamples, normStats)
  normalizeSamples(valSamples, normStats)
  normalizeSamples(testSamples, normStats)

  const rng = mulberry32(CONFIG.seed)
  const inputDim = CONFIG.embeddingDim + FEATURE_NAMES.length
  const weights = initWeights(vocab.size, CONFIG.embeddingDim, inputDim, CONFIG.hiddenLayers, 4, rng)
  console.log(`  Network: input=${inputDim} → [${CONFIG.hiddenLayers}] → 4 heads`)

  const { best, history } = train(weights, trainSamples, valSamples)
  const thresholds = tuneThresholds(best, valSamples)

  // Final evaluation
  console.log('\n── Test Set Evaluation (2025) ──')
  const stdEval = evaluateWithThresholds(best, testSamples, [0.5, 0.5, 0.5, 0.5])
  console.log('\n  Standard (t=0.5):')
  console.log(`    Accuracy: ${(stdEval.overall.accuracy*100).toFixed(2)}%  Macro F1: ${(stdEval.overall.macroF1*100).toFixed(2)}%`)
  for (let h = 0; h < 4; h++) { const m = stdEval.perSlot[h]; console.log(`    ${SLOT_NAMES[h].padEnd(10)}: Acc=${(m.accuracy*100).toFixed(1)}% F1=${(m.f1*100).toFixed(1)}% P=${(m.precision*100).toFixed(1)}% R=${(m.recall*100).toFixed(1)}%`) }

  const senEval = evaluateWithThresholds(best, testSamples, thresholds)
  console.log(`\n  Sensitive (t=[${thresholds.map(t=>t.toFixed(3)).join(', ')}]):`)
  console.log(`    Accuracy: ${(senEval.overall.accuracy*100).toFixed(2)}%  Macro F1: ${(senEval.overall.macroF1*100).toFixed(2)}%`)
  for (let h = 0; h < 4; h++) { const m = senEval.perSlot[h]; console.log(`    ${SLOT_NAMES[h].padEnd(10)}: Acc=${(m.accuracy*100).toFixed(1)}% F1=${(m.f1*100).toFixed(1)}% P=${(m.precision*100).toFixed(1)}% R=${(m.recall*100).toFixed(1)}%`) }

  // Compare with V3.1 baseline
  console.log('\n── Comparison Summary ──')
  console.log('  V3.1 baseline (Sensitive):  Macro F1 = 64.08%')
  console.log(`  V3.1 + reg    (Sensitive):  Macro F1 = ${(senEval.overall.macroF1*100).toFixed(2)}%`)
  console.log(`  V3   baseline (Sensitive):  Macro F1 = 64.16%`)
  const delta = (senEval.overall.macroF1 * 100) - 64.08
  console.log(`  Delta vs V3.1 baseline:     ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`)

  // Learning curve gap analysis
  const lastEpoch = history[history.length - 1]
  const bestEpoch = history.reduce((a, b) => a.valLoss < b.valLoss ? a : b)
  console.log(`\n  Best epoch: ${bestEpoch.epoch} (val_loss=${bestEpoch.valLoss.toFixed(4)})`)
  console.log(`  Train-val gap at best: ${(bestEpoch.trainLoss - bestEpoch.valLoss).toFixed(4)}`)
  console.log(`  Final epoch: ${lastEpoch.epoch}`)

  exportModel(best, vocab, normStats, thresholds, history, trainSamples.length, valSamples.length, testSamples.length)

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(' Experiment complete!')
  console.log('═══════════════════════════════════════════════════════════')
}

main()
