/**
 * Quick Image Upscaler — Core Types
 */

export type UpscaleFactor = 2 | 4

export type OutputFormat = 'png' | 'jpeg'

export type UpscaleAlgorithm = 'bicubic' | 'lanczos3' | 'fsr1' | 'jinc'

export type UpscalerStatus = 'idle' | 'processing' | 'done' | 'error'

/** Which algorithms require a live WebGPU device */
export const ALGORITHM_NEEDS_WEBGPU: Record<UpscaleAlgorithm, boolean> = {
  bicubic: false,
  lanczos3: true,
  fsr1: true,
  jinc: true,
}

export interface UpscalerParams {
  scale: UpscaleFactor
  algorithm: UpscaleAlgorithm
  /** Post-process sharpening — only active for lanczos3 and fsr1 */
  rcasEnabled: boolean
  /** 0.0 = max sharpening … 1.0 = no sharpening (AMD convention) */
  rcasStrength: number
  outputFormat: OutputFormat
  jpegQuality: number
}

export const DEFAULT_PARAMS: UpscalerParams = {
  scale: 2,
  algorithm: 'lanczos3',  // overridden to 'bicubic' when WebGPU unavailable
  rcasEnabled: true,
  rcasStrength: 0.5,
  outputFormat: 'jpeg',
  jpegQuality: 82,
}

export interface UpscalerState {
  status: UpscalerStatus
  /** Explicit WebGPU availability — user controls algorithm, no silent fallback */
  webGPUAvailable: boolean
  originalBitmap: ImageBitmap | null
  originalName: string
  originalWidth: number
  originalHeight: number
  originalObjectURL: string | null  // for display in slider comparison
  resultObjectURL: string | null
  resultBlob: Blob | null
  errorMessage: string | null
  params: UpscalerParams
  sliderPosition: number            // 0.0 – 1.0
}

/** Max accepted input dimensions / file size */
export const INPUT_LIMITS = {
  maxFileSizeMB: 10,
  maxWidth: 4000,
  maxHeight: 4000,
} as const
