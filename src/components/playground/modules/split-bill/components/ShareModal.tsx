/**
 * ShareModal — Display QR code for sharing a bill
 *
 * Features:
 * - QR code display (generated from encrypted+compressed bill data)
 * - Share button (Web Share API)
 * - Download button (save QR as PNG)
 */

import { useState, useEffect } from 'react'
import { encodeBillToQR, type QRBillData } from '../qr'

interface ShareModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly billData: QRBillData | null
  readonly dek: CryptoKey | null
}

export function ShareModal({ open, onClose, billData, dek }: ShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !billData || !dek) {
      setQrDataUrl(null)
      setError(null)
      return
    }

    generateQR()

    async function generateQR() {
      setLoading(true)
      setError(null)
      try {
        const dataUrl = await encodeBillToQR(billData!, dek!)
        if (!dataUrl) {
          setError('Bill is too large for QR code. Try reducing items.')
        } else {
          setQrDataUrl(dataUrl)
        }
      } catch (err) {
        setError('Failed to generate QR code')
        console.error('[ShareModal] generate error:', err)
      } finally {
        setLoading(false)
      }
    }
  }, [open, billData, dek])

  if (!open) return null

  async function handleShare() {
    if (!qrDataUrl) return

    try {
      const blob = await (await fetch(qrDataUrl)).blob()
      const file = new File([blob], `split-bill-${Date.now()}.png`, { type: 'image/png' })

      if (navigator.share) {
        await navigator.share({
          title: `Split Bill: ${billData?.title ?? 'Bill'}`,
          files: [file],
        })
      }
    } catch (err) {
      // User cancelled share or not supported
      console.warn('[ShareModal] share error:', err)
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `split-bill-${billData?.title?.replace(/\s+/g, '-').toLowerCase() ?? 'qr'}.png`
    link.click()
  }

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
            Share Bill
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

        {/* Content */}
        <div className="flex flex-col items-center gap-4">
          {loading && (
            <div className="w-[300px] h-[300px] flex items-center justify-center bg-feldora-surface-light rounded">
              <div className="w-5 h-5 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {qrDataUrl && !loading && (
            <>
              <div className="bg-white p-2 rounded">
                <img src={qrDataUrl} alt="QR Code" className="w-[280px] h-[280px]" />
              </div>
              <p className="text-xs text-feldora-text-secondary text-center">
                Scan this QR from another device to import this bill
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        {qrDataUrl && !loading && (
          <div className="flex gap-3 mt-5">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-feldora-accent/40 text-feldora-accent hover:bg-feldora-accent/10 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
                Share
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 btn-angular-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
