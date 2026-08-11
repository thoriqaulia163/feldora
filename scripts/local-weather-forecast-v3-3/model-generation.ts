/**
 * Local Weather Forecast V3.3 — Four Independent Neural Networks
 *
 * Each time slot has its own NN with independent embedding + backbone.
 * Based on V3 architecture ([64, 32, 16], emb=8) per model.
 *
 * Usage: npx tsx scripts/local-weather-forecast-v3-3/model-generation.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG = {
  embeddingDim: 8,
  hiddenLayers: [64, 32, 16] as number[],
  learningRate: 0.001,
  batchSize: 64,
  maxEpochs: 200,
  earlyStoppingPatience: 15,
  seed: 42,
  thresholdMin: 0.15,
  thresholdMax: 0.70,
  thresholdStep: 0.025,
  datasetPath: 'public/dataset/local-weather-forecast-v2-5/dataset.json',
  outputDir: 'public/ai-models/local-weather-forecast-v3-3',
  outputFile: 'model.json',
}

const SLOT_NAMES = ['morning', 'afternoon', 'evening', 'night'] as const
const RAIN_THRESHOLD = 2
const FEATURE_NAMES = ['dayOfYear','latitude','longitude','elevation','monsoonZone','localSeasonIndex','enso','iod','prevDayRain','sinDay','cosDay','sinMonth','cosMonth','dayLength']

// ─── Types ──────────────────────────────────────────────────────────────────

interface DataRow { date: string; year: number; dayOfYear: number; city: string; province: string; latitude: number; longitude: number; elevation: number; monsoonZone: number; localSeasonIndex: number; enso: number; iod: number; morning: number; afternoon: number; evening: number; night: number; prevDayRainSlots: number }
interface Sample { locationIdx: number; numericFeatures: number[]; target: number }
interface NormStats { mean: number[]; std: number[] }

/** Single-output NN weights */
interface SlotNN { embedding: number[][]; layers: { w: number[][]; b: number[] }[]; output: { w: number[]; b: number } }
interface Grads { embedding: number[][]; layers: { dw: number[][]; db: number[] }[]; output: { dw: number[]; db: number } }

// ─── PRNG ───────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// ─── Dataset ────────────────────────────────────────────────────────────────

function loadDataset(): DataRow[] {
  const path = resolve(process.cwd(), CONFIG.datasetPath)
  console.log(`Loading dataset...`)
  const data: DataRow[] = JSON.parse(readFileSync(path, 'utf-8'))
  console.log(`  ${data.length} rows`)
  return data
}

function buildVocab(data: DataRow[]): Map<string, number> {
  const cities = [...new Set(data.map(r => r.city))].sort()
  const v = new Map<string, number>(); cities.forEach((c, i) => v.set(c, i))
  return v
}

function buildFeatures(row: DataRow): number[] {
  const sinDay = Math.sin((2*Math.PI*row.dayOfYear)/365), cosDay = Math.cos((2*Math.PI*row.dayOfYear)/365)
  const month = parseInt(row.date.split('-')[1], 10)
  const sinMonth = Math.sin((2*Math.PI*month)/12), cosMonth = Math.cos((2*Math.PI*month)/12)
  const latRad = row.latitude*Math.PI/180
  const decl = 23.45*Math.sin((2*Math.PI/365)*(row.dayOfYear-81))*Math.PI/180
  const cosHA = -Math.tan(latRad)*Math.tan(decl)
  let dayLen: number; if (cosHA > 1) dayLen = 0; else if (cosHA < -1) dayLen = 24; else dayLen = (2*Math.acos(cosHA)*180/Math.PI)/15
  return [row.dayOfYear, row.latitude, row.longitude, row.elevation, row.monsoonZone, row.localSeasonIndex, row.enso, row.iod, row.prevDayRainSlots >= 1 ? 1 : 0, sinDay, cosDay, sinMonth, cosMonth, dayLen]
}

function makeSamples(data: DataRow[], vocab: Map<string, number>, slotIdx: number): Sample[] {
  const slotKey = SLOT_NAMES[slotIdx]
  return data.map(row => ({ locationIdx: vocab.get(row.city)!, numericFeatures: buildFeatures(row), target: (row as any)[slotKey] >= RAIN_THRESHOLD ? 1 : 0 }))
}

function computeNorm(samples: Sample[]): NormStats {
  const n = samples[0].numericFeatures.length
  const mean = new Array(n).fill(0), std = new Array(n).fill(0)
  for (const s of samples) for (let i = 0; i < n; i++) mean[i] += s.numericFeatures[i]
  for (let i = 0; i < n; i++) mean[i] /= samples.length
  for (const s of samples) for (let i = 0; i < n; i++) { const d = s.numericFeatures[i]-mean[i]; std[i] += d*d }
  for (let i = 0; i < n; i++) { std[i] = Math.sqrt(std[i]/samples.length); if (std[i]<1e-8) std[i]=1e-8 }
  return { mean, std }
}

function normalize(samples: Sample[], stats: NormStats): void {
  for (const s of samples) for (let i = 0; i < s.numericFeatures.length; i++)
    s.numericFeatures[i] = (s.numericFeatures[i] - stats.mean[i]) / stats.std[i]
}

// ─── Single-Slot Neural Network ─────────────────────────────────────────────

function relu(x: number): number { return x > 0 ? x : 0 }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))) }

function initSlotNN(vocabSize: number, embDim: number, inputDim: number, hidden: number[], rng: () => number): SlotNN {
  const xavier = (fi: number, fo: number) => (rng()*2-1)*Math.sqrt(6/(fi+fo))
  const embedding = Array.from({ length: vocabSize }, () => Array.from({ length: embDim }, () => xavier(vocabSize, embDim)))
  const layers: { w: number[][]; b: number[] }[] = []
  let prev = inputDim
  for (const size of hidden) {
    layers.push({ w: Array.from({ length: size }, () => Array.from({ length: prev }, () => xavier(prev, size))), b: new Array(size).fill(0) })
    prev = size
  }
  const output = { w: Array.from({ length: prev }, () => xavier(prev, 1)), b: 0 }
  return { embedding, layers, output }
}

function forwardSlot(nn: SlotNN, locIdx: number, features: number[]): number {
  let input = [...nn.embedding[locIdx], ...features]
  for (const layer of nn.layers) {
    const out = new Array(layer.w.length)
    for (let i = 0; i < layer.w.length; i++) {
      let s = layer.b[i]; const row = layer.w[i]
      for (let j = 0; j < input.length; j++) s += row[j]*input[j]
      out[i] = relu(s)
    }
    input = out
  }
  let s = nn.output.b
  for (let j = 0; j < input.length; j++) s += nn.output.w[j]*input[j]
  return sigmoid(s)
}

function zeroGrads(nn: SlotNN): Grads {
  return {
    embedding: nn.embedding.map(r => new Array(r.length).fill(0)),
    layers: nn.layers.map(l => ({ dw: l.w.map(r => new Array(r.length).fill(0)), db: new Array(l.b.length).fill(0) })),
    output: { dw: new Array(nn.output.w.length).fill(0), db: 0 },
  }
}

function backpropSlot(nn: SlotNN, locIdx: number, features: number[], target: number, grads: Grads): number {
  const emb = nn.embedding[locIdx]
  const allInputs: number[][] = []; const allPre: number[][] = []
  let input = [...emb, ...features]; allInputs.push(input)
  for (const layer of nn.layers) {
    const pre: number[] = [], out: number[] = []
    for (let i = 0; i < layer.w.length; i++) {
      let s = layer.b[i]; for (let j = 0; j < input.length; j++) s += layer.w[i][j]*input[j]
      pre.push(s); out.push(relu(s))
    }
    allPre.push(pre); input = out; allInputs.push(input)
  }
  let s = nn.output.b; for (let j = 0; j < input.length; j++) s += nn.output.w[j]*input[j]
  const pred = sigmoid(s)
  const p = Math.max(1e-7, Math.min(1-1e-7, pred))
  const loss = -(target*Math.log(p) + (1-target)*Math.log(1-p))

  // Backward
  const dOut = pred - target
  const lastInput = allInputs[allInputs.length-1]
  let dH = new Array(lastInput.length).fill(0)
  for (let j = 0; j < lastInput.length; j++) { grads.output.dw[j] += dOut*lastInput[j]; dH[j] += dOut*nn.output.w[j] }
  grads.output.db += dOut

  for (let l = nn.layers.length-1; l >= 0; l--) {
    const inp = allInputs[l], pre = allPre[l], layer = nn.layers[l]
    const dNext = new Array(inp.length).fill(0)
    for (let i = 0; i < layer.w.length; i++) {
      const dr = pre[i] > 0 ? dH[i] : 0
      grads.layers[l].db[i] += dr
      for (let j = 0; j < inp.length; j++) { grads.layers[l].dw[i][j] += dr*inp[j]; dNext[j] += dr*layer.w[i][j] }
    }
    dH = dNext
  }
  for (let j = 0; j < emb.length; j++) grads.embedding[locIdx][j] += dH[j]
  return loss
}

// ─── Adam ───────────────────────────────────────────────────────────────────

interface AdamSt { mE: number[][]; vE: number[][]; mL: {mw:number[][];mb:number[]}[]; vL: {vw:number[][];vb:number[]}[]; mO: number[]; vO: number[]; mOb: number; vOb: number; t: number }

function initAdam(nn: SlotNN): AdamSt {
  return {
    mE: nn.embedding.map(r=>new Array(r.length).fill(0)), vE: nn.embedding.map(r=>new Array(r.length).fill(0)),
    mL: nn.layers.map(l=>({mw:l.w.map(r=>new Array(r.length).fill(0)),mb:new Array(l.b.length).fill(0)})),
    vL: nn.layers.map(l=>({vw:l.w.map(r=>new Array(r.length).fill(0)),vb:new Array(l.b.length).fill(0)})),
    mO: new Array(nn.output.w.length).fill(0), vO: new Array(nn.output.w.length).fill(0),
    mOb: 0, vOb: 0, t: 0,
  }
}

function adamStep(nn: SlotNN, g: Grads, st: AdamSt, lr: number, bs: number): void {
  const b1=0.9, b2=0.999, eps=1e-8; st.t++
  const bc1=1-Math.pow(b1,st.t), bc2=1-Math.pow(b2,st.t)
  const upd = (p:number, grad:number, m:number, v:number): [number,number,number] => {
    const g2=grad/bs; const nm=b1*m+(1-b1)*g2; const nv=b2*v+(1-b2)*g2*g2
    return [p-lr*(nm/bc1)/(Math.sqrt(nv/bc2)+eps), nm, nv]
  }

  for (let i=0;i<nn.embedding.length;i++) for (let j=0;j<nn.embedding[i].length;j++) {
    if (g.embedding[i][j]===0) continue
    const [p,m,v]=upd(nn.embedding[i][j],g.embedding[i][j],st.mE[i][j],st.vE[i][j])
    nn.embedding[i][j]=p; st.mE[i][j]=m; st.vE[i][j]=v
  }
  for (let l=0;l<nn.layers.length;l++) {
    for (let i=0;i<nn.layers[l].w.length;i++) {
      for (let j=0;j<nn.layers[l].w[i].length;j++) { const [p,m,v]=upd(nn.layers[l].w[i][j],g.layers[l].dw[i][j],st.mL[l].mw[i][j],st.vL[l].vw[i][j]); nn.layers[l].w[i][j]=p; st.mL[l].mw[i][j]=m; st.vL[l].vw[i][j]=v }
      const [pb,mb,vb]=upd(nn.layers[l].b[i],g.layers[l].db[i],st.mL[l].mb[i],st.vL[l].vb[i]); nn.layers[l].b[i]=pb; st.mL[l].mb[i]=mb; st.vL[l].vb[i]=vb
    }
  }
  for (let j=0;j<nn.output.w.length;j++) { const [p,m,v]=upd(nn.output.w[j],g.output.dw[j],st.mO[j],st.vO[j]); nn.output.w[j]=p; st.mO[j]=m; st.vO[j]=v }
  const [pb,mb,vb]=upd(nn.output.b,g.output.db,st.mOb,st.vOb); nn.output.b=pb; st.mOb=mb; st.vOb=vb
}

// ─── Training per slot ──────────────────────────────────────────────────────

function shuffle(n: number, rng: () => number): number[] {
  const idx = Array.from({length:n},(_,i)=>i)
  for (let i=n-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]] }
  return idx
}

function trainSlot(slotIdx: number, trainS: Sample[], valS: Sample[]): SlotNN {
  const rng = mulberry32(CONFIG.seed + slotIdx * 100 + 1000)
  const initRng = mulberry32(CONFIG.seed + slotIdx * 100)
  const inputDim = CONFIG.embeddingDim + FEATURE_NAMES.length
  const nn = initSlotNN(287, CONFIG.embeddingDim, inputDim, CONFIG.hiddenLayers, initRng)
  const adam = initAdam(nn)

  let bestLoss = Infinity, bestW = '', patience = 0

  for (let epoch = 1; epoch <= CONFIG.maxEpochs; epoch++) {
    const indices = shuffle(trainS.length, rng)
    let eLoss = 0
    for (let b = 0; b < trainS.length; b += CONFIG.batchSize) {
      const end = Math.min(b+CONFIG.batchSize, trainS.length)
      const grads = zeroGrads(nn)
      for (let i = b; i < end; i++) { const s = trainS[indices[i]]; eLoss += backpropSlot(nn, s.locationIdx, s.numericFeatures, s.target, grads) }
      adamStep(nn, grads, adam, CONFIG.learningRate, end-b)
    }

    // Val loss
    let vLoss = 0
    for (const s of valS) { const p = Math.max(1e-7, Math.min(1-1e-7, forwardSlot(nn, s.locationIdx, s.numericFeatures))); vLoss -= s.target*Math.log(p) + (1-s.target)*Math.log(1-p) }
    vLoss /= valS.length

    if (epoch % 10 === 0 || epoch === 1) {
      const tl = eLoss/trainS.length
      console.log(`    Epoch ${epoch.toString().padStart(3)}: train=${tl.toFixed(4)} val=${vLoss.toFixed(4)}`)
    }

    if (vLoss < bestLoss) { bestLoss = vLoss; bestW = JSON.stringify(nn); patience = 0 }
    else { patience++; if (patience >= CONFIG.earlyStoppingPatience) { console.log(`    Early stop @ epoch ${epoch} (val=${bestLoss.toFixed(4)})`); break } }
  }
  return JSON.parse(bestW)
}

// ─── Threshold tuning per slot ──────────────────────────────────────────────

function tuneSlotThreshold(nn: SlotNN, valS: Sample[]): number {
  const preds = valS.map(s => forwardSlot(nn, s.locationIdx, s.numericFeatures))
  let bestT = 0.5, bestF1 = -1
  for (let t = CONFIG.thresholdMin; t <= CONFIG.thresholdMax+0.001; t += CONFIG.thresholdStep) {
    let tp=0,fp=0,fn=0,tn=0
    for (let i=0;i<valS.length;i++) { const pred=preds[i]>=t?1:0, act=valS[i].target; if(pred===1&&act===1)tp++;else if(pred===1&&act===0)fp++;else if(pred===0&&act===1)fn++;else tn++ }
    const p1=tp+fp>0?tp/(tp+fp):0, r1=tp+fn>0?tp/(tp+fn):0, f1_1=p1+r1>0?2*p1*r1/(p1+r1):0
    const p0=tn+fn>0?tn/(tn+fn):0, r0=tn+fp>0?tn/(tn+fp):0, f1_0=p0+r0>0?2*p0*r0/(p0+r0):0
    const mf1=(f1_1+f1_0)/2
    if (mf1>bestF1) { bestF1=mf1; bestT=Math.round(t*1000)/1000 }
  }
  return bestT
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' Local Weather Forecast V3.3 — Four Independent NNs')
  console.log('═══════════════════════════════════════════════════════════\n')

  const data = loadDataset()
  const trainData = data.filter(r => r.year <= 2023)
  const valData = data.filter(r => r.year === 2024)
  const testData = data.filter(r => r.year === 2025)
  console.log(`  Split: train=${trainData.length}, val=${valData.length}, test=${testData.length}`)
  const vocab = buildVocab(data)
  console.log(`  Vocab: ${vocab.size} cities`)

  // Normalization computed once from training data (shared across all slots)
  const normSamples = makeSamples(trainData, vocab, 0) // features same for all slots
  const normStats = computeNorm(normSamples)
  console.log(`  Normalization: fit on training set\n`)

  const models: SlotNN[] = []
  const thresholds: number[] = []

  for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
    console.log(`── Training: ${SLOT_NAMES[slotIdx]} ──`)
    const trainS = makeSamples(trainData, vocab, slotIdx)
    const valS = makeSamples(valData, vocab, slotIdx)
    normalize(trainS, normStats)
    normalize(valS, normStats)

    const bestNN = trainSlot(slotIdx, trainS, valS)
    models.push(bestNN)

    const t = tuneSlotThreshold(bestNN, valS)
    thresholds.push(t)
    console.log(`  Threshold: ${t.toFixed(3)}\n`)
  }

  // Evaluate on test
  console.log('── Test Set Evaluation (2025) ──')
  const tp=[0,0,0,0], fp=[0,0,0,0], fn=[0,0,0,0], tn=[0,0,0,0]
  const tp5=[0,0,0,0], fp5=[0,0,0,0], fn5=[0,0,0,0], tn5=[0,0,0,0]

  for (let slotIdx=0; slotIdx<4; slotIdx++) {
    const testS = makeSamples(testData, vocab, slotIdx)
    normalize(testS, normStats)
    for (const s of testS) {
      const prob = forwardSlot(models[slotIdx], s.locationIdx, s.numericFeatures)
      const predT = prob >= thresholds[slotIdx] ? 1 : 0
      const pred5 = prob >= 0.5 ? 1 : 0
      if (predT===1&&s.target===1)tp[slotIdx]++;else if(predT===1&&s.target===0)fp[slotIdx]++;else if(predT===0&&s.target===1)fn[slotIdx]++;else tn[slotIdx]++
      if (pred5===1&&s.target===1)tp5[slotIdx]++;else if(pred5===1&&s.target===0)fp5[slotIdx]++;else if(pred5===0&&s.target===1)fn5[slotIdx]++;else tn5[slotIdx]++
    }
  }

  const printMetrics = (label: string, tp: number[], fp: number[], fn: number[], tn: number[], thresholds: number[]) => {
    console.log(`\n  ${label} (t=[${thresholds.map(t=>t.toFixed(3)).join(', ')}]):`)
    let totC=0, totN=0, macroSum=0
    for (let h=0;h<4;h++) {
      const acc=(tp[h]+tn[h])/(tp[h]+fp[h]+fn[h]+tn[h])
      const prec=tp[h]+fp[h]>0?tp[h]/(tp[h]+fp[h]):0, rec=tp[h]+fn[h]>0?tp[h]/(tp[h]+fn[h]):0
      const f1_1=prec+rec>0?2*prec*rec/(prec+rec):0
      const p0=tn[h]+fn[h]>0?tn[h]/(tn[h]+fn[h]):0, r0=tn[h]+fp[h]>0?tn[h]/(tn[h]+fp[h]):0
      const f1_0=p0+r0>0?2*p0*r0/(p0+r0):0
      const slotF1=(f1_1+f1_0)/2
      console.log(`    ${SLOT_NAMES[h].padEnd(10)}: Acc=${(acc*100).toFixed(1)}% F1=${(slotF1*100).toFixed(1)}% P=${(prec*100).toFixed(1)}% R=${(rec*100).toFixed(1)}%`)
      totC+=tp[h]+tn[h]; totN+=tp[h]+fp[h]+fn[h]+tn[h]; macroSum+=slotF1
    }
    console.log(`    Overall:    Acc=${(totC/totN*100).toFixed(2)}%  Macro F1=${(macroSum/4*100).toFixed(2)}%`)
  }

  printMetrics('Standard', tp5, fp5, fn5, tn5, [0.5,0.5,0.5,0.5])
  printMetrics('Sensitive', tp, fp, fn, tn, thresholds)

  // Export
  console.log('\n── Export ──')
  const outputDir = resolve(process.cwd(), CONFIG.outputDir)
  mkdirSync(outputDir, { recursive: true })

  const locationVocab: string[] = new Array(vocab.size)
  vocab.forEach((idx, city) => { locationVocab[idx] = city })

  const round = (v: number) => Math.round(v*1e6)/1e6
  const artifact = {
    version: '3.3',
    type: 'nn-independent',
    architecture: 'independent-mlp',
    config: { embeddingDim: CONFIG.embeddingDim, hiddenLayers: CONFIG.hiddenLayers, activation: 'relu', outputActivation: 'sigmoid', numericFeatureCount: FEATURE_NAMES.length },
    featureNames: FEATURE_NAMES,
    slotNames: [...SLOT_NAMES],
    categoryNames: ['Tidak Hujan', 'Hujan'],
    locationVocab,
    normalization: { mean: normStats.mean.map(round), std: normStats.std.map(round) },
    thresholds,
    models: models.map(nn => ({
      embedding: nn.embedding.map(r => r.map(round)),
      layers: nn.layers.map(l => ({ w: l.w.map(r => r.map(round)), b: l.b.map(round) })),
      output: { w: nn.output.w.map(round), b: round(nn.output.b) },
    })),
    metadata: { trainedAt: new Date().toISOString(), seed: CONFIG.seed, learningRate: CONFIG.learningRate, batchSize: CONFIG.batchSize },
  }

  const outPath = resolve(outputDir, CONFIG.outputFile)
  writeFileSync(outPath, JSON.stringify(artifact))
  const size = readFileSync(outPath).length
  console.log(`  Model: ${outPath}`)
  console.log(`  Size: ${(size/1024).toFixed(1)} KB`)

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(' V3.3 Training complete!')
  console.log('═══════════════════════════════════════════════════════════')
}

main()
