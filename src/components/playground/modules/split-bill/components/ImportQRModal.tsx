/**
 * ImportQRModal — Import bill from QR (camera scan or file upload)
 *
 * Two options:
 * 1. Scan from camera (live video feed + jsQR)
 * 2. Import from file (image picker)
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { scanQRFromImage, scanQRFromVideoFrame, decodeQRToBill, type QRBillData } from '../qr'

interface ImportQRModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onImport: (data: QRBillData) => Promise<void>
  readonly dek: CryptoKey | null
}

type ImportMode = 'choose' | 'camera' | 'file' | 'confirm'

export function ImportQRModal({ open, onClose, onImport, dek }: ImportQRModalProps) {
  const [mode, setMode] = useState<ImportMode>('choose')
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [pendingData, setPendingData] = useState<QRBillData | null>(null)
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    if (!open) {
      setMode('choose')
      setError(null)
      setProcessing(false)
      setPendingData(null)
      setEditTitle('')
    }
  }, [open])

  function handleQRResult(data: QRBillData) {
    setPendingData(data)
    setEditTitle(data.title)
    setMode('confirm')
  }

  async function handleConfirmSave() {
    if (!pendingData) return
    setProcessing(true)
    await onImport({ ...pendingData, title: editTitle.trim() || pendingData.title })
    setProcessing(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-sm card-polygon p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-feldora-text font-bold text-lg">
            <svg className="w-5 h-5 text-feldora-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
            </svg>
            Import Bill
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-feldora-muted hover:text-feldora-text transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        {/* Mode: Choose */}
        {mode === 'choose' && (
          <div className="space-y-3">
            <p className="text-xs text-feldora-text-secondary mb-3">Choose how to import:</p>
            <button
              type="button"
              onClick={() => setMode('camera')}
              className="w-full flex items-center gap-3 px-4 py-3 border border-feldora-border/40 rounded hover:border-feldora-accent/30 transition-colors"
            >
              <svg className="w-5 h-5 text-feldora-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-feldora-text font-semibold">Scan with Camera</p>
                <p className="text-[11px] text-feldora-text-secondary">Point camera at QR code</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className="w-full flex items-center gap-3 px-4 py-3 border border-feldora-border/40 rounded hover:border-feldora-accent/30 transition-colors"
            >
              <svg className="w-5 h-5 text-feldora-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-feldora-text font-semibold">Import from Image</p>
                <p className="text-[11px] text-feldora-text-secondary">Select QR image from device</p>
              </div>
            </button>
          </div>
        )}

        {/* Mode: Camera */}
        {mode === 'camera' && (
          <CameraScanner
            dek={dek}
            processing={processing}
            onResult={handleQRResult}
            onError={(msg) => setError(msg)}
            onBack={() => { setMode('choose'); setError(null) }}
          />
        )}

        {/* Mode: File */}
        {mode === 'file' && (
          <FileImporter
            dek={dek}
            processing={processing}
            onResult={handleQRResult}
            onError={(msg) => setError(msg)}
            onBack={() => { setMode('choose'); setError(null) }}
          />
        )}

        {/* Mode: Confirm */}
        {mode === 'confirm' && pendingData && (
          <div className="space-y-4">
            <p className="text-sm text-feldora-text-secondary">Add this bill?</p>
            <div>
              <label htmlFor="import-title" className="block text-xs text-feldora-text font-mono uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                id="import-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-feldora-surface-light border border-feldora-border rounded px-3 py-2 text-sm text-feldora-text placeholder:text-feldora-muted focus:outline-none focus:border-feldora-accent/50 transition-colors"
                maxLength={100}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={processing || !editTitle.trim()}
                className="btn-angular-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
              >
                {processing ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CameraScanner ───────────────────────────────────────────────────

function CameraScanner({
  dek,
  processing,
  onResult,
  onError,
  onBack,
}: Readonly<{
  dek: CryptoKey | null
  processing: boolean
  onResult: (data: QRBillData) => void
  onError: (msg: string) => void
  onBack: () => void
}>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(true)

  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [stopCamera])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanningRef.current = true
        requestAnimationFrame(scanLoop)
      }
    } catch {
      onError('Camera access denied or unavailable')
    }
  }

  function scanLoop() {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return

    const result = scanQRFromVideoFrame(videoRef.current, canvasRef.current)
    if (result && dek) {
      scanningRef.current = false
      stopCamera()
      handleDecode(result)
    } else {
      requestAnimationFrame(scanLoop)
    }
  }

  async function handleDecode(qrContent: string) {
    if (!dek) return
    const data = await decodeQRToBill(qrContent, dek)
    if (data) {
      onResult(data)
    } else {
      onError('Invalid QR code. Make sure it was generated by Split Bill.')
      // Restart scanning
      scanningRef.current = true
      startCamera()
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-square bg-black rounded overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
        {/* Scan overlay */}
        <div className="absolute inset-0 border-2 border-feldora-accent/50 rounded pointer-events-none" />
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-5 h-5 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="text-xs text-feldora-text-secondary text-center">Point camera at QR code</p>
      <button
        type="button"
        onClick={() => { stopCamera(); onBack() }}
        className="w-full py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors"
      >
        &larr; Back
      </button>
    </div>
  )
}

// ─── FileImporter ────────────────────────────────────────────────────

function FileImporter({
  dek,
  processing,
  onResult,
  onError,
  onBack,
}: Readonly<{
  dek: CryptoKey | null
  processing: boolean
  onResult: (data: QRBillData) => void
  onError: (msg: string) => void
  onBack: () => void
}>) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !dek) return

    try {
      const qrContent = await scanQRFromImage(file)
      if (!qrContent) {
        onError('No QR code found in image')
        return
      }

      const data = await decodeQRToBill(qrContent, dek)
      if (data) {
        onResult(data)
      } else {
        onError('Invalid QR code. Make sure it was generated by Split Bill.')
      }
    } catch {
      onError('Failed to read image')
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="w-full aspect-[4/3] border-2 border-dashed border-feldora-border/60 rounded flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-feldora-accent/40 transition-colors"
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-8 h-8 text-feldora-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <p className="text-xs text-feldora-text-secondary">Tap to select image</p>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={onBack}
        className="w-full py-2 text-xs font-semibold uppercase tracking-wider text-feldora-text-secondary hover:text-feldora-text transition-colors"
      >
        &larr; Back
      </button>
    </div>
  )
}
