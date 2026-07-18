import { useCallback, useRef, useState } from 'react'
import { INPUT_LIMITS } from './types'
import { PLAYGROUND_COPY } from '~/constants/copy/playground'

const C = PLAYGROUND_COPY.quickUpscaler

interface ImageDropzoneProps {
  readonly onFile: (file: File) => void
  readonly errorMessage: string | null
  readonly originalName: string
  readonly originalWidth: number
  readonly originalHeight: number
  readonly hasImage: boolean
}

export function ImageDropzone({
  onFile,
  errorMessage,
  originalName,
  originalWidth,
  originalHeight,
  hasImage,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File | undefined) => {
    if (file) onFile(file)
  }, [onFile])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragging(false), [])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }, [handleFile])

  const borderClass = errorMessage
    ? 'border-red-500/50 bg-red-500/5'
    : isDragging
      ? 'border-feldora-accent bg-feldora-accent/5'
      : hasImage
        ? 'border-feldora-border bg-feldora-surface'
        : 'border-feldora-border/50 bg-feldora-surface hover:border-feldora-border hover:bg-feldora-surface-light'

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`w-full border-2 border-dashed transition-colors duration-200 p-6 text-left focus:outline-none focus:border-feldora-accent/60 ${borderClass}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={onInputChange}
          aria-label={C.dropzoneAriaLabel}
        />

        {hasImage ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-feldora-accent/10 border border-feldora-accent/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-feldora-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-feldora-text text-sm font-medium truncate">{originalName}</p>
              <p className="text-feldora-muted font-mono text-[10px] mt-0.5">
                {originalWidth} × {originalHeight} px — {C.dropzoneReplaceHint}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-10 h-10 border border-feldora-border/50 flex items-center justify-center text-feldora-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-feldora-text text-sm">
                {C.dropzonePrompt}{' '}
                <span className="text-feldora-accent">{C.dropzonePromptAccent}</span>
              </p>
              <p className="text-feldora-muted font-mono text-[10px] mt-1">
                PNG or JPEG · max {INPUT_LIMITS.maxFileSizeMB} MB · max {INPUT_LIMITS.maxWidth}×{INPUT_LIMITS.maxHeight} px
              </p>
            </div>
          </div>
        )}
      </button>

      {errorMessage && (
        <p className="text-red-400 text-xs font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-400 rotate-45 inline-block flex-shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
