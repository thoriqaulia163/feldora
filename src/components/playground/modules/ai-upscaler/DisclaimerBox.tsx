import { AI_LIMITS } from './types'

export function DisclaimerBox() {
  return (
    <div className="w-full border border-amber-500/25 bg-amber-500/5 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 bg-amber-400 rotate-45 flex-shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
          Before you start
        </span>
      </div>
      <ul className="space-y-1.5 text-feldora-text-secondary text-xs leading-relaxed">
        <li>
          <span className="text-feldora-text">Model size ~4.1 MB</span> — downloaded once on first use,
          then available offline via browser cache.
        </li>
        <li>
          <span className="text-feldora-text">LiteRT runtime ~9 MB</span> — loaded from CDN on first use.
        </li>
        <li>
          <span className="text-feldora-text">4× upscale only</span> — fixed by model architecture
          (Real-ESRGAN x4v3).
        </li>
        <li>
          <span className="text-feldora-text">
            Max input: {AI_LIMITS.maxWidth}×{AI_LIMITS.maxHeight} px / {AI_LIMITS.maxFileSizeMB} MB
          </span>
        </li>
        <li>
          <span className="text-feldora-text">Processing time: 5–60 sec</span> — depends on image
          size and device GPU.
        </li>
        <li>
          AI may <span className="text-feldora-text">add detail that did not exist</span> in the
          original image (hallucination). Result is an AI interpretation, not an accurate
          reconstruction.
        </li>
      </ul>
    </div>
  )
}
