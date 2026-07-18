/**
 * Tiling — Splitter (with overlap)
 *
 * Overlapping tile strategy to eliminate seam artifacts:
 *   - Tiles stride 96px instead of 128px (overlap = 16px on each side)
 *   - Each tile still passes a full 128×128 patch to the model
 *   - The assembler discards the outer 64 output-px border of each tile
 *     and only uses the center "safe" region
 *
 * Why this works: pixels near a tile edge have less context from neighbors,
 * so the model produces lower-quality results there. By overlapping and
 * discarding those low-quality border strips, all *used* pixels come from
 * a region where the model had full 128×128 context.
 *
 * Tile count: ceil(W/96) × ceil(H/96) ≈ 1.78× more tiles than non-overlapping,
 * but seam-free output.
 */

import { AI_LIMITS } from '../types'

const { tileSize, scale } = AI_LIMITS

/** Overlap in input-space pixels (16 × 4 = 64 output pixels discarded per border) */
export const TILE_OVERLAP = 16

/** How far we advance the tile origin between adjacent tiles */
export const TILE_STRIDE = tileSize - 2 * TILE_OVERLAP  // = 96

export interface Tile {
  /** NHWC Float32 data [1, 128, 128, 3], values 0–1 — model input */
  data: Float32Array

  /**
   * Crop rectangle inside the 512×512 model output to actually use.
   * Pixels outside this rect are discarded (overlap border).
   */
  cropX: number   // left edge in output tile (output pixels)
  cropY: number   // top edge
  cropW: number   // width  (≤ 512)
  cropH: number   // height (≤ 512)

  /** Where to composite this crop on the final output canvas */
  destX: number
  destY: number
}

/**
 * Split an ImageBitmap into overlapping 128×128 model-ready tiles.
 */
export function splitIntoTiles(bitmap: ImageBitmap): Tile[] {
  const { width: imgW, height: imgH } = bitmap

  const canvas = new OffscreenCanvas(imgW, imgH)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)

  const cols = Math.ceil(imgW / TILE_STRIDE)
  const rows = Math.ceil(imgH / TILE_STRIDE)
  const tiles: Tile[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Effective (non-overlapping) region in the source image
      const effX = col * TILE_STRIDE
      const effY = row * TILE_STRIDE
      const effEndX = Math.min(imgW, effX + TILE_STRIDE)
      const effEndY = Math.min(imgH, effY + TILE_STRIDE)
      const effectiveW = effEndX - effX
      const effectiveH = effEndY - effY

      // Input tile start — extend left/up by OVERLAP (clamped to 0)
      const inX = Math.max(0, effX - TILE_OVERLAP)
      const inY = Math.max(0, effY - TILE_OVERLAP)
      const inEndX = Math.min(imgW, inX + tileSize)
      const inEndY = Math.min(imgH, inY + tileSize)
      const realW = inEndX - inX
      const realH = inEndY - inY

      // Where in the 128×128 tensor the effective region starts
      const cropXInTile = effX - inX   // 0 for first col, OVERLAP for others
      const cropYInTile = effY - inY

      // Build Float32 NHWC tensor (zeros = padding for edge tiles)
      const data = new Float32Array(tileSize * tileSize * 3)
      const imageData = ctx.getImageData(inX, inY, realW, realH)

      for (let py = 0; py < realH; py++) {
        for (let px = 0; px < realW; px++) {
          const srcIdx = (py * realW + px) * 4
          const dstIdx = (py * tileSize + px) * 3
          data[dstIdx]     = imageData.data[srcIdx]     / 255
          data[dstIdx + 1] = imageData.data[srcIdx + 1] / 255
          data[dstIdx + 2] = imageData.data[srcIdx + 2] / 255
        }
      }

      tiles.push({
        data,
        // Crop in the 512×512 model output
        cropX: cropXInTile * scale,
        cropY: cropYInTile * scale,
        cropW: effectiveW * scale,
        cropH: effectiveH * scale,
        // Destination on the final output canvas
        destX: effX * scale,
        destY: effY * scale,
      })
    }
  }

  return tiles
}

/** Total tile count for progress bar denominator */
export function tileCount(width: number, height: number): number {
  return Math.ceil(width / TILE_STRIDE) * Math.ceil(height / TILE_STRIDE)
}
