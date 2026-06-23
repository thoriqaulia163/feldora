# Local Weather Forecast V3 — Scripts

## Prerequisites

- Node.js 18+
- Dataset: copy from V2 (`public/dataset/local-weather-forecast-v2/dataset.json` → `public/dataset/local-weather-forecast-v3/dataset.json`)

## 1. Copy Dataset

```bash
mkdir -p public/dataset/local-weather-forecast-v3
cp public/dataset/local-weather-forecast-v2/dataset.json public/dataset/local-weather-forecast-v3/dataset.json
```

## 2. Train Model

```bash
npx tsx scripts/local-weather-forecast-v3/model-generation.ts
```

- 4 parallel workers (one per time slot)
- GBT: 100 trees × depth 4 × learning rate 0.1
- 12 features (9 base + sinDay + cosDay + dayLength)
- Training time: ~5-10 min
- Output: `public/ai-models/local-weather-forecast-v3/model.json`

## 3. Threshold Tuning

```bash
npx tsx scripts/local-weather-forecast-v3/threshold-tune.ts
```

- No retrain needed
- Sweeps thresholds 0.15–0.60 per slot
- Updates model.json with optimal thresholds
