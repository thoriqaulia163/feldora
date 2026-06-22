import { useState, useCallback, useRef } from 'react'
import type { SerializedModelV2, PredictionResultV2 } from '~/lib/ml/typesV2'
import { predictV2 } from '~/lib/ml/randomForestV2'

type PredictorState = 'idle' | 'loading' | 'ready' | 'error'

interface PredictorHook {
  state: PredictorState
  error: string | null
  loadModel: () => Promise<void>
  predict: (features: number[], featureMap: Record<string, number>) => PredictionResultV2 | null
}

// Singleton — model stays in memory once loaded
let cachedModel: SerializedModelV2 | null = null

export function useLocalWeatherPredictorV2(): PredictorHook {
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
      const res = await fetch('/ai-models/local-weather-forecast-v2/model.json')
      if (!res.ok) throw new Error(`Failed to load model: HTTP ${res.status}`)
      const model: SerializedModelV2 = await res.json()
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
    (features: number[], featureMap: Record<string, number>): PredictionResultV2 | null => {
      if (!cachedModel) return null

      const start = performance.now()
      const slots = predictV2(cachedModel, features)
      const executionTime = performance.now() - start

      return {
        morning: slots[0],
        afternoon: slots[1],
        evening: slots[2],
        night: slots[3],
        executionTime,
        features: featureMap,
      }
    },
    []
  )

  return { state, error, loadModel, predict }
}
