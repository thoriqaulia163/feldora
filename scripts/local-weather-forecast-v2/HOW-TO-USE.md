# Local Weather Forecast V2 — Scripts

## Prerequisites

- Node.js 18+
- `tsx` (bundled via npx)

## 1. Dataset Extraction

Fetches hourly `weather_code` from Open-Meteo Historical Archive for 514 Indonesian cities, then aggregates into 4 time slots using majority vote.

```bash
npx tsx scripts/local-weather-forecast-v2/dataset-extract.ts --start 2021 --end 2025
```

**Output:** `public/dataset/local-weather-forecast-v2/dataset.json`

**Notes:**
- Concurrency: 5 parallel requests
- Resume: re-run to retry failed cities (completed cities are skipped)
- Batch size: 10 cities per batch (hourly data is larger than daily)
- Expect ~30-60 minutes for full 514 cities × 5 years

## 2. Model Generation

Trains a multi-output Random Forest (50 trees, max depth 8) and evaluates per-slot metrics.

```bash
npx tsx scripts/local-weather-forecast-v2/model-generation.ts
```

**Input:** `public/dataset/local-weather-forecast-v2/dataset.json`
**Output:** `public/ai-models/local-weather-forecast-v2/model.json`

**Notes:**
- Deterministic (seed 42)
- Displays per-slot accuracy, F1, confusion matrix
- Target: 60-70% accuracy per slot
- Model size: estimated ~250-400 KB

## Architecture

- Multi-output: one model, 4 outputs (morning/afternoon/evening/night)
- Multiclass: 5 categories (Cerah/Berawan/Gerimis/Hujan/Badai)
- Split criterion: averaged Gini impurity across all 4 slots
- Each leaf stores majority class per slot
- Prediction: majority vote across all trees per slot
