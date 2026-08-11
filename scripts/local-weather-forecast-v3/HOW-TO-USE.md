# Local Weather Forecast V3 — Scripts

## Prerequisites

- Node.js 18+
- Dataset: `public/dataset/local-weather-forecast-v2-5/dataset.json` (shared with V2.5)

## Train Model

```bash
npx tsx scripts/local-weather-forecast-v3/model-generation.ts
```

- Single script handles: dataset prep → training → threshold tuning → evaluation → export
- Architecture: Shared MLP + Location Embedding (dim=8) + Temporal Encoding
- Hidden layers: [64, 32, 16] + ReLU + 4 Sigmoid heads
- Optimizer: Adam (lr=0.001)
- Early stopping: patience 15, monitors validation loss
- Time-based split: 2021-2023 train, 2024 val, 2025 test
- Output: `public/ai-models/local-weather-forecast-v3/model.json`

## Configuration

All hyperparameters are in the `CONFIG` object at the top of `model-generation.ts`:

```typescript
const CONFIG = {
  embeddingDim: 8,
  hiddenLayers: [64, 32, 16],
  learningRate: 0.001,
  batchSize: 64,
  maxEpochs: 200,
  earlyStoppingPatience: 15,
  seed: 42,
  thresholdMin: 0.20,
  thresholdMax: 0.70,
  thresholdStep: 0.05,
}
```

## Output

The script produces a single JSON artifact containing:
- Model weights (embedding + dense layers + output heads)
- Normalization statistics (mean/std from training split)
- Location vocabulary (city → index mapping)
- Tuned thresholds per slot
- Architecture configuration
- Training metadata

## Training Time

Estimated: 10-30 minutes depending on machine (pure TypeScript, single-threaded).
