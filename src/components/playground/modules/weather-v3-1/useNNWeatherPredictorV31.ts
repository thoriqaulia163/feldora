import { useState, useCallback, useRef } from 'react'
import type { NNModelV3, PredictionResultV3NN } from '~/lib/ml/nn-local-weather-forecast-v3'
import { predictNN, normalizeFeatures } from '~/lib/ml/nn-local-weather-forecast-v3'
import { buildRawFeatureVector, getLocationIdx } from './weatherUtilsV31'

type PredictorState = 'idle' | 'loading' | 'ready' | 'error'

interface PredictorHook {
  state: PredictorState
  error: string | null
  loadModel: () => Promise<void>
  predict: (
    cityName: string, enso: number, iod: number,
    prevDayRain: number, date: Date, tuned?: boolean,
  ) => PredictionResultV3NN | null
}

let cachedModel: NNModelV3 | null = null

export function useNNWeatherPredictorV31(): PredictorHook {
  const [state, setState] = useState<PredictorState>(cachedModel ? 'ready' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const loadModel = useCallback(async () => {
    if (cachedModel) { setState('ready'); return }
    if (loadingRef.current) return
    loadingRef.current = true
    setState('loading'); setError(null)
    try {
      const res = await fetch('/ai-models/local-weather-forecast-v3-1/model.json')
      if (!res.ok) throw new Error(`Failed to load model: HTTP ${res.status}`)
      cachedModel = await res.json()
      setState('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading model')
      setState('error')
    } finally { loadingRef.current = false }
  }, [])

  const predict = useCallback(
    (cityName: string, enso: number, iod: number, prevDayRain: number, date: Date, tuned: boolean = true): PredictionResultV3NN | null => {
      if (!cachedModel) return null
      const start = performance.now()
      const fv = buildRawFeatureVector(cityName, enso, iod, prevDayRain, date)
      if (!fv) return null
      const locationIdx = getLocationIdx(cachedModel, cityName)
      if (locationIdx === -1) return null
      const normalized = normalizeFeatures(fv.features, cachedModel.normalization)
      const slots = predictNN(cachedModel, normalized, locationIdx, tuned)
      const executionTime = performance.now() - start
      return { morning: slots[0], afternoon: slots[1], evening: slots[2], night: slots[3], executionTime, features: fv.featureMap }
    }, [],
  )

  return { state, error, loadModel, predict }
}
