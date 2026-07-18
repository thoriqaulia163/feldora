/**
 * Tiling — Assembler
 *
 * Composites upscaled 512×512 tile results back into a single output image.
 *
 * Critical: Real-ESRGAN x4v3 output tensor is NCHW [1, 3, 512, 512].
 * Must transpose to NHWC [512, 512, 3] before writing to canvas pixels.
 *
 * NCHW → ImageData (RGBA) conversion:
 *   src index: channel * H * W + row * W + col
 *   dst index: (row * W + col) * 4 + channel
 */

import { AI_LIMITS } from '../types'
import type { Tile } from './splitter'

const { tileOutputSize } = AI_LIMITS

/**
 * Creates a blank OffscreenCanvas at output resolution
 * (original dimensions × scale).
 */
export function createOutputCanvas(
  originalWidth: number,
  originalHeight: number,
  scale: number,
): OffscreenCanvas {
  return new OffscreenCanvas(originalWidth * scale, originalHeight * scale)
}

/**
 * Paste a single upscaled tile result onto the output canvas.
 *
 * Reads only the crop region from the 512×512 NCHW output — the overlap
 * border pixels are intentionally discarded to avoid seam artifacts.
 *
 * @param ctx     2d context of the output canvas
 * @param tile    Tile metadata (crop rect + destination)
 * @param ncwData Float32Array from model output — NCHW [1, 3, 512, 512]
 */
export function pasteTile(
  ctx: OffscreenCanvasRenderingContext2D,
  tile: Tile,
  ncwData: Float32Array,
): void {
  const H = tileOutputSize  // 512
  const W = tileOutputSize  // 512

  // Only convert pixels inside the crop rect (skip discarded overlap border)
  const rgba = new Uint8ClampedArray(tile.cropW * tile.cropH * 4)

  for (let r = 0; r < tile.cropH; r++) {
    const srcRow = tile.cropY + r          // row inside the 512-px output
    for (let c = 0; c < tile.cropW; c++) {
      const srcCol = tile.cropX + c        // col inside the 512-px output
      const dstIdx = (r * tile.cropW + c) * 4

      for (let ch = 0; ch < 3; ch++) {
        const srcIdx = ch * H * W + srcRow * W + srcCol
        rgba[dstIdx + ch] = Math.round(Math.min(1, Math.max(0, ncwData[srcIdx])) * 255)
      }
      rgba[dstIdx + 3] = 255  // alpha
    }
  }

  ctx.putImageData(new ImageData(rgba, tile.cropW, tile.cropH), tile.destX, tile.destY)
}

/**
 * Finalise: export the assembled canvas to a Blob.
 */
export async function canvasToBlob(
  canvas: OffscreenCanvas,
  format: 'png' | 'jpeg',
  quality: number,
): Promise<Blob> {
  return canvas.convertToBlob({
    type: format === 'jpeg' ? 'image/jpeg' : 'image/png',
    quality: format === 'jpeg' ? quality / 100 : undefined,
  })
}
