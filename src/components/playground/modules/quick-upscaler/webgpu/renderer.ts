/**
 * Quick Upscale — WebGPU Renderer (multi-algorithm)
 *
 * Supported pipelines:
 *   Lanczos3 — 3-pass: L3H → L3V → RCAS (optional)
 *   FSR1     — 2-pass: EASU → RCAS (optional)
 *
 * The renderer is created once and reused. Per-frame textures and buffers
 * are created inside upscale() and destroyed before it returns.
 */

import { EASU_SHADER }      from '../shaders/easu.wgsl'
import { RCAS_SHADER }      from '../shaders/rcas.wgsl'
import { LANCZOS3_H_SHADER } from '../shaders/lanczos3-h.wgsl'
import { LANCZOS3_V_SHADER } from '../shaders/lanczos3-v.wgsl'
import { JINC_SHADER }      from '../shaders/jinc.wgsl'
import type { UpscaleFactor } from '../types'

// ── Shared BGL descriptor (4 bindings used by all upscale passes) ─────
// binding 0 → texture_2d<f32>
// binding 1 → texture_storage_2d<rgba8unorm, write>
// binding 2 → sampler
// binding 3 → uniform buffer
// GPUShaderStage.COMPUTE = 4 (hardcoded to avoid SSR/Node.js reference error)
const COMPUTE = 4

function makeUpscaleBGLDesc(): GPUBindGroupLayoutDescriptor {
  return {
    entries: [
      { binding: 0, visibility: COMPUTE, texture: { sampleType: 'float' } },
      { binding: 1, visibility: COMPUTE, storageTexture: { access: 'write-only', format: 'rgba8unorm' } },
      { binding: 2, visibility: COMPUTE, sampler: { type: 'filtering' } },
      { binding: 3, visibility: COMPUTE, buffer: { type: 'uniform' } },
    ],
  }
}

// RCAS uses textureLoad — no sampler at binding 2
const RCAS_BGL_DESC: GPUBindGroupLayoutDescriptor = {
  entries: [
    { binding: 0, visibility: COMPUTE, texture: { sampleType: 'float' } },
    { binding: 1, visibility: COMPUTE, storageTexture: { access: 'write-only', format: 'rgba8unorm' } },
    { binding: 2, visibility: COMPUTE, buffer: { type: 'uniform' } },
  ],
}

// ── Renderer ───────────────────────────────────────────────────────────

interface RendererResources {
  device:       GPUDevice
  sampler:      GPUSampler
  l3hPipeline:  GPUComputePipeline
  l3vPipeline:  GPUComputePipeline
  easuPipeline: GPUComputePipeline
  jincPipeline: GPUComputePipeline
  rcasPipeline: GPUComputePipeline
  upscaleBGL:   GPUBindGroupLayout
  rcasBGL:      GPUBindGroupLayout
}

export class FSR1Renderer {
  private readonly device: GPUDevice
  private readonly sampler: GPUSampler
  private readonly l3hPipeline:  GPUComputePipeline
  private readonly l3vPipeline:  GPUComputePipeline
  private readonly easuPipeline: GPUComputePipeline
  private readonly jincPipeline: GPUComputePipeline
  private readonly rcasPipeline: GPUComputePipeline
  private readonly upscaleBGL: GPUBindGroupLayout
  private readonly rcasBGL:    GPUBindGroupLayout

  private constructor(r: RendererResources) {
    this.device       = r.device
    this.sampler      = r.sampler
    this.l3hPipeline  = r.l3hPipeline
    this.l3vPipeline  = r.l3vPipeline
    this.easuPipeline = r.easuPipeline
    this.jincPipeline = r.jincPipeline
    this.rcasPipeline = r.rcasPipeline
    this.upscaleBGL   = r.upscaleBGL
    this.rcasBGL      = r.rcasBGL
  }

  static async create(): Promise<FSR1Renderer | null> {
    try {
      if (!('gpu' in navigator)) return null
      const adapter = await (navigator.gpu as GPU).requestAdapter({ powerPreference: 'high-performance' })
      if (!adapter) return null
      const device = await adapter.requestDevice()

      // Compile all shaders
      const l3hMod  = device.createShaderModule({ code: LANCZOS3_H_SHADER, label: 'L3H' })
      const l3vMod  = device.createShaderModule({ code: LANCZOS3_V_SHADER, label: 'L3V' })
      const easuMod = device.createShaderModule({ code: EASU_SHADER, label: 'EASU' })
      const jincMod = device.createShaderModule({ code: JINC_SHADER, label: 'Jinc' })
      const rcasMod = device.createShaderModule({ code: RCAS_SHADER, label: 'RCAS' })

      // Validate compilation
      const infos = await Promise.all([
        l3hMod.getCompilationInfo(),
        l3vMod.getCompilationInfo(),
        easuMod.getCompilationInfo(),
        jincMod.getCompilationInfo(),
        rcasMod.getCompilationInfo(),
      ])
      for (const info of infos) {
        for (const msg of info.messages) {
          if (msg.type === 'error') {
            console.error('[QuickUpscaler] Shader error:', msg.message)
            device.destroy()
            return null
          }
        }
      }

      const upscaleBGL = device.createBindGroupLayout(makeUpscaleBGLDesc())
      const rcasBGL    = device.createBindGroupLayout(RCAS_BGL_DESC)
      const upscaleLayout = device.createPipelineLayout({ bindGroupLayouts: [upscaleBGL] })
      const rcasLayout    = device.createPipelineLayout({ bindGroupLayouts: [rcasBGL] })

      const l3hPipeline  = device.createComputePipeline({ label: 'L3H',  layout: upscaleLayout, compute: { module: l3hMod,  entryPoint: 'main' } })
      const l3vPipeline  = device.createComputePipeline({ label: 'L3V',  layout: upscaleLayout, compute: { module: l3vMod,  entryPoint: 'main' } })
      const easuPipeline = device.createComputePipeline({ label: 'EASU', layout: upscaleLayout, compute: { module: easuMod, entryPoint: 'main' } })
      const jincPipeline = device.createComputePipeline({ label: 'Jinc', layout: upscaleLayout, compute: { module: jincMod, entryPoint: 'main' } })
      const rcasPipeline = device.createComputePipeline({ label: 'RCAS', layout: rcasLayout,    compute: { module: rcasMod, entryPoint: 'main' } })

      const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      })

      return new FSR1Renderer({ device, sampler, l3hPipeline, l3vPipeline, easuPipeline, jincPipeline, rcasPipeline, upscaleBGL, rcasBGL })
    } catch {
      return null
    }
  }

  // ── Public API ────────────────────────────────────────────────────

  async upscaleLanczos3(bitmap: ImageBitmap, scale: UpscaleFactor, rcasEnabled: boolean, rcasStrength: number): Promise<ImageData> {
    return this._runLanczos3(bitmap, scale, rcasEnabled, rcasStrength)
  }

  async upscaleFSR1(bitmap: ImageBitmap, scale: UpscaleFactor, rcasEnabled: boolean, rcasStrength: number): Promise<ImageData> {
    return this._runFSR1(bitmap, scale, rcasEnabled, rcasStrength)
  }

  async upscaleJinc(bitmap: ImageBitmap, scale: UpscaleFactor, rcasEnabled: boolean, rcasStrength: number): Promise<ImageData> {
    return this._runJinc(bitmap, scale, rcasEnabled, rcasStrength)
  }

  destroy(): void {
    this.device.destroy()
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private _buf(data: Float32Array): GPUBuffer {
    const buf = this.device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    this.device.queue.writeBuffer(buf, 0, data.buffer as ArrayBuffer, data.byteOffset, data.byteLength)
    return buf
  }

  private _tex(w: number, h: number, usage: number, label?: string): GPUTexture {
    return this.device.createTexture({
      label,
      size: [w, h],
      format: 'rgba8unorm',
      usage,
    })
  }

  private _upscaleBG(
    srcView: GPUTextureView,
    dstView: GPUTextureView,
    unifBuf: GPUBuffer,
    label?: string,
  ): GPUBindGroup {
    return this.device.createBindGroup({
      label,
      layout: this.upscaleBGL,
      entries: [
        { binding: 0, resource: srcView },
        { binding: 1, resource: dstView },
        { binding: 2, resource: this.sampler },
        { binding: 3, resource: { buffer: unifBuf } },
      ],
    })
  }

  private _rcasBG(srcView: GPUTextureView, dstView: GPUTextureView, unifBuf: GPUBuffer): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.rcasBGL,
      entries: [
        { binding: 0, resource: srcView },
        { binding: 1, resource: dstView },
        { binding: 2, resource: { buffer: unifBuf } },
      ],
    })
  }

  private _dispatch(pass: GPUComputePassEncoder, pipeline: GPUComputePipeline, bg: GPUBindGroup, w: number, h: number) {
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bg)
    pass.dispatchWorkgroups(Math.ceil(w / 8), Math.ceil(h / 8))
    pass.end()
  }

  private async _readback(encoder: GPUCommandEncoder, srcTex: GPUTexture, outW: number, outH: number): Promise<ImageData> {
    const bytesPerRow = Math.ceil((outW * 4) / 256) * 256
    const outBuf = this.device.createBuffer({
      size: bytesPerRow * outH,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    })
    encoder.copyTextureToBuffer({ texture: srcTex }, { buffer: outBuf, bytesPerRow }, [outW, outH])
    this.device.queue.submit([encoder.finish()])
    await this.device.queue.onSubmittedWorkDone()
    await outBuf.mapAsync(GPUMapMode.READ)
    const raw  = new Uint8Array(outBuf.getMappedRange())
    const data = new ImageData(outW, outH)
    const row  = outW * 4
    for (let y = 0; y < outH; y++) data.data.set(raw.subarray(y * bytesPerRow, y * bytesPerRow + row), y * row)
    outBuf.unmap()
    outBuf.destroy()
    return data
  }

  // ── Lanczos3 pipeline ─────────────────────────────────────────────

  private async _runLanczos3(bitmap: ImageBitmap, scale: UpscaleFactor, rcasEnabled: boolean, rcasStrength: number): Promise<ImageData> {
    const { device } = this
    const inW  = bitmap.width,  inH  = bitmap.height
    const outW = inW * scale,   outH = inH * scale

    // Textures
    const inputTex = this._tex(inW, inH,
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      'L3 Input')
    device.queue.copyExternalImageToTexture({ source: bitmap, flipY: false }, { texture: inputTex }, [inW, inH])

    // H-pass output: outW × inH
    const l3hTex = this._tex(outW, inH,
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
      'L3H Out')

    // V-pass output: outW × outH
    const l3vUsage = rcasEnabled
      ? GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
      : GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC
    const l3vTex = this._tex(outW, outH, l3vUsage, 'L3V Out')

    let rcasOutTex: GPUTexture | null = null
    if (rcasEnabled) {
      rcasOutTex = this._tex(outW, outH, GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC, 'RCAS Out')
    }

    // Uniform buffers
    const l3hBuf  = this._buf(new Float32Array([inW,  inH,  outW, 0]))
    const l3vBuf  = this._buf(new Float32Array([outW, inH,  outH, 0]))
    const rcasBuf = this._buf(new Float32Array([outW, outH, rcasStrength, 0]))

    // Bind groups
    const l3hBG  = this._upscaleBG(inputTex.createView(), l3hTex.createView(), l3hBuf, 'L3H BG')
    const l3vBG  = this._upscaleBG(l3hTex.createView(), l3vTex.createView(), l3vBuf, 'L3V BG')
    let   rcasBG : GPUBindGroup | null = null
    if (rcasEnabled && rcasOutTex) {
      rcasBG = this._rcasBG(l3vTex.createView(), rcasOutTex.createView(), rcasBuf)
    }

    // Encode
    const enc = device.createCommandEncoder({ label: 'L3 Encoder' })
    this._dispatch(enc.beginComputePass({ label: 'L3H' }), this.l3hPipeline,  l3hBG, outW, inH)
    this._dispatch(enc.beginComputePass({ label: 'L3V' }), this.l3vPipeline,  l3vBG, outW, outH)
    if (rcasEnabled && rcasBG) {
      this._dispatch(enc.beginComputePass({ label: 'RCAS' }), this.rcasPipeline, rcasBG, outW, outH)
    }

    const finalTex = (rcasEnabled && rcasOutTex) ? rcasOutTex : l3vTex
    const result = await this._readback(enc, finalTex, outW, outH)

    inputTex.destroy(); l3hTex.destroy(); l3vTex.destroy()
    rcasOutTex?.destroy(); l3hBuf.destroy(); l3vBuf.destroy(); rcasBuf.destroy()
    return result
  }

  // ── Jinc EWA pipeline ────────────────────────────────────────────

  private async _runJinc(bitmap: ImageBitmap, scale: UpscaleFactor, rcasEnabled: boolean, rcasStrength: number): Promise<ImageData> {
    const { device } = this
    const inW  = bitmap.width,  inH  = bitmap.height
    const outW = inW * scale,   outH = inH * scale

    const inputTex = this._tex(inW, inH,
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      'Jinc Input')
    device.queue.copyExternalImageToTexture({ source: bitmap, flipY: false }, { texture: inputTex }, [inW, inH])

    const interUsage = rcasEnabled
      ? GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
      : GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC
    const interTex = this._tex(outW, outH, interUsage, 'Jinc Out')

    let rcasOutTex: GPUTexture | null = null
    if (rcasEnabled) {
      rcasOutTex = this._tex(outW, outH, GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC, 'RCAS Out')
    }

    const jincBuf = this._buf(new Float32Array([inW, inH, outW, outH]))
    const rcasBuf = this._buf(new Float32Array([outW, outH, rcasStrength, 0]))

    const jincBG = this._upscaleBG(inputTex.createView(), interTex.createView(), jincBuf, 'Jinc BG')
    let rcasBG: GPUBindGroup | null = null
    if (rcasEnabled && rcasOutTex) {
      rcasBG = this._rcasBG(interTex.createView(), rcasOutTex.createView(), rcasBuf)
    }

    const enc = device.createCommandEncoder({ label: 'Jinc Encoder' })
    this._dispatch(enc.beginComputePass({ label: 'Jinc' }), this.jincPipeline, jincBG, outW, outH)
    if (rcasEnabled && rcasBG) {
      this._dispatch(enc.beginComputePass({ label: 'RCAS' }), this.rcasPipeline, rcasBG, outW, outH)
    }

    const finalTex = (rcasEnabled && rcasOutTex) ? rcasOutTex : interTex
    const result = await this._readback(enc, finalTex, outW, outH)

    inputTex.destroy(); interTex.destroy(); rcasOutTex?.destroy()
    jincBuf.destroy(); rcasBuf.destroy()
    return result
  }

  // ── FSR1 pipeline ─────────────────────────────────────────────────

  private async _runFSR1(bitmap: ImageBitmap, scale: UpscaleFactor, rcasEnabled: boolean, rcasStrength: number): Promise<ImageData> {
    const { device } = this
    const inW  = bitmap.width,  inH  = bitmap.height
    const outW = inW * scale,   outH = inH * scale

    const inputTex = this._tex(inW, inH,
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      'EASU Input')
    device.queue.copyExternalImageToTexture({ source: bitmap, flipY: false }, { texture: inputTex }, [inW, inH])

    const interUsage = rcasEnabled
      ? GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
      : GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC
    const interTex = this._tex(outW, outH, interUsage, 'EASU Out')

    let rcasOutTex: GPUTexture | null = null
    if (rcasEnabled) {
      rcasOutTex = this._tex(outW, outH, GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC, 'RCAS Out')
    }

    const easuBuf = this._buf(new Float32Array([inW, inH, outW, outH]))
    const rcasBuf = this._buf(new Float32Array([outW, outH, rcasStrength, 0]))

    const easuBG = this._upscaleBG(inputTex.createView(), interTex.createView(), easuBuf, 'EASU BG')
    let rcasBG: GPUBindGroup | null = null
    if (rcasEnabled && rcasOutTex) {
      rcasBG = this._rcasBG(interTex.createView(), rcasOutTex.createView(), rcasBuf)
    }

    const enc = device.createCommandEncoder({ label: 'FSR1 Encoder' })
    this._dispatch(enc.beginComputePass({ label: 'EASU' }), this.easuPipeline, easuBG, outW, outH)
    if (rcasEnabled && rcasBG) {
      this._dispatch(enc.beginComputePass({ label: 'RCAS' }), this.rcasPipeline, rcasBG, outW, outH)
    }

    const finalTex = (rcasEnabled && rcasOutTex) ? rcasOutTex : interTex
    const result = await this._readback(enc, finalTex, outW, outH)

    inputTex.destroy(); interTex.destroy(); rcasOutTex?.destroy()
    easuBuf.destroy(); rcasBuf.destroy()
    return result
  }
}
