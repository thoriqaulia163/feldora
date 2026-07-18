/**
 * useAIUpscaler — AI Image Upscaler state & orchestration hook
 *
 * Pipeline (triggered by "Start Processing" button):
 *   loadModel()          → LiteRT runtime + model compile
 *   splitIntoTiles()     → divide input bitmap into 128×128 patches
 *   runTile() × N        → per-tile Real-ESRGAN inference
 *   pasteTile() × N      → composite NCHW → RGBA onto output canvas
 *   canvasToBlob()       → encode to PNG / JPEG
 *
 * Model loading is separated from image processing:
 *   - Model loads automatically on first user interaction (file upload)
 *   - Re-upload while model is ready skips the loading step
 *   - Cached in module scope (runner.ts singleton)
 */

import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { AIUpscalerState, OutputFormat } from './types'
import { AI_LIMITS, DEFAULT_PARAMS, MODEL_URL } from './types'
import { loadModel, runTile, clearModelCache } from './inference/runner'
import { splitIntoTiles, tileCount } from './tiling/splitter'
import { createOutputCanvas, pasteTile, canvasToBlob } from './tiling/assembler'
import type { CompiledModel } from '@litertjs/core'

// ── State & actions ────────────────────────────────────────────────────

type Action =
  | { type: 'CHECKING' }
  | { type: 'NEEDS_DOWNLOAD' }
  | { type: 'MODEL_LOADING' }
  | { type: 'MODEL_READY'; accelerated: boolean }
  | { type: 'MODEL_ERROR'; message: string }
  | { type: 'FILE_LOADED'; bitmap: ImageBitmap; name: string; objectURL: string }
  | { type: 'PROCESSING_START'; total: number }
  | { type: 'TILE_DONE'; current: number; total: number }
  | { type: 'ASSEMBLING' }
  | { type: 'DONE'; blob: Blob; objectURL: string }
  | { type: 'ERROR'; message: string }
  | { type: 'SET_FORMAT'; format: OutputFormat }
  | { type: 'SET_QUALITY'; quality: number }
  | { type: 'SET_SLIDER'; position: number }
  | { type: 'RESET' }

const initial: AIUpscalerState = {
  status: 'checking',
  modelLoaded: false,
  modelAccelerated: null,
  originalBitmap: null,
  originalName: '',
  originalWidth: 0,
  originalHeight: 0,
  originalObjectURL: null,
  resultObjectURL: null,
  resultBlob: null,
  progress: null,
  errorMessage: null,
  outputFormat: DEFAULT_PARAMS.outputFormat,
  jpegQuality: DEFAULT_PARAMS.jpegQuality,
  sliderPosition: 0.5,
}

function reducer(state: AIUpscalerState, action: Action): AIUpscalerState {
  switch (action.type) {
    case 'CHECKING':
      return { ...state, status: 'checking', errorMessage: null }

    case 'NEEDS_DOWNLOAD':
      return { ...state, status: 'needs-download', errorMessage: null }

    case 'MODEL_LOADING':
      return { ...state, status: 'loading-model', errorMessage: null }

    case 'MODEL_READY':
      return { ...state, modelLoaded: true, modelAccelerated: action.accelerated,
               status: state.originalBitmap ? state.status : 'idle' }

    case 'MODEL_ERROR':
      return { ...state, status: 'error', errorMessage: action.message }

    case 'FILE_LOADED':
      return {
        ...state,
        originalBitmap: action.bitmap,
        originalName: action.name,
        originalWidth: action.bitmap.width,
        originalHeight: action.bitmap.height,
        originalObjectURL: action.objectURL,
        resultObjectURL: null,
        resultBlob: null,
        progress: null,
        errorMessage: null,
        sliderPosition: 0.5,
        status: 'idle',
      }

    case 'PROCESSING_START':
      return { ...state, status: 'processing', progress: { current: 0, total: action.total }, errorMessage: null }

    case 'TILE_DONE':
      return { ...state, progress: { current: action.current, total: action.total } }

    case 'ASSEMBLING':
      return { ...state, status: 'assembling' }

    case 'DONE':
      return {
        ...state,
        status: 'done',
        resultBlob: action.blob,
        resultObjectURL: action.objectURL,
        progress: null,
        errorMessage: null,
      }

    case 'ERROR':
      return { ...state, status: 'error', errorMessage: action.message, progress: null }

    case 'SET_FORMAT':
      return { ...state, outputFormat: action.format }

    case 'SET_QUALITY':
      return { ...state, jpegQuality: action.quality }

    case 'SET_SLIDER':
      return { ...state, sliderPosition: Math.max(0, Math.min(1, action.position)) }

    case 'RESET':
      return {
        ...initial,
        modelLoaded: state.modelLoaded,
        modelAccelerated: state.modelAccelerated,
        outputFormat: state.outputFormat,
        jpegQuality: state.jpegQuality,
        // Never go back to 'checking' on reset — useEffect won't fire again.
        // If model is loaded, go straight to idle; otherwise keep current non-checking status.
        status: state.modelLoaded ? 'idle' : (state.status === 'checking' ? 'needs-download' : state.status),
      }

    default:
      return state
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function validateFile(file: File): string | null {
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    return 'Unsupported format. Please upload PNG or JPEG.'
  }
  if (file.size > AI_LIMITS.maxFileSizeMB * 1024 * 1024) {
    return `File too large. Maximum ${AI_LIMITS.maxFileSizeMB} MB.`
  }
  return null
}

// ── Hook ───────────────────────────────────────────────────────────────

export interface AIUpscalerHook extends AIUpscalerState {
  loadFile: (file: File) => void
  startProcessing: () => void
  approveDownload: () => void   // user consents to download
  setOutputFormat: (format: OutputFormat) => void
  setJpegQuality: (quality: number) => void
  setSliderPosition: (pos: number) => void
  downloadResult: () => void
  reset: () => void
}

export function useAIUpscaler(): AIUpscalerHook {
  const [state, dispatch] = useReducer(reducer, initial)
  const stateRef  = useRef(state)
  stateRef.current = state

  const modelRef  = useRef<CompiledModel | null>(null)
  const prevResultUrlRef = useRef<string | null>(null)
  const origUrlRef       = useRef<string | null>(null)
  // Abort flag to cancel in-progress tile loop
  const abortRef  = useRef(false)

  // ── Cache check + conditional model load on mount ─────────────────
  useEffect(() => {
    async function checkAndLoad() {
      dispatch({ type: 'CHECKING' })

      // Check SW cache: if the model file is cached, user has used this
      // module before — load silently. Otherwise, ask for consent first.
      let isCached = false
      if ('caches' in window) {
        try {
          const hit = await caches.match(MODEL_URL)
          isCached = !!hit
        } catch {
          isCached = false
        }
      }

      if (!isCached) {
        // Model not cached — require explicit user consent
        dispatch({ type: 'NEEDS_DOWNLOAD' })
        return
      }

      // Model is cached — proceed with load
      doLoadModel()
    }

    checkAndLoad()

    return () => {
      abortRef.current = true
      if (prevResultUrlRef.current) URL.revokeObjectURL(prevResultUrlRef.current)
      if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current)
    }
  }, [])

  // Separated so it can be called both from auto-load and from approveDownload
  function doLoadModel() {
    dispatch({ type: 'MODEL_LOADING' })
    loadModel()
      .then(({ model, accelerated }) => {
        modelRef.current = model
        dispatch({ type: 'MODEL_READY', accelerated })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load AI model.'
        dispatch({ type: 'MODEL_ERROR', message })
      })
  }

  // ── Approve download (user consented) ─────────────────────────────
  const approveDownload = useCallback(() => {
    doLoadModel()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load file ──────────────────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { dispatch({ type: 'ERROR', message: err }); return }

    createImageBitmap(file)
      .then((bitmap) => {
        if (bitmap.width > AI_LIMITS.maxWidth || bitmap.height > AI_LIMITS.maxHeight) {
          bitmap.close()
          dispatch({ type: 'ERROR', message: `Image too large. Max ${AI_LIMITS.maxWidth}×${AI_LIMITS.maxHeight} px.` })
          return
        }
        // Close previous bitmap
        stateRef.current.originalBitmap?.close()
        // Revoke previous original URL
        if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current)
        const objectURL = URL.createObjectURL(file)
        origUrlRef.current = objectURL

        dispatch({ type: 'FILE_LOADED', bitmap, name: file.name, objectURL })
      })
      .catch(() => dispatch({ type: 'ERROR', message: 'Failed to decode image.' }))
  }, [])

  // ── Start processing ───────────────────────────────────────────────
  const startProcessing = useCallback(async () => {
    const { originalBitmap, originalName, outputFormat, jpegQuality, modelLoaded } = stateRef.current
    const model = modelRef.current

    if (!originalBitmap || !model || !modelLoaded) return

    abortRef.current = false

    // Revoke previous result
    if (prevResultUrlRef.current) {
      URL.revokeObjectURL(prevResultUrlRef.current)
      prevResultUrlRef.current = null
    }

    try {
      // 1. Split into tiles
      const tiles = splitIntoTiles(originalBitmap)
      const total = tiles.length
      dispatch({ type: 'PROCESSING_START', total })

      // Yield to browser BEFORE heavy computation starts — gives React one
      // frame to flush the PROCESSING_START state and show the loading UI.
      // Critical for WASM/CPU which blocks the main thread synchronously.
      await new Promise<void>((resolve) => setTimeout(resolve, 0))

      // 2. Per-tile inference
      const outputCanvas = createOutputCanvas(
        originalBitmap.width,
        originalBitmap.height,
        AI_LIMITS.scale,
      )
      const ctx = outputCanvas.getContext('2d')!

      for (let i = 0; i < tiles.length; i++) {
        if (abortRef.current) return

        const tile = tiles[i]
        const ncwData = await runTile(model, tile.data)

        // 3. Paste tile (NCHW → RGBA)
        pasteTile(ctx, tile, ncwData)

        dispatch({ type: 'TILE_DONE', current: i + 1, total })

        // Yield to the browser between tiles so React can flush state updates
        // and repaint the progress bar. Critical for CPU/WASM execution which
        // runs synchronously on the main thread and would otherwise block UI.
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
      }

      if (abortRef.current) return

      // 4. Encode to blob
      dispatch({ type: 'ASSEMBLING' })
      const blob = await canvasToBlob(outputCanvas, outputFormat, jpegQuality)

      const objectURL = URL.createObjectURL(blob)
      prevResultUrlRef.current = objectURL

      dispatch({ type: 'DONE', blob, objectURL })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed.'
      dispatch({ type: 'ERROR', message })
    }
  }, [])

  // ── Output settings ────────────────────────────────────────────────
  const setOutputFormat  = useCallback((format: OutputFormat) => dispatch({ type: 'SET_FORMAT', format }), [])
  const setJpegQuality   = useCallback((quality: number) => dispatch({ type: 'SET_QUALITY', quality }), [])
  const setSliderPosition = useCallback((pos: number) => dispatch({ type: 'SET_SLIDER', position: pos }), [])

  // ── Download ───────────────────────────────────────────────────────
  const downloadResult = useCallback(() => {
    const { resultObjectURL, originalName, outputFormat } = stateRef.current
    if (!resultObjectURL) return
    const base = originalName.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = resultObjectURL
    a.download = `${base}_realesrgan_4x.${outputFormat}`
    a.click()
  }, [])

  // ── Reset ──────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    abortRef.current = true
    stateRef.current.originalBitmap?.close()
    dispatch({ type: 'RESET' })
  }, [])

  return {
    ...state,
    loadFile,
    startProcessing,
    approveDownload,
    setOutputFormat,
    setJpegQuality,
    setSliderPosition,
    downloadResult,
    reset,
  }
}
