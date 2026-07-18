/**
 * AI Image Upscaler — Main Module Component
 */

import { Link } from '@tanstack/react-router'
import { useAIUpscaler } from './useAIUpscaler'
import { DisclaimerBox } from './DisclaimerBox'
import { DownloadConsentPrompt } from './DownloadConsentPrompt'
import { ImageDropzone } from './ImageDropzone'
import { ProgressBar } from './ProgressBar'
import { SliderComparison } from './SliderComparison'
import { AI_LIMITS } from './types'
import type { OutputFormat } from './types'

// ── Sub-components ─────────────────────────────────────────────────────

/** Model status + CPU warning */
function ModelStatus({
  status, accelerated,
}: {
  status: string
  accelerated: boolean | null
}) {
  if (status === 'loading-model') {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-feldora-muted">
            Loading LiteRT runtime + model…
          </span>
        </div>
      </div>
    )
  }
  if (accelerated === null) return null

  return (
    <div className="w-full space-y-2">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accelerated ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-feldora-muted">
          {accelerated ? 'Model ready — WebGPU' : 'Model ready — WASM (CPU)'}
        </span>
      </div>

      {/* CPU warning */}
      {!accelerated && (
        <div className="border border-red-500/30 bg-red-500/5 px-3 py-2.5 flex items-start gap-2">
          <span className="text-red-400 text-sm flex-shrink-0 mt-px">⚠</span>
          <p className="text-red-400/90 text-xs leading-relaxed">
            <span className="font-bold">WebGPU is not available</span> — running on CPU (WASM).
            Processing a large image may take <span className="font-bold">5–15 minutes</span>.
            For best performance, use Chrome or Edge with WebGPU support.
          </p>
        </div>
      )}
    </div>
  )
}

/** Original image preview — shown after upload, before result is ready */
function OriginalPreview({
  url, name, width, height, scale,
}: {
  url: string; name: string; width: number; height: number; scale: number
}) {
  return (
    <div className="w-full space-y-2">
      <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
        Original
      </span>
      <div className="w-full bg-feldora-bg border border-feldora-border/40 overflow-hidden">
        <img
          src={url}
          alt={name}
          className="w-full object-contain max-h-72"
          draggable={false}
        />
      </div>
      <p className="text-feldora-muted font-mono text-[10px] text-center">
        {width} × {height} px → {width * scale} × {height * scale} px after {scale}×
      </p>
    </div>
  )
}

/** Processing progress — spinner for first tile, bar after */
function ProcessingIndicator({
  status, progress,
}: {
  status: string
  progress: { current: number; total: number } | null
}) {
  if (status === 'assembling') {
    return (
      <div className="w-full flex items-center gap-2 justify-center py-1">
        <div className="w-3 h-3 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
          Assembling result…
        </span>
      </div>
    )
  }

  if (status === 'processing') {
    if (!progress || progress.current === 0) {
      return (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-3 h-3 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
              Preparing tiles…
            </span>
          </div>
        </div>
      )
    }
    return (
      <div className="w-full space-y-2">
        <ProgressBar
          current={progress.current}
          total={progress.total}
          label="Running Real-ESRGAN"
        />
        <p className="text-feldora-muted font-mono text-[9px] text-center">
          Each tile: 128×128 → 512×512 via AI inference
        </p>
      </div>
    )
  }

  return null
}

/** Output format controls */
function OutputControls({
  outputFormat, jpegQuality, onChange, onQuality, disabled,
}: {
  outputFormat: OutputFormat
  jpegQuality: number
  onChange: (f: OutputFormat) => void
  onQuality: (q: number) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-3">
      <span className="block text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
        Output Format
      </span>
      <div className="flex gap-1">
        {(['png', 'jpeg'] as OutputFormat[]).map((f) => (
          <button
            key={f}
            type="button"
            disabled={disabled}
            onClick={() => onChange(f)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
              disabled
                ? 'opacity-40 cursor-not-allowed border-feldora-border/30 text-feldora-muted'
                : outputFormat === f
                  ? 'border-feldora-accent text-feldora-accent bg-feldora-accent/10'
                  : 'border-feldora-border/50 text-feldora-muted hover:border-feldora-border hover:text-feldora-text-secondary'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      {outputFormat === 'jpeg' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">Quality</span>
            <span className="text-feldora-text-secondary font-mono text-[10px]">{jpegQuality}</span>
          </div>
          <input
            type="range" min={60} max={95} step={1} value={jpegQuality} disabled={disabled}
            onChange={(e) => onQuality(Number(e.target.value))}
            className="w-full h-1 bg-feldora-border/40 appearance-none cursor-pointer accent-feldora-accent disabled:opacity-40"
          />
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────

export default function AIUpscalerModule() {
  const upscaler = useAIUpscaler()

  const {
    status, modelLoaded, modelAccelerated,
    originalName, originalWidth, originalHeight, originalObjectURL,
    resultObjectURL, progress, errorMessage,
    outputFormat, jpegQuality, sliderPosition,
    loadFile, startProcessing, approveDownload,
    setOutputFormat, setJpegQuality, setSliderPosition,
    downloadResult, reset,
  } = upscaler

  const isPreload    = status === 'checking' || status === 'needs-download'
  const isProcessing = status === 'processing' || status === 'assembling' || status === 'loading-model'
  const hasImage     = originalWidth > 0
  const hasResult    = !!resultObjectURL && !!originalObjectURL
  const canStart     = modelLoaded && hasImage && !isProcessing
  const resultWidth  = originalWidth  * AI_LIMITS.scale
  const resultHeight = originalHeight * AI_LIMITS.scale

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        to="/playground"
        className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        Back to modules
      </Link>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="diamond-marker !w-2.5 !h-2.5" />
        <h2 className="text-lg font-bold uppercase tracking-wider">Advanced Image Upscaler</h2>
        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border bg-feldora-accent/20 text-feldora-accent border-feldora-accent/30">
          AI
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">

        {/* ── Pre-load: checking / consent ── */}
        {isPreload && (
          <DownloadConsentPrompt
            onApprove={approveDownload}
            isChecking={status === 'checking'}
          />
        )}

        {/* ── Module ready ── */}
        {!isPreload && (
          <>
            {/* Disclaimer (always shown) */}
            <DisclaimerBox />

            {/* Model status + CPU warning */}
            <ModelStatus status={status} accelerated={modelAccelerated} />

            {/* Error */}
            {status === 'error' && errorMessage && (
              <div className="w-full border border-red-500/30 bg-red-500/5 px-3 py-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rotate-45 flex-shrink-0" />
                <p className="text-red-400 text-xs">{errorMessage}</p>
              </div>
            )}

            {/* Dropzone */}
            <div className="w-full">
              <ImageDropzone
                onFile={loadFile}
                errorMessage={null}
                originalName={originalName}
                originalWidth={originalWidth}
                originalHeight={originalHeight}
                hasImage={hasImage}
                disabled={isProcessing}
              />
            </div>

            {/* Original preview — shown after upload, before result */}
            {hasImage && originalObjectURL && !hasResult && !isProcessing && (
              <OriginalPreview
                url={originalObjectURL}
                name={originalName}
                width={originalWidth}
                height={originalHeight}
                scale={AI_LIMITS.scale}
              />
            )}

            {/* Output controls */}
            <div className="w-full bg-feldora-surface border border-feldora-border/40 p-4 clip-notch-br">
              <OutputControls
                outputFormat={outputFormat}
                jpegQuality={jpegQuality}
                onChange={setOutputFormat}
                onQuality={setJpegQuality}
                disabled={isProcessing}
              />
            </div>

            {/* Start button */}
            <button
              type="button"
              onClick={startProcessing}
              disabled={!canStart}
              className="btn-angular-primary !px-10 !py-2.5 !text-[11px] w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading-model'
                ? 'Loading Model…'
                : isProcessing
                  ? 'Processing…'
                  : 'Start Processing'}
            </button>

            {/* Processing indicator */}
            {isProcessing && status !== 'loading-model' && (
              <ProcessingIndicator status={status} progress={progress} />
            )}

            {/* Result */}
            {hasResult && (
              <>
                <div className="w-full">
                  <SliderComparison
                    originalURL={originalObjectURL!}
                    resultURL={resultObjectURL!}
                    resultWidth={resultWidth}
                    resultHeight={resultHeight}
                    position={sliderPosition}
                    onPositionChange={setSliderPosition}
                  />
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={downloadResult}
                    className="btn-angular-primary !px-8 !py-2.5 !text-[11px] flex-1"
                  >
                    ↓ Download {outputFormat.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-feldora-muted hover:text-feldora-text border border-feldora-border/50 hover:border-feldora-border transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
