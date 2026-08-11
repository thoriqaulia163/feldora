import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useNNWeatherPredictorV33 } from './useNNWeatherPredictorV33'
import { INDONESIA_CITIES, TIME_SLOT_LABELS, WEATHER_DISPLAY } from './weatherUtilsV33'
import { PLAYGROUND_COPY } from '~/constants/copy'
import type { PredictionResultV33, SlotPredictionV33 } from '~/lib/ml/nn-local-weather-forecast-v3-3'

const COPY = PLAYGROUND_COPY.weatherV3_3

const ENSO_OPTIONS = [{ value: -1, label: 'La Nina' }, { value: 0, label: 'Netral' }, { value: 1, label: 'El Nino' }]
const IOD_OPTIONS = [{ value: -1, label: 'Negatif' }, { value: 0, label: 'Netral' }, { value: 1, label: 'Positif' }]
const PREV_WEATHER_OPTIONS = [{ value: 0, label: 'Tidak hujan' }, { value: 1, label: 'Hujan' }]

export default function WeatherModuleV33() {
  const { state: modelState, error: modelError, loadModel, predict } = useNNWeatherPredictorV33()
  const [citySearch, setCitySearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [enso, setEnso] = useState(0)
  const [iod, setIod] = useState(0)
  const [prevDayRain, setPrevDayRain] = useState(0)
  const [useTuned, setUseTuned] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<PredictionResultV33 | null>(null)
  const [predictState, setPredictState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [predictError, setPredictError] = useState<string | null>(null)

  useEffect(() => { loadModel() }, [loadModel])

  const handlePredict = () => {
    if (!selectedCity) return
    setPredictState('loading'); setPredictError(null); setResult(null)
    Promise.resolve().then(() => {
      try {
        const date = new Date(selectedDate + 'T00:00:00')
        const r = predict(selectedCity, enso, iod, prevDayRain, date, useTuned)
        if (!r) { setPredictError('Prediction failed.'); setPredictState('error'); return }
        setResult(r); setPredictState('success')
      } catch (err) { setPredictError(err instanceof Error ? err.message : 'Error'); setPredictState('error') }
    })
  }

  return (
    <div className="space-y-8">
      <Link to="/playground" className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group">
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span> Back to modules
      </Link>
      <div className="flex items-center gap-3">
        <div className="diamond-marker !w-2.5 !h-2.5" />
        <h2 className="text-lg font-bold uppercase tracking-wider">{COPY.name}</h2>
      </div>

      {modelState === 'loading' && (<div className="card-polygon p-6"><div className="flex items-center gap-3"><div className="w-4 h-4 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" /><span className="text-feldora-text-secondary text-sm">Loading model...</span></div></div>)}
      {modelState === 'error' && (<div className="card-polygon p-6 border-red-500/30"><p className="text-red-400 text-sm mb-3">{modelError}</p><button onClick={loadModel} className="btn-angular-primary !px-4 !py-2 !text-[10px]">Retry</button></div>)}

      {modelState === 'ready' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-polygon p-6 space-y-5">
            <div>
              <label className="text-feldora-text font-mono text-[10px] uppercase tracking-wider block mb-2">{COPY.dateLabel}</label>
              <div className="relative w-full cursor-pointer" role="group" aria-label="Date picker" onClick={(e) => { (e.currentTarget as HTMLElement).querySelector('input')?.showPicker() }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (e.currentTarget as HTMLElement).querySelector('input')?.showPicker() }}>
                <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setResult(null); setPredictState('idle') }} className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors cursor-pointer [color-scheme:dark]" />
              </div>
            </div>
            <div className="relative">
              <label className="text-feldora-text font-mono text-[10px] uppercase tracking-wider block mb-2">{COPY.cityLabel}</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-feldora-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                <input type="text" value={citySearch} onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); if (selectedCity) { setSelectedCity(''); setResult(null); setPredictState('idle') } }} onFocus={() => setShowCityDropdown(true)} placeholder={COPY.cityPlaceholder} className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm pl-10 pr-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors" />
              </div>
              {showCityDropdown && citySearch.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-feldora-surface border border-feldora-border/50 shadow-lg">
                  {INDONESIA_CITIES.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.province.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 20).map(c => (
                    <button key={c.name} type="button" onClick={() => { setSelectedCity(c.name); setCitySearch(c.name); setShowCityDropdown(false); setResult(null); setPredictState('idle') }} className="w-full text-left px-3 py-2 text-sm hover:bg-feldora-surface-light transition-colors">
                      <span className="text-feldora-text">{c.name}</span><span className="text-feldora-muted ml-2 text-xs">{c.province}</span>
                    </button>
                  ))}
                  {INDONESIA_CITIES.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()) || c.province.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (<div className="px-3 py-2 text-feldora-muted text-xs">No cities found</div>)}
                </div>
              )}
              {selectedCity && <div className="mt-1 text-feldora-accent font-mono text-[10px]">Selected: {selectedCity}</div>}
            </div>
            <div>
              <label className="text-feldora-text font-mono text-[10px] uppercase tracking-wider block mb-2">{COPY.prevDayLabel}</label>
              <select value={prevDayRain} onChange={(e) => { setPrevDayRain(Number(e.target.value)); setResult(null); setPredictState('idle') }} className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors">
                {PREV_WEATHER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="mt-1.5 text-feldora-muted text-[10px] leading-relaxed">Apakah kemarin hujan di kota ini?</p>
            </div>

            <div>
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-feldora-text-secondary text-xs font-bold uppercase tracking-wider hover:text-feldora-accent transition-colors">
                <span className="inline-block transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)' }}>▸</span>{COPY.advancedLabel}
              </button>
              {showAdvanced && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-feldora-border/30">
                  <div><label className="text-feldora-text font-mono text-[10px] uppercase tracking-wider block mb-2">{COPY.ensoLabel}</label><select value={enso} onChange={(e) => { setEnso(Number(e.target.value)); setResult(null); setPredictState('idle') }} className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors">{ENSO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label className="text-feldora-text font-mono text-[10px] uppercase tracking-wider block mb-2">{COPY.iodLabel}</label><select value={iod} onChange={(e) => { setIod(Number(e.target.value)); setResult(null); setPredictState('idle') }} className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm px-3 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors">{IOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                </div>
              )}
            </div>
            <button onClick={handlePredict} disabled={!selectedCity || predictState === 'loading'} className="btn-angular-primary w-full !py-3 disabled:opacity-40 disabled:cursor-not-allowed">{COPY.predictButton}</button>
            <div className="flex items-center justify-between pt-2 border-t border-feldora-border/20">
              <span className="text-feldora-text font-mono text-[10px] uppercase tracking-wider">Mode</span>
              <button onClick={() => { setUseTuned(!useTuned); setResult(null); setPredictState('idle') }} className={`relative w-[88px] h-7 rounded-full border transition-colors duration-300 ${useTuned ? 'bg-feldora-accent-secondary/20 border-feldora-accent-secondary' : 'bg-feldora-surface-light border-feldora-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 ${useTuned ? 'translate-x-[60px] bg-feldora-accent-secondary' : 'translate-x-0 bg-feldora-text'}`} />
                <span className={`absolute inset-0 flex items-center font-mono text-[9px] uppercase tracking-wider ${useTuned ? 'justify-start pl-2 text-feldora-accent-secondary' : 'justify-end pr-2 text-feldora-text'}`}>{useTuned ? 'Sens' : 'Std'}</span>
              </button>
            </div>
          </div>

          <div className="card-polygon p-6">
            {predictState === 'idle' && <div className="h-full flex items-center justify-center min-h-[200px]"><p className="text-feldora-muted font-mono text-xs uppercase tracking-wider text-center">{COPY.idleMessage}</p></div>}
            {predictState === 'loading' && <div className="h-full flex flex-col items-center justify-center min-h-[200px] gap-3"><div className="w-5 h-5 border-2 border-feldora-accent border-t-transparent rounded-full animate-spin" /><p className="text-feldora-text-secondary font-mono text-xs uppercase tracking-wider">Predicting...</p></div>}
            {predictState === 'error' && <div className="h-full flex flex-col items-center justify-center min-h-[200px] gap-4"><div className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-400 text-lg">!</div><p className="text-red-400 text-sm text-center max-w-xs">{predictError}</p><button onClick={handlePredict} className="btn-angular-primary !px-4 !py-2 !text-[10px]">Retry</button></div>}
            {predictState === 'success' && result && (
              <div className="space-y-5">
                <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider block">{COPY.resultTitle}</span>
                <div className="space-y-3">
                  {TIME_SLOT_LABELS.map((slot) => { const pred = result[slot.key as keyof PredictionResultV33] as SlotPredictionV33; const display = WEATHER_DISPLAY[pred.categoryIndex]; return (
                    <div key={slot.key} className={`flex items-center gap-3 p-3 border transition-colors ${pred.categoryIndex === 1 ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30' : 'bg-feldora-surface-light/50 border-feldora-border/30 hover:border-feldora-accent/20'}`}>
                      <div className="w-14 shrink-0"><span className="text-feldora-text text-xs font-bold uppercase tracking-wider block">{slot.label}</span><span className="text-feldora-muted text-[9px] font-mono">{slot.range}</span></div>
                      <div className="flex items-center gap-2 flex-1 min-w-0"><span className="text-lg leading-none">{display.icon}</span><span className={`text-sm font-semibold ${display.color}`}>{display.label}</span></div>
                      <div className="flex items-center gap-2 shrink-0"><div className="w-16 h-1.5 bg-feldora-border/50 overflow-hidden"><div className={`h-full transition-all duration-500 ${pred.categoryIndex === 1 ? 'bg-blue-400' : 'bg-feldora-accent'}`} style={{ width: `${Math.round(pred.confidence * 100)}%` }} /></div><span className="text-feldora-text-secondary font-mono text-[10px] w-8 text-right">{Math.round(pred.confidence * 100)}%</span></div>
                    </div>
                  )})}
                </div>
                <div className="pt-3 border-t border-feldora-border/30"><div className="flex items-center justify-between"><span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">{COPY.executionTimeLabel}</span><span className="text-feldora-text-secondary font-mono text-xs">{result.executionTime < 1 ? `${(result.executionTime * 1000).toFixed(0)}μs` : `${result.executionTime.toFixed(2)}ms`}</span></div></div>
              </div>
            )}
          </div>
        </div>
      )}

      {modelState === 'ready' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-polygon p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{COPY.howToUseTitle}</h3>
            <ol className="space-y-2 text-feldora-text-secondary text-sm list-decimal list-inside">
              {COPY.howToUseSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div className="card-polygon p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{COPY.aboutTitle}</h3>
            <div className="space-y-3 text-feldora-text-secondary text-sm leading-relaxed">
              <p>{COPY.aboutDescription}</p>
              <p>{COPY.aboutFeatures}</p>
              <div className="mt-4 p-3 bg-feldora-surface-light border border-amber-500/20">
                <p className="text-amber-400/90 text-xs font-mono uppercase tracking-wider mb-1">Disclaimer</p>
                <p className="text-feldora-muted text-xs leading-relaxed">{COPY.disclaimer}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
