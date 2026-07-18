/**
 * AI Upscaler — Inference Runner
 *
 * Manages the LiteRT.js lifecycle and per-tile model execution.
 *
 * Lifecycle:
 *   1. loadLiteRt(WASM_CDN)     — downloads + compiles WASM runtime (~9 MB, once)
 *   2. loadAndCompile(modelUrl) — downloads model + compiles for WebGPU (or WASM)
 *   3. runTile(model, data)     — Float32 [1,128,128,3] → Float32 [1,3,512,512]
 *
 * Singleton pattern: model is cached in module scope across component
 * mount/unmount cycles.
 *
 * Acceleration strategy:
 *   - Try WebGPU first (model is 100% GPU-resident, zero fallback ops)
 *   - On failure, fall back to WASM+XNNPack (slower but always works)
 */

import {
  loadLiteRt,
  getGlobalLiteRtPromise,
  loadAndCompile,
  Tensor,
} from '@litertjs/core'
import type { CompiledModel } from '@litertjs/core'
import { LITERT_WASM_CDN, MODEL_URL, AI_LIMITS } from '../types'

// ── Module-level singletons ───────────────────────────────────────────

let cachedModel: CompiledModel | null = null
let cachedAccelerated: boolean = false

// ── LiteRT runtime init ───────────────────────────────────────────────

async function ensureRuntimeLoaded(): Promise<void> {
  // If already loading or loaded, just await that promise
  const existing = getGlobalLiteRtPromise()
  if (existing) {
    await existing
    return
  }
  await loadLiteRt(LITERT_WASM_CDN)
}

// ── Model load + compile ──────────────────────────────────────────────

export interface LoadModelResult {
  model: CompiledModel
  /** True = running on WebGPU; false = WASM CPU fallback */
  accelerated: boolean
}

/**
 * Load and compile the Real-ESRGAN model.
 * Returns cached model on subsequent calls.
 * Tries WebGPU first; falls back to WASM on failure.
 */
export async function loadModel(): Promise<LoadModelResult> {
  if (cachedModel) {
    return { model: cachedModel, accelerated: cachedAccelerated }
  }

  await ensureRuntimeLoaded()

  let model: CompiledModel
  let accelerated: boolean

  try {
    model = await loadAndCompile(MODEL_URL, { accelerator: 'webgpu' })
    accelerated = true
    console.info('[AI Upscaler] Model compiled — WebGPU')
  } catch (gpuErr) {
    console.warn('[AI Upscaler] WebGPU compile failed, falling back to WASM:', gpuErr)
    try {
      model = await loadAndCompile(MODEL_URL, { accelerator: 'wasm' })
      accelerated = false
      console.info('[AI Upscaler] Model compiled — WASM (CPU)')
    } catch (wasmErr) {
      throw new Error(
        `Failed to compile model on both WebGPU and WASM.\nWebGPU error: ${gpuErr}\nWASM error: ${wasmErr}`,
      )
    }
  }

  cachedModel = model
  cachedAccelerated = accelerated
  return { model, accelerated }
}

// ── Per-tile inference ────────────────────────────────────────────────

const { tileSize, tileOutputSize } = AI_LIMITS

/**
 * Run Real-ESRGAN on a single 128×128 tile.
 *
 * @param model  Compiled LiteRT model
 * @param data   Float32Array NHWC [1, 128, 128, 3] — pixel values 0–1
 * @returns      Float32Array NCHW [1, 3, 512, 512] — pixel values 0–1
 *               Caller is responsible for NCHW → NHWC transpose.
 */
export async function runTile(
  model: CompiledModel,
  data: Float32Array,
): Promise<Float32Array> {
  // Input shape: [1, 128, 128, 3] NHWC
  const inputTensor = new Tensor(data, [1, tileSize, tileSize, 3])

  let outputs: Tensor[]
  try {
    outputs = await model.run(inputTensor)
  } finally {
    // Always delete input tensor even if inference throws
    inputTensor.delete()
  }

  // Output shape: [1, 3, 512, 512] NCHW
  const rawData = (await outputs[0].data()) as Float32Array
  outputs[0].delete()

  // Validate expected output size
  const expected = 1 * 3 * tileOutputSize * tileOutputSize
  if (rawData.length !== expected) {
    throw new Error(
      `Unexpected output tensor size: got ${rawData.length}, expected ${expected}. ` +
      `Model output shape may have changed.`,
    )
  }

  return rawData
}

// ── Cache management ─────────────────────────────────────────────────

/** Clear the cached model (e.g. when navigating away permanently). */
export function clearModelCache(): void {
  if (cachedModel) {
    try { cachedModel.delete() } catch { /* ignore */ }
    cachedModel = null
    cachedAccelerated = false
  }
}
