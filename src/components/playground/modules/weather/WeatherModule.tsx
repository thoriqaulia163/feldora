import { useState, useEffect } from 'react'
import { useLocalWeatherPredictor } from './useLocalWeatherPredictor'
import {
  buildFeatureVector,
  INDONESIA_CITIES,
  getSeasonLabel,
  getMonsoonLabel,
} from './weatherUtils'
import { PLAYGROUND_COPY } from '~/constants/copy'
import type { PredictionResult } from '~/lib/ml/types'

const COPY = PLAYGROUND_COPY.weather

const ENSO_OPTIONS = [
  { value: -1, label: 'La Nina' },
  { value: 0, label: 'Netral' },
  { value: 1, label: 'El Nino' },
]

const IOD_OPTIONS = [
  { value: -1, label: 'Negatif' },
  { value: 0, label: 'Netral' },
  { value: 1, label: 'Positif' },
]

export default function WeatherModule() {
  const { state: modelState, error: modelError, loadModel, predict } = useLocalWeatherPredictor()

  const [province, setProvince] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0] // YYYY-MM-DD
  })
  const [enso, setEnso] = useState(0)
  const [iod, setIod] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [predictState, setPredictState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [predictError, setPredictError] = useState<string | null>(null)

  // Auto-load model when module mounts
  useEffect(() => {
    loadModel()
  }, [loadModel])

  const handlePredict = () => {
    if (!province) return

    setPredictState('loading')
    setPredictError(null)
    setResult(null)

    // Use microtask to allow UI to update with loading state
    Promise.resolve().then(() => {
      try {
        const date = new Date(selectedDate + 'T00:00:00')
        const fv = buildFeatureVector(province, enso, iod, date)
        if (!fv) {
          setPredictError('Failed to build feature vector. Please check your inputs.')
          setPredictState('error')
          return
        }
        const r = predict(fv.features, fv.featureMap)
        if (!r) {
          setPredictError('Prediction failed. Model may not be loaded correctly.')
          setPredictState('error')
          return
        }
        setResult(r)
        setPredictState('success')
      } catch (err) {
        setPredictError(err instanceof Error ? err.message : 'An unexpected error occurred.')
        setPredictState('error')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Module Title */}
      <div className="flex items-center gap-3">
        <div className="diamond-marker !w-2.5 !h-2.5" />
        <h2 className="text-lg font-bold uppercase tracking-wider">{COPY.name}</h2>
      </div>

      {/* Model loading state */}
      {modelState === 'loading' && (
        <div className="card-polygon p-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-feldora-text-secondary text-sm">Loading model...</span>
          </div>
        </div>
      )}

      {modelState === 'error' && (
        <div className="card-polygon p-6 border-red-500/30">
          <p className="text-red-400 text-sm mb-3">{modelError}</p>
          <button onClick={loadModel} className="btn-angular-primary !px-4 !py-2 !text-[10px]">
            Retry
          </button>
        </div>
      )}

      {modelState === 'ready' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="card-polygon p-6 space-y-5">
            {/* Date */}
            <div>
              <label className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-2">
                {COPY.dateLabel}
              </label>
              <div
                className="relative w-full cursor-pointer"
                onClick={(e) => {
                  const input = (e.currentTarget as HTMLElement).querySelector('input')
                  input?.showPicker()
                }}
              >
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setResult(null); setPredictState('idle') }}
                  className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* City */}
            <div className="relative">
              <label className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-2">
                {COPY.provinceLabel}
              </label>
              <input
                type="text"
                value={citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value)
                  setShowCityDropdown(true)
                  if (province) { setProvince(''); setResult(null); setPredictState('idle') }
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder={COPY.provincePlaceholder}
                className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors"
              />
              {showCityDropdown && citySearch.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-feldora-surface border border-feldora-border/50 shadow-lg">
                  {INDONESIA_CITIES
                    .filter((c) =>
                      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
                      c.province.toLowerCase().includes(citySearch.toLowerCase())
                    )
                    .slice(0, 20)
                    .map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setProvince(c.name)
                          setCitySearch(c.name)
                          setShowCityDropdown(false)
                          setResult(null)
                          setPredictState('idle')
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-feldora-surface-light transition-colors"
                      >
                        <span className="text-feldora-text">{c.name}</span>
                        <span className="text-feldora-muted ml-2 text-xs">{c.province}</span>
                      </button>
                    ))}
                  {INDONESIA_CITIES.filter((c) =>
                    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
                    c.province.toLowerCase().includes(citySearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-feldora-muted text-xs">No cities found</div>
                  )}
                </div>
              )}
              {province && (
                <div className="mt-1 text-feldora-accent font-mono text-[10px]">
                  Selected: {province}
                </div>
              )}
            </div>

            {/* Advanced Settings Toggle */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-feldora-text-secondary text-xs font-bold uppercase tracking-wider hover:text-feldora-accent transition-colors"
              >
                <span
                  className="inline-block transition-transform duration-200"
                  style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  ▸
                </span>
                {COPY.advancedLabel}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-feldora-border/30">
                  {/* ENSO */}
                  <div>
                    <label className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-2">
                      {COPY.ensoLabel}
                    </label>
                    <select
                      value={enso}
                      onChange={(e) => { setEnso(Number(e.target.value)); setResult(null); setPredictState('idle') }}
                      className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors"
                    >
                      {ENSO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* IOD */}
                  <div>
                    <label className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-2">
                      {COPY.iodLabel}
                    </label>
                    <select
                      value={iod}
                      onChange={(e) => { setIod(Number(e.target.value)); setResult(null); setPredictState('idle') }}
                      className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors"
                    >
                      {IOD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={!province || predictState === 'loading'}
              className="btn-angular-primary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {COPY.predictButton}
            </button>
          </div>

          {/* Result Panel */}
          <div className="card-polygon p-6">
            {predictState === 'idle' && (
              <div className="h-full flex items-center justify-center min-h-[200px]">
                <p className="text-feldora-muted font-mono text-xs uppercase tracking-wider text-center">
                  Select a province and click Predict
                </p>
              </div>
            )}

            {predictState === 'loading' && (
              <div className="h-full flex flex-col items-center justify-center min-h-[200px] gap-3">
                <div className="w-5 h-5 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-feldora-text-secondary font-mono text-xs uppercase tracking-wider">
                  Predicting...
                </p>
              </div>
            )}

            {predictState === 'error' && (
              <div className="h-full flex flex-col items-center justify-center min-h-[200px] gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-400 text-lg">
                  !
                </div>
                <p className="text-red-400 text-sm text-center max-w-xs">
                  {predictError}
                </p>
                <button
                  onClick={handlePredict}
                  className="btn-angular-primary !px-4 !py-2 !text-[10px]"
                >
                  Retry
                </button>
              </div>
            )}

            {predictState === 'success' && result && (
              <div className="space-y-6">
                {/* Prediction Result */}
                <div>
                  <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-3">
                    {COPY.resultTitle}
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center text-lg ${
                        result.prediction === 1
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {result.prediction === 1 ? '🌧' : '☀'}
                    </div>
                    <span className="text-2xl font-bold uppercase tracking-wide">
                      {result.prediction === 1 ? COPY.rainLabel : COPY.noRainLabel}
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-2">
                    {COPY.confidenceLabel}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-feldora-surface-light overflow-hidden">
                      <div
                        className="h-full bg-feldora-accent transition-all duration-500"
                        style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span className="text-feldora-text font-mono text-sm font-bold">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Execution Time */}
                <div>
                  <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-1">
                    {COPY.executionTimeLabel}
                  </span>
                  <span className="text-feldora-accent font-mono text-sm">
                    {result.executionTime < 1
                      ? `${(result.executionTime * 1000).toFixed(0)} μs`
                      : `${result.executionTime.toFixed(2)} ms`}
                  </span>
                </div>

                {/* Features Used */}
                <div>
                  <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block mb-3">
                    {COPY.featuresTitle}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.features).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center bg-feldora-surface-light/50 border border-feldora-border/20 px-3 py-1.5"
                      >
                        <span className="text-feldora-text-secondary font-mono text-[10px] uppercase">
                          {key === 'localSeasonIndex'
                            ? 'season'
                            : key === 'monsoonZone'
                              ? 'monsoon'
                              : key}
                        </span>
                        <span className="text-feldora-text font-mono text-xs font-bold">
                          {key === 'localSeasonIndex'
                            ? getSeasonLabel(value)
                            : key === 'monsoonZone'
                              ? getMonsoonLabel(value)
                              : key === 'enso'
                                ? ENSO_OPTIONS.find((o) => o.value === value)?.label ?? value
                                : key === 'iod'
                                  ? IOD_OPTIONS.find((o) => o.value === value)?.label ?? value
                                  : typeof value === 'number' && !Number.isInteger(value)
                                    ? value.toFixed(2)
                                    : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box — below main content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* About */}
        <div className="bg-feldora-surface border border-feldora-border/30 p-5 clip-notch-br">
          <div className="flex items-center gap-2 mb-3">
            <div className="hex-badge w-5 h-5 text-[8px] font-bold text-white">i</div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-feldora-text">About</h4>
          </div>
          <div className="text-feldora-text-secondary text-xs leading-relaxed space-y-2">
            <p>
              This module uses a <span className="text-feldora-text">Random Forest</span> model (40 decision trees, max depth 6) trained on historical precipitation data from <span className="text-feldora-text">Open-Meteo</span> covering 514 Indonesian cities between 2021–2025.
            </p>
            <p>
              The model considers geographic features (latitude, longitude, elevation), temporal patterns (day of year, local season), monsoon zone classification, and large-scale climate drivers (ENSO and IOD phases) to predict whether significant rainfall (&gt;5mm) will occur.
            </p>
            <p>
              Designed with an offline-first philosophy — once loaded, predictions run entirely in-browser with zero network requests, making it usable on any device regardless of connectivity.
            </p>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-feldora-surface border border-feldora-border/30 p-5 clip-notch-br">
          <div className="flex items-center gap-2 mb-3">
            <div className="hex-badge w-5 h-5 text-[8px] font-bold text-white">?</div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-feldora-text">How to Use</h4>
          </div>
          <ol className="space-y-2 text-feldora-text-secondary text-xs leading-relaxed list-decimal pl-4">
            <li>Pick a <span className="text-feldora-text">date</span> — defaults to today, change freely</li>
            <li>Search for a <span className="text-feldora-text">city</span> — type city name or province, select from dropdown</li>
            <li>Optionally open <span className="text-feldora-text">Advanced Settings</span> to set ENSO phase (El Nino/La Nina) and IOD (Indian Ocean Dipole)</li>
            <li>Click <span className="text-feldora-text">Predict</span></li>
            <li>Result shows: <span className="text-feldora-text">Rain/No Rain</span>, confidence %, execution time, and all features used for inference</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
