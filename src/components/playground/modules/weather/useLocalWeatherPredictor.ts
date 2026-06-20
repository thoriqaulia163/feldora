import { useState, useCallback, useRef } from 'react'
import type { SerializedModel, PredictionResult } from '~/lib/ml/types'

type PredictorState = 'idle' | 'loading' | 'ready' | 'error'

interface PredictorHook {
  state: PredictorState
  error: string | null
  loadModel: () => Promise<void>
  predict: (features: number[], featureMap: Record<string, number>) => PredictionResult | null
}

// Singleton — model stays in memory once loaded
let cachedModel: SerializedModel | null = null

export function useLocalWeatherPredictor(): PredictorHook {
  const [state, setState] = useState<PredictorState>(cachedModel ? 'ready' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const loadModel = useCallback(async () => {
    if (cachedModel) {
      setState('ready')
      return
    }
    if (loadingRef.current) return

    loadingRef.current = true
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/ai-models/local-weather-forecast/model.json')
      if (!res.ok) throw new Error(`Failed to load model: HTTP ${res.status}`)
      const model: SerializedModel = await res.json()
      cachedModel = model
      setState('ready')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error loading model'
      setError(msg)
      setState('error')
    } finally {
      loadingRef.current = false
    }
  }, [])

  const predict = useCallback(
    (features: number[], featureMap: Record<string, number>): PredictionResult | null => {
      if (!cachedModel) return null

      const start = performance.now()

      // Inline prediction (no function call overhead for speed)
      let totalConfidence = 0
      for (const tree of cachedModel.trees) {
        let node = tree.root
        while (node && node.f !== -1) {
          node = (features[node.f] <= node.t ? node.l : node.r)!
        }
        totalConfidence += node?.c ?? 0.5
      }

      const avgConfidence = totalConfidence / cachedModel.trees.length
      const prediction: 0 | 1 = avgConfidence >= 0.5 ? 1 : 0
      const confidence = prediction === 1 ? avgConfidence : 1 - avgConfidence

      const executionTime = performance.now() - start

      return {
        prediction,
        confidence,
        executionTime,
        features: featureMap,
      }
    },
    []
  )

  return { state, error, loadModel, predict }
}
