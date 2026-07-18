/**
 * Quick Image Upscaler — Main Module Component
 */

import { Link } from '@tanstack/react-router'
import { useUpscaler } from './useUpscaler'
import { ControlPanel } from './ControlPanel'
import { ImageDropzone } from './ImageDropzone'
import { SliderComparison } from './SliderComparison'
import { PLAYGROUND_COPY } from '~/constants/copy/playground'

const C = PLAYGROUND_COPY.quickUpscaler

function ProcessingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
      <span className="text-feldora-muted font-mono text-xs uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function QuickUpscalerModule() {
  const upscaler = useUpscaler()

  const {
    status,
    webGPUAvailable,
    params,
    originalName,
    originalWidth,
    originalHeight,
    originalObjectURL,
    resultObjectURL,
    sliderPosition,
    errorMessage,
    loadFile,
    updateParams,
    setSliderPosition,
    downloadResult,
  } = upscaler

  const isProcessing   = status === 'processing'
  const hasResult      = !!resultObjectURL && !!originalObjectURL
  const isFirstProcess = isProcessing && !hasResult
  const isReprocessing = isProcessing && hasResult
  const resultWidth    = originalWidth  * params.scale
  const resultHeight   = originalHeight * params.scale
  const processingLabel = C.processingLabels[params.algorithm] ?? C.processingLabels.fallback

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        to="/playground"
        className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        {C.backLabel}
      </Link>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="diamond-marker !w-2.5 !h-2.5" />
        <h2 className="text-lg font-bold uppercase tracking-wider">{C.name}</h2>
        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border bg-amber-400/20 text-amber-400 border-amber-400/30">
          {C.moduleLabel}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">

        {/* Controls */}
        <div className="w-full bg-feldora-surface border border-feldora-border/40 p-5 clip-notch-br">
          <ControlPanel
            params={params}
            webGPUAvailable={webGPUAvailable}
            onChange={updateParams}
            disabled={isProcessing}
          />
        </div>

        {/* Dropzone */}
        <div className="w-full">
          <ImageDropzone
            onFile={loadFile}
            errorMessage={status === 'error' ? errorMessage : null}
            originalName={originalName}
            originalWidth={originalWidth}
            originalHeight={originalHeight}
            hasImage={originalWidth > 0}
          />
        </div>

        {/* First-time processing spinner */}
        {isFirstProcess && <ProcessingSpinner label={processingLabel} />}

        {/* Comparison + download */}
        {hasResult && (
          <>
            <div className={`w-full transition-opacity duration-200 ${isReprocessing ? 'opacity-60' : 'opacity-100'}`}>
              <SliderComparison
                originalURL={originalObjectURL!}
                resultURL={resultObjectURL!}
                resultWidth={resultWidth}
                resultHeight={resultHeight}
                position={sliderPosition}
                onPositionChange={setSliderPosition}
              />
              {isReprocessing && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-3 h-3 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
                    {C.processingLabels.updating}
                  </span>
                </div>
              )}
            </div>

            {!isProcessing && (
              <button
                type="button"
                onClick={downloadResult}
                className="btn-angular-primary !px-10 !py-2.5 !text-[11px] w-full"
              >
                {C.downloadButton} {params.outputFormat.toUpperCase()}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
