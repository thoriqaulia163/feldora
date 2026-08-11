# Local Weather Forecast — V3 vs V3.3 Comparison Report

## Summary

V3.3 tests whether independent per-slot networks outperform V3's shared representation. Result: **No.** Shared representation (V3) is more efficient — same performance at 4× less storage.

---

## Architecture Comparison

| Aspect | V3 (Shared) | V3.3 (Independent) |
|--------|------|------|
| Structure | 1 shared backbone + 4 heads | 4 independent NNs |
| Embedding | 1 table (287×8) shared | 4 tables (287×8) independent |
| Hidden layers | [64, 32, 16] shared | [64, 32, 16] × 4 |
| Output | 4 heads (16→1 each) | 1 output per model (16→1) |
| Training | 1 model, 4 targets | 4 models, 1 target each |
| Model size | **63.9 KB** | 242.0 KB |

---

## Performance — Test Set (Year 2025)

### Standard Mode (threshold=0.5)

| Metric | V3 | V3.3 | Δ |
|--------|---:|---:|---:|
| **Accuracy** | **72.76%** | 72.68% | -0.08% |
| **Macro F1** | **60.30%** | 60.29% | -0.01% |
| Morning F1 | **60.5%** | 61.1% | +0.6% |
| Afternoon F1 | **65.6%** | 65.1% | -0.5% |
| Evening F1 | **63.4%** | 63.3% | -0.1% |
| Night F1 | **51.8%** | 51.6% | -0.2% |

### Sensitive Mode (tuned thresholds)

| Metric | V3 | V3.3 | Δ |
|--------|---:|---:|---:|
| Thresholds | [0.30, 0.55, 0.55, 0.30] | [0.35, 0.55, 0.525, 0.35] | — |
| **Accuracy** | 69.49% | **70.48%** | +0.99% |
| **Macro F1** | **64.16%** | 63.94% | -0.22% |
| Morning F1 | **65.5%** | **65.5%** | 0.0% |
| Afternoon F1 | 66.3% | 65.9% | -0.4% |
| Evening F1 | **63.9%** | 63.5% | -0.4% |
| Night F1 | **60.9%** | 60.8% | -0.1% |

---

## Efficiency

| | V3 | V3.3 |
|--|---:|---:|
| Model size | **63.9 KB** | 242.0 KB |
| Size ratio | 1× | 3.8× |
| Inference time | <1ms | <1ms |
| Macro F1 (Sensitive) | **64.16%** | 63.94% |
| F1 per KB | **1.004%/KB** | 0.264%/KB |

---

## Full Experiment Results Summary (V3 Family)

| Model | Architecture | Size | Macro F1 (Sens) | Verdict |
|-------|-------------|---:|---:|---------|
| **V3** | Shared MLP [64,32,16] emb=8 | **64 KB** | **64.16%** | **Winner** |
| V3.1 | Shared MLP [128,64,32] emb=16 | 180 KB | 64.08% | No improvement |
| V3.1+reg | V3.1 + dropout + weight decay | 180 KB | 63.95% | No improvement |
| V3.3 | 4× Independent MLP [64,32,16] | 242 KB | 63.94% | No improvement |

---

## Key Findings

1. **Shared representation wins**: V3's shared backbone captures cross-slot patterns efficiently. Independent networks do not benefit from slot-specific specialization.
2. **Information ceiling confirmed**: All V3 variants (~64% Macro F1) hit the same performance ceiling regardless of architecture, confirming the bottleneck is in features/data.
3. **V3 is Pareto-optimal**: Best F1 at smallest size. No larger variant justifies its extra storage.
4. **Experimental questions answered**:
   - *Is shared better than independent?* → **Yes** (same F1, 4× smaller)
   - *Does larger capacity help?* → **No** (V3.1)
   - *Does regularization help?* → **No** (V3.1+reg)
   - *Does slot specialization help?* → **No** (V3.3)

---

## Conclusion

V3 (Shared MLP, 64 KB) remains the best neural network variant for this task. The ~64% Macro F1 ceiling is a data/feature limitation — no architectural change can break through it without richer input features.

The V3 experiment series is complete. Future improvement requires:
- More informative features (humidity, pressure, wind — require API during dataset generation)
- Multi-day temporal patterns (sequence modeling)
- Larger/richer training data
