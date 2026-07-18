/**
 * AI Image Upscaler — Core Types
 *
 * Model: Real-ESRGAN General x4v3 (LiteRT/TFLite, 4.1 MB, FP16)
 * Input:  [1, 128, 128, 3] NHWC, RGB, 0–1
 * Output: [1, 3, 512, 512] NCHW, RGB, 0–1  ← channels-first, needs transpose
 */

export type AIUpscalerStatus =
  | 'checking'         // checking SW cache on mount — before user sees anything
  | 'needs-download'   // model not cached — waiting for user consent
  | 'idle'
  | 'loading-model'   // user consented or model was cached — downloading/compiling
  | 'processing'      // per-tile inference
  | 'assembling'      // compositing tiles onto output canvas
  | 'done'
  | 'error'

export type OutputFormat = 'png' | 'jpeg'

export interface AIUpscalerState {
  status: AIUpscalerStatus
  /** True once model has been compiled and is ready for inference */
  modelLoaded: boolean
  /** True if model is running on WebGPU; false = WASM CPU fallback */
  modelAccelerated: boolean | null
  originalBitmap: ImageBitmap | null
  originalName: string
  originalWidth: number
  originalHeight: number
  originalObjectURL: string | null
  resultObjectURL: string | null
  resultBlob: Blob | null
  /** null when not processing; { current, total } during tile inference */
  progress: { current: number; total: number } | null
  errorMessage: string | null
  outputFormat: OutputFormat
  jpegQuality: number    // 60–100
  sliderPosition: number // 0.0–1.0
}

/** Hard limits enforced at upload time */
export const AI_LIMITS = {
  maxFileSizeMB: 8,
  maxWidth: 1500,
  maxHeight: 1500,
  /** Model tile input size (fixed by architecture) */
  tileSize: 128,
  /** Output tile size = tileSize × scale */
  tileOutputSize: 512,
  /** Upscale factor (fixed by model) */
  scale: 4,
} as const

/** LiteRT.js WASM runtime served from jsDelivr CDN (pinned version) */
export const LITERT_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@litertjs/core@2.5.3/wasm/'

/** Model URL served from our own static assets */
export const MODEL_URL = '/ai-models/ai-upscaler/model.tflite'

export const DEFAULT_PARAMS = {
  outputFormat: 'jpeg' as OutputFormat,
  jpegQuality: 85,
} as const
