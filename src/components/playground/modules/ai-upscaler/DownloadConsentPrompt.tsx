import { AI_LIMITS, LITERT_WASM_CDN } from './types'

interface DownloadConsentPromptProps {
  readonly onApprove: () => void
  readonly isChecking: boolean
}

export function DownloadConsentPrompt({ onApprove, isChecking }: DownloadConsentPromptProps) {
  if (isChecking) {
    return (
      <div className="w-full card-polygon p-6 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <span className="text-feldora-text-secondary text-sm">Checking for cached assets…</span>
      </div>
    )
  }

  return (
    <div className="w-full card-polygon p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex-shrink-0 bg-feldora-accent/10 border border-feldora-accent/30 flex items-center justify-center mt-0.5">
          <svg className="w-4 h-4 text-feldora-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <div>
          <h3 className="text-feldora-text font-bold text-base">Download required</h3>
          <p className="text-feldora-text-secondary text-sm mt-1">
            This module needs to download assets before it can run.
            After the first download, everything is available offline.
          </p>
        </div>
      </div>

      {/* What will be downloaded */}
      <div className="space-y-2">
        <p className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
          What will be downloaded
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between bg-feldora-surface-light border border-feldora-border/30 px-3 py-2">
            <div>
              <span className="text-feldora-text text-sm">Real-ESRGAN model</span>
              <span className="text-feldora-muted font-mono text-[10px] ml-2">from this server</span>
            </div>
            <span className="text-feldora-accent font-mono text-xs">~4.1 MB</span>
          </div>
          <div className="flex items-center justify-between bg-feldora-surface-light border border-feldora-border/30 px-3 py-2">
            <div>
              <span className="text-feldora-text text-sm">LiteRT runtime (WASM)</span>
              <span className="text-feldora-muted font-mono text-[10px] ml-2">from jsDelivr CDN</span>
            </div>
            <span className="text-feldora-accent font-mono text-xs">~9 MB</span>
          </div>
        </div>
        <p className="text-feldora-muted text-xs">
          Total: ~13 MB — cached after first use. Max input {AI_LIMITS.maxWidth}×{AI_LIMITS.maxHeight} px.
        </p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onApprove}
        className="btn-angular-primary !px-8 !py-2.5 !text-[11px] w-full"
      >
        Download & Enable Module
      </button>

      <p className="text-feldora-muted font-mono text-[9px] text-center">
        CDN: {LITERT_WASM_CDN}
      </p>
    </div>
  )
}
