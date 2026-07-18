import { useCallback, useRef, useState } from 'react'
import { AI_LIMITS } from './types'

interface ImageDropzoneProps {
  readonly onFile: (file: File) => void
  readonly errorMessage: string | null
  readonly originalName: string
  readonly originalWidth: number
  readonly originalHeight: number
  readonly hasImage: boolean
  readonly disabled: boolean
}

export function ImageDropzone({
  onFile, errorMessage, originalName, originalWidth, originalHeight, hasImage, disabled,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File | undefined) => {
    if (file && !disabled) onFile(file)
  }, [onFile, disabled])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true)
  }, [])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]); e.target.value = ''
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
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setIsDragging(false)}
        disabled={disabled}
        className={`w-full border-2 border-dashed p-5 text-left transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${borderClass}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={onInputChange}
          aria-label="Upload image"
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
                {originalWidth} × {originalHeight} px — click to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <svg className="w-8 h-8 text-feldora-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-feldora-text text-sm text-center">
              Drop image or <span className="text-feldora-accent">click to browse</span>
            </p>
            <p className="text-feldora-muted font-mono text-[10px] text-center">
              PNG or JPEG · max {AI_LIMITS.maxFileSizeMB} MB · max {AI_LIMITS.maxWidth}×{AI_LIMITS.maxHeight} px
            </p>
          </div>
        )}
      </button>
      {errorMessage && (
        <p className="text-red-400 text-xs font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-400 rotate-45 flex-shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
