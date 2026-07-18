/**
 * Bicubic fallback upscaler using Canvas 2D API.
 *
 * Used when WebGPU is unavailable. `imageSmoothingQuality: 'high'`
 * triggers bicubic interpolation in Chrome/Edge/Safari — substantially
 * better than bilinear and fast enough for interactive use.
 */

import type { UpscaleFactor } from '../types'

export function bicubicUpscale(bitmap: ImageBitmap, scale: UpscaleFactor): ImageData {
  const outW = bitmap.width * scale
  const outH = bitmap.height * scale

  const canvas = new OffscreenCanvas(outW, outH)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, outW, outH)

  return ctx.getImageData(0, 0, outW, outH)
}
