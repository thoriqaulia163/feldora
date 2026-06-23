import { useState, useCallback, useRef } from 'react'
import type { GBTModelV3, PredictionResultV3 } from '~/lib/ml/gbt-local-weather-forecast-v2-5'
import { predictGBT } from '~/lib/ml/gbt-local-weather-forecast-v2-5'

type PredictorState = 'idle' | 'loading' | 'ready' | 'error'

interface PredictorHook {
  state: PredictorState
  error: string | null
  loadModel: () => Promise<void>
  predict: (features: number[], featureMap: Record<string, number>, tuned?: boolean) => PredictionResultV3 | null
}

let cachedModel: GBTModelV3 | null = null

export function useLocalWeatherPredictorV3(): PredictorHook {
  const [state, setState] = useState<PredictorState>(cachedModel ? 'ready' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const loadModel = useCallback(async () => {
    if (cachedModel) { setState('ready'); return }
    if (loadingRef.current) return

    loadingRef.current = true
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/ai-models/local-weather-forecast-v2-5/model.json')
      if (!res.ok) throw new Error(`Failed to load model: HTTP ${res.status}`)
      cachedModel = await res.json()
      setState('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading model')
      setState('error')
    } finally {
      loadingRef.current = false
    }
  }, [])

  const predict = useCallback(
    (features: number[], featureMap: Record<string, number>, tuned: boolean = true): PredictionResultV3 | null => {
      if (!cachedModel) return null
      const start = performance.now()
      const slots = predictGBT(cachedModel, features, tuned)
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
