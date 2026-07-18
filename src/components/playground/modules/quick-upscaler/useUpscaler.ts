/**
 * useUpscaler — Quick Image Upscaler state & logic hook
 *
 * Key design:
 *   • webGPUAvailable is exposed explicitly — UI controls algorithm, no silent fallback
 *   • If user selects lanczos3/fsr1 but WebGPU is unavailable, show an error
 *   • Default algorithm = 'lanczos3' if WebGPU available, 'bicubic' otherwise
 *   • Params change → 100 ms debounce → re-process with current algorithm
 */

import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { UpscalerState, UpscalerParams } from './types'
import { DEFAULT_PARAMS, INPUT_LIMITS, ALGORITHM_NEEDS_WEBGPU } from './types'
import { FSR1Renderer } from './webgpu/renderer'
import { bicubicUpscale } from './fallback/bicubic'

// ── State & actions ────────────────────────────────────────────────────

type Action =
  | { type: 'INIT_WEBGPU'; available: boolean }
  | { type: 'PROCESSING' }
  | { type: 'SET_ORIGINAL'; bitmap: ImageBitmap; name: string; width: number; height: number; objectURL: string }
  | { type: 'SET_RESULT'; blob: Blob; objectURL: string }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'UPDATE_PARAMS'; updates: Partial<UpscalerParams> }
  | { type: 'SET_SLIDER'; position: number }

const initial: UpscalerState = {
  status: 'idle',
  webGPUAvailable: false,
  originalBitmap: null,
  originalName: '',
  originalWidth: 0,
  originalHeight: 0,
  originalObjectURL: null,
  resultObjectURL: null,
  resultBlob: null,
  errorMessage: null,
  params: DEFAULT_PARAMS,
  sliderPosition: 0.5,
}

function reducer(state: UpscalerState, action: Action): UpscalerState {
  switch (action.type) {
    case 'INIT_WEBGPU': {
      const webGPUAvailable = action.available
      // Set default algorithm based on what's available
      const algorithm = webGPUAvailable ? 'lanczos3' : 'bicubic'
      return {
        ...state,
        webGPUAvailable,
        params: { ...state.params, algorithm },
      }
    }
    case 'PROCESSING':
      return { ...state, status: 'processing', errorMessage: null }

    case 'SET_ORIGINAL':
      return {
        ...state,
        status: 'processing',
        originalBitmap: action.bitmap,
        originalName: action.name,
        originalWidth: action.width,
        originalHeight: action.height,
        originalObjectURL: action.objectURL,
        resultObjectURL: null,
        resultBlob: null,
        errorMessage: null,
        sliderPosition: 0.5,
      }

    case 'SET_RESULT':
      return {
        ...state,
        status: 'done',
        resultBlob: action.blob,
        resultObjectURL: action.objectURL,
        errorMessage: null,
      }

    case 'SET_ERROR':
      return { ...state, status: 'error', errorMessage: action.message }

    case 'UPDATE_PARAMS':
      return { ...state, params: { ...state.params, ...action.updates } }

    case 'SET_SLIDER':
      return { ...state, sliderPosition: action.position }

    default:
      return state
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

async function imageDataToBlob(imageData: ImageData, format: 'png' | 'jpeg', quality: number): Promise<Blob> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height)
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return canvas.convertToBlob({
    type: format === 'jpeg' ? 'image/jpeg' : 'image/png',
    quality: format === 'jpeg' ? quality / 100 : undefined,
  })
}

function validateFile(file: File): string | null {
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    return 'Unsupported format. Please upload a PNG or JPEG file.'
  }
  if (file.size > INPUT_LIMITS.maxFileSizeMB * 1024 * 1024) {
    return `File too large. Maximum size is ${INPUT_LIMITS.maxFileSizeMB} MB.`
  }
  return null
}

// ── Hook ───────────────────────────────────────────────────────────────

export interface UpscalerHook extends UpscalerState {
  loadFile: (file: File) => void
  updateParams: (updates: Partial<UpscalerParams>) => void
  setSliderPosition: (pos: number) => void
  downloadResult: () => void
}

export function useUpscaler(): UpscalerHook {
  const [state, dispatch] = useReducer(reducer, initial)
  const stateRef    = useRef(state)
  stateRef.current  = state

  const rendererRef = useRef<FSR1Renderer | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUrlRef  = useRef<string | null>(null)
  const origUrlRef  = useRef<string | null>(null)

  // ── WebGPU init ────────────────────────────────────────────────────
  useEffect(() => {
    FSR1Renderer.create().then((renderer) => {
      const available = renderer !== null
      if (renderer) rendererRef.current = renderer
      dispatch({ type: 'INIT_WEBGPU', available })
    })

    return () => {
      rendererRef.current?.destroy()
      rendererRef.current = null
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ── Core processing ────────────────────────────────────────────────
  const processImage = useCallback(async (bitmap: ImageBitmap, params: UpscalerParams) => {
    const { algorithm, scale, rcasEnabled, rcasStrength, outputFormat, jpegQuality } = params

    // Hard guard — no silent fallback
    if (ALGORITHM_NEEDS_WEBGPU[algorithm] && !rendererRef.current) {
      const algoName = algorithm === 'lanczos3' ? 'Lanczos3' : algorithm === 'fsr1' ? 'FSR1' : 'Jinc EWA'
      dispatch({
        type: 'SET_ERROR',
        message: `${algoName} requires WebGPU, which is not available in your browser. Please select Bicubic.`,
      })
      return
    }

    dispatch({ type: 'PROCESSING' })
    try {
      let imageData: ImageData

      if (algorithm === 'lanczos3' && rendererRef.current) {
        imageData = await rendererRef.current.upscaleLanczos3(bitmap, scale, rcasEnabled, rcasStrength)
      } else if (algorithm === 'fsr1' && rendererRef.current) {
        imageData = await rendererRef.current.upscaleFSR1(bitmap, scale, rcasEnabled, rcasStrength)
      } else if (algorithm === 'jinc' && rendererRef.current) {
        imageData = await rendererRef.current.upscaleJinc(bitmap, scale, rcasEnabled, rcasStrength)
      } else {
        // bicubic — always available
        imageData = bicubicUpscale(bitmap, scale)
      }

      const blob = await imageDataToBlob(imageData, outputFormat, jpegQuality)
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      const objectURL = URL.createObjectURL(blob)
      prevUrlRef.current = objectURL
      dispatch({ type: 'SET_RESULT', blob, objectURL })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err instanceof Error ? err.message : 'Processing failed.' })
    }
  }, [])

  // ── Load file ──────────────────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { dispatch({ type: 'SET_ERROR', message: err }); return }

    createImageBitmap(file).then((bitmap) => {
      if (bitmap.width > INPUT_LIMITS.maxWidth || bitmap.height > INPUT_LIMITS.maxHeight) {
        bitmap.close()
        dispatch({ type: 'SET_ERROR', message: `Image too large. Max ${INPUT_LIMITS.maxWidth}×${INPUT_LIMITS.maxHeight} px.` })
        return
      }
      stateRef.current.originalBitmap?.close()
      if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current)
      const objectURL = URL.createObjectURL(file)
      origUrlRef.current = objectURL
      dispatch({ type: 'SET_ORIGINAL', bitmap, name: file.name, width: bitmap.width, height: bitmap.height, objectURL })
      processImage(bitmap, stateRef.current.params)
    }).catch(() => dispatch({ type: 'SET_ERROR', message: 'Failed to decode image.' }))
  }, [processImage])

  // ── Update params (realtime, 100 ms debounce) ──────────────────────
  const updateParams = useCallback((updates: Partial<UpscalerParams>) => {
    dispatch({ type: 'UPDATE_PARAMS', updates })
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const { originalBitmap, params } = stateRef.current
      if (originalBitmap) processImage(originalBitmap, { ...params, ...updates })
    }, 100)
  }, [processImage])

  // ── Slider ─────────────────────────────────────────────────────────
  const setSliderPosition = useCallback((pos: number) => {
    dispatch({ type: 'SET_SLIDER', position: Math.max(0, Math.min(1, pos)) })
  }, [])

  // ── Download ───────────────────────────────────────────────────────
  const downloadResult = useCallback(() => {
    const { resultObjectURL, originalName, params } = stateRef.current
    if (!resultObjectURL) return
    const base = originalName.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = resultObjectURL
    a.download = `${base}_${params.algorithm}_${params.scale}x.${params.outputFormat}`
    a.click()
  }, [])

  return { ...state, loadFile, updateParams, setSliderPosition, downloadResult }
}
